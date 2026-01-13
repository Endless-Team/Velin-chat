import { ref, computed, onUnmounted } from "vue";
import { firebaseMessaging } from "../services/firebaseMessaging";
import { auth } from "../firebase";
import type { Message, Chat } from "../types/chat.types";
import { keyStore } from "../stores/keyStore";
import messageEncryptionService, {
  EncryptedMessage,
} from "../services/messageEncryptionService";

export function useEncryptedChat() {
  const chats = ref<Chat[]>([]);
  const messages = ref<Map<string, Message[]>>(new Map());
  const selectedChatId = ref<string | null>(null);
  const messageUnsubscribers = ref<Map<string, () => void>>(new Map());

  const selectedChat = computed(() => {
    if (!selectedChatId.value) return null;
    return chats.value.find((c) => c.id === selectedChatId.value);
  });

  const currentMessages = computed(() => {
    if (!selectedChatId.value) return [];
    return messages.value.get(selectedChatId.value) || [];
  });

  /**
   * Carica le chat dell'utente da Firebase
   */
  async function loadUserChats(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("Utente non autenticato");
        return;
      }

      console.log("📥 Caricamento chat da Firebase...");
      const userChats = await firebaseMessaging.loadUserChats(currentUser.uid);
      chats.value = userChats;
      console.log(`✅ ${userChats.length} chat caricate`);
    } catch (error) {
      console.error("Errore nel caricamento delle chat:", error);
    }
  }

  /**
   * Invia un messaggio cifrato con le chiavi reali (E2E)
   */
  async function sendEncryptedMessage(
  chatId: string,
  text: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('❌ Utente non autenticato');
    throw new Error('Utente non autenticato');
  }

  const chat = chats.value.find(c => c.id === chatId);
  if (!chat) {
    console.error('❌ Chat non trovata');
    throw new Error('Chat non trovata');
  }

  const recipientId = chat.participants?.find(id => id !== currentUser.uid);
  if (!recipientId) {
    console.error('❌ Destinatario non trovato');
    throw new Error('Destinatario non trovato');
  }

  const recipientPublicKeyString = chat.publicKeys?.[recipientId];
  if (!recipientPublicKeyString) {
    console.error('❌ Chiave pubblica del destinatario non trovata');
    throw new Error('Chiave pubblica del destinatario non trovata. Assicurati che l\'utente abbia generato le proprie chiavi.');
  }

  let recipientPublicKeyJwk: JsonWebKey;
  try {
    recipientPublicKeyJwk = JSON.parse(recipientPublicKeyString);
  } catch (e) {
    console.error('❌ Errore nel parsing della chiave pubblica:', e);
    throw new Error('Chiave pubblica destinatario non valida');
  }

  console.log('📤 Invio messaggio cifrato:', {chatId, textLength: text.length, recipientId});

  // Cifra il messaggio con la chiave pubblica del destinatario
  const encryptedPayload = await messageEncryptionService.encryptMessage(
    text,
    recipientPublicKeyJwk
  );

  try {
    // ✅ MODIFICATO: Invia anche il plainText per il mittente
    await firebaseMessaging.sendMessage(
      chatId,
      currentUser.uid,
      recipientId,
      encryptedPayload.encryptedContent,
      encryptedPayload.encryptedAesKey,
      encryptedPayload.iv,
      text // ✅ AGGIUNTO: passa il testo in chiaro
    );
    
    console.log('✅ Messaggio inviato a Firebase');
  } catch (error) {
    console.error('❌ Errore nell\'invio del messaggio:', error);
    throw error;
  }
}

  /**
   * Seleziona una chat e carica i messaggi
   */
  async function selectChat(chatId: string): Promise<void> {
    try {
      selectedChatId.value = chatId;

      const chat = chats.value.find((c) => c.id === chatId);
      if (chat) {
        chat.unread = 0;
      }

      // Disconnect previous listener if exists
      const previousUnsubscriber = messageUnsubscribers.value.get(chatId);
      if (previousUnsubscriber) {
        previousUnsubscriber();
      }

      // Carica messaggi esistenti
      await loadChatMessages(chatId);

      // Sottoscrivi ai nuovi messaggi in tempo reale
      const unsubscribe = firebaseMessaging.subscribeToMessages(
        chatId,
        (firebaseMessages) => {
          handleNewMessages(chatId, firebaseMessages);
        }
      );

      messageUnsubscribers.value.set(chatId, unsubscribe);
    } catch (error) {
      console.error("Errore nella selezione della chat:", error);
    }
  }

  /**
   * Converte messaggi Firebase in formato app
   */
  async function convertFirebaseMessages(
    chatId: string,
    firebaseMessages: any[]
  ): Promise<Message[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const privateKey = keyStore.getPrivateKey();

    if (!privateKey) {
      console.warn(
        "🔐 Chiave privata non disponibile, impossibile decifrare i messaggi"
      );
      return firebaseMessages.map((msg) => ({
        id: msg.id,
        chatId,
        senderId: msg.senderId,
        text: "Messaggio non decifrabile (chiavi bloccate)",
        sent: msg.senderId === currentUser.uid,
        timestamp: formatTimestamp(msg.timestamp),
        status: msg.status || "delivered",
      }));
    }

    const decryptedMessages: Message[] = [];

    for (const msg of firebaseMessages) {
      let text = "Messaggio non decifrabile";

      // ✅ AGGIUNTO: Se il messaggio è tuo, NON decifrarlo
      const isSentByMe = msg.senderId === currentUser.uid;

      try {
        if (msg.encryptedContent && msg.encryptedAesKey && msg.iv) {
          if (isSentByMe) {
            // ✅ Messaggi inviati da te: usa il testo in chiaro salvato
            text = msg.plainText || "Messaggio inviato";
          } else {
            // ✅ Messaggi ricevuti: decifra con la tua chiave privata
            const decrypted = await messageEncryptionService.decryptMessage(
              {
                encryptedContent: msg.encryptedContent,
                encryptedAesKey: msg.encryptedAesKey,
                iv: msg.iv,
              } as EncryptedMessage,
              privateKey
            );
            text = decrypted.content;
          }
        } else if (msg.text) {
          // Fallback per eventuali messaggi legacy salvati in chiaro
          text = msg.text;
        }
      } catch (e) {
        console.error("❌ Errore nella decifratura del messaggio:", e);
        // Se è un messaggio ricevuto e non si riesce a decifrare
        if (!isSentByMe) {
          text = "Errore decifratura";
        }
      }

      decryptedMessages.push({
        id: msg.id,
        chatId,
        senderId: msg.senderId,
        text,
        sent: isSentByMe,
        timestamp: formatTimestamp(msg.timestamp),
        status: msg.status || "delivered",
      });
    }

    return decryptedMessages;
  }

  /**
   * Carica messaggi di una chat da Firebase
   */
  async function loadChatMessages(chatId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      console.log("📥 Caricamento messaggi per chat:", chatId);

      const firebaseMessages = await firebaseMessaging.loadChatMessages(chatId);
      const chatMessages = await convertFirebaseMessages(
        chatId,
        firebaseMessages
      );

      messages.value.set(chatId, chatMessages);
      console.log(`✅ ${chatMessages.length} messaggi caricati`);
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error);
    }
  }

  /**
   * Gestisce nuovi messaggi dal listener real-time
   */
  async function handleNewMessages(
    chatId: string,
    firebaseMessages: any[]
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const chatMessages = await convertFirebaseMessages(
        chatId,
        firebaseMessages
      );
      messages.value.set(chatId, chatMessages);

      // Aggiorna ultimo messaggio nella chat
      if (chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        const chat = chats.value.find((c) => c.id === chatId);
        if (chat) {
          chat.lastMessage = lastMsg.text;
          chat.timestamp = lastMsg.timestamp;

          // Incrementa unread se non è la chat selezionata e non è mio
          if (selectedChatId.value !== chatId && !lastMsg.sent) {
            chat.unread++;
          }
        }
      }
    } catch (error) {
      console.error("Errore nella gestione nuovi messaggi:", error);
    }
  }

  /**
   * Crea una nuova chat con un utente usando l'UID direttamente
   */
  async function createChatWithUser(
    otherUserId: string
  ): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ Utente non autenticato");
      throw new Error("Utente non autenticato");
    }

    try {
      // Verifica che l'utente esista
      const otherUserDoc = await firebaseMessaging.getUserDoc(otherUserId);
      if (!otherUserDoc) {
        console.error("❌ Utente non trovato");
        throw new Error("Utente non trovato");
      }

      // Crea o recupera chat
      const chatId = await firebaseMessaging.getOrCreateDirectChat(
        currentUser.uid,
        otherUserId
      );

      // Ricarica le chat
      await loadUserChats();

      return chatId;
    } catch (error) {
      console.error("Errore nella creazione della chat:", error);
      throw error;
    }
  }

  /**
   * Formatta timestamp
   */
  function formatTimestamp(timestamp: any): string {
    if (!timestamp) return "Ora";

    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Ora";
    }
  }

  /**
   * Pulisci i listener quando il composable viene distrutto
   */
  onUnmounted(() => {
    messageUnsubscribers.value.forEach((unsubscribe) => unsubscribe());
    messageUnsubscribers.value.clear();
  });

  /**
   * Pulisci i messaggi di una chat
   */
  function clearChatMessages(chatId: string): void {
    messages.value.delete(chatId);
    const unsubscribe = messageUnsubscribers.value.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      messageUnsubscribers.value.delete(chatId);
    }
  }

  return {
    chats,
    selectedChat,
    currentMessages,
    selectedChatId,
    loadUserChats,
    sendEncryptedMessage,
    selectChat,
    createChatWithUser,
    clearChatMessages,
  };
}
