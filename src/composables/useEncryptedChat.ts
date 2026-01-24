import { ref, computed, onUnmounted } from "vue";
import { firebaseMessaging } from "../services/firebaseMessaging";
import { auth, db } from "../firebase";
import type { Message, Chat } from "../types/chat.types";
import { keyStore } from "../stores/keyStore";
import messageEncryptionService, {
  EncryptedMessage,
} from "../services/messageEncryptionService";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Composable che gestisce una chat end-to-end encrypted (E2E) basata su:
 * - Firestore per persistenza e real-time updates
 * - Chiavi pubbliche/privata (keyStore) per cifrare/decifrare
 * - Stato locale reattivo (liste chat, messaggi per chat, selezione corrente)
 *
 * @returns API del composable (stato + metodi operativi).
 */
export function useEncryptedChat() {
  /**
   * Lista delle chat disponibili per l’utente corrente.
   */
  const chats = ref<Chat[]>([]);

  /**
   * Mappa chatId -> array di messaggi (formato app).
   * Nota: tenere una mappa evita di mischiare messaggi di chat diverse.
   */
  const messages = ref<Map<string, Message[]>>(new Map());

  /**
   * chatId selezionata (oppure null se nessuna chat è aperta).
   */
  const selectedChatId = ref<string | null>(null);

  /**
   * Mappa chatId -> funzione per disiscriversi al listener real-time.
   * Serve per evitare duplicazione di listener e memory leak.
   */
  const messageUnsubscribers = ref<Map<string, () => void>>(new Map());

  /**
   * Chat attualmente selezionata (oggetto Chat completo) oppure null.
   */
  const selectedChat = computed(() => {
    if (!selectedChatId.value) return null;
    return chats.value.find((c) => c.id === selectedChatId.value);
  });

  /**
   * Messaggi relativi alla chat selezionata (selezione nulla => array vuoto).
   */
  const currentMessages = computed(() => {
    if (!selectedChatId.value) return [];
    return messages.value.get(selectedChatId.value) || [];
  });

  /**
   * Decifra l'ultimo messaggio associato a una chat (preview / lista chat).
   *
   * - Se l’utente non è autenticato: ritorna un placeholder.
   * - Se la keychain non è sbloccata (manca privateKey): ritorna un placeholder.
   * - Se non esiste lastMessageData: usa lastMessage in chiaro (se presente).
   *
   * @param chat Chat da cui leggere lastMessageData/lastMessage.
   * @returns Contenuto decifrato (o placeholder se non disponibile).
   */
  async function decryptLastMessage(chat: Chat): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) return "🔒 Messaggio cifrato";

    const privateKey = keyStore.getPrivateKey();
    if (!privateKey) return "🔒 Sblocca per vedere";

    try {
      if (!chat.lastMessageData) {
        return chat.lastMessage || "";
      }

      const isSentByMe = chat.lastMessageData.senderId === currentUser.uid;

      let encryptedData: EncryptedMessage;

      // Se l’ultimo messaggio è mio, uso i campi “Sender” (cifrati per me stesso).
      if (isSentByMe) {
        encryptedData = {
          encryptedContent: chat.lastMessageData.encryptedContentSender,
          encryptedAesKey: chat.lastMessageData.encryptedAesKeySender,
          iv: chat.lastMessageData.ivSender,
        };
      } else {
        // Se è ricevuto, uso i campi standard (cifrati per il destinatario).
        encryptedData = {
          encryptedContent: chat.lastMessageData.encryptedContent,
          encryptedAesKey: chat.lastMessageData.encryptedAesKey,
          iv: chat.lastMessageData.iv,
        };
      }

      // Se manca anche solo un pezzo del payload cifrato, non posso decifrare.
      if (
        encryptedData.encryptedContent &&
        encryptedData.encryptedAesKey &&
        encryptedData.iv
      ) {
        const decrypted = await messageEncryptionService.decryptMessage(
          encryptedData,
          privateKey,
        );
        return decrypted.content;
      }

      return "🔒 Messaggio cifrato";
    } catch (error) {
      console.error("Errore decifratura ultimo messaggio:", error);
      return "🔒 Errore decifratura";
    }
  }

  /**
   * Carica le chat dell'utente corrente da Firebase e aggiorna lo stato locale.
   * Se le chiavi sono sbloccate, decifra anche l’ultimo messaggio per ogni chat
   * così la lista chat può mostrare una preview in chiaro.
   *
   * @returns Promise risolta quando lo stato `chats` è aggiornato.
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

      // Decifra l'ultimo messaggio di ogni chat (solo se keyStore è sbloccato).
      if (keyStore.getIsUnlocked()) {
        console.log("🔓 Decifratura ultimi messaggi...");
        for (const chat of userChats) {
          if (chat.lastMessageData) {
            chat.lastMessage = await decryptLastMessage(chat);
          }
        }
      }

      chats.value = userChats;
      console.log(`✅ ${userChats.length} chat caricate`);
    } catch (error) {
      console.error("Errore nel caricamento delle chat:", error);
    }
  }

  /**
   * Invia un messaggio E2E cifrato.
   *
   * Flusso:
   * 1) Crea un messaggio locale temporaneo con stato "sending"
   * 2) Cifra il testo per il destinatario (public key destinatario)
   * 3) Cifra il testo per il mittente (public key del mittente, per poterlo rileggere)
   * 4) Invia a Firebase entrambe le versioni cifrate
   * 5) Aggiorna lo stato del messaggio locale a "sent"
   *
   * @param chatId ID della chat target.
   * @param text Testo in chiaro da cifrare e inviare.
   * @throws Error se utente non autenticato, chat non trovata, destinatario/chiavi mancanti o payload chiavi non valido.
   * @returns Promise risolta quando l’invio è completato (l’update "sent" avviene con piccolo delay).
   */
  async function sendEncryptedMessage(
    chatId: string,
    text: string,
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Utente non autenticato");
    }

    const chat = chats.value.find((c) => c.id === chatId);
    if (!chat) {
      throw new Error("Chat non trovata");
    }

    const recipientId = chat.participants?.find((id) => id !== currentUser.uid);
    if (!recipientId) {
      throw new Error("Destinatario non trovato");
    }

    // Recupera la chiave pubblica del destinatario (necessaria per cifrare per lui).
    const recipientPublicKeyString = chat.publicKeys?.[recipientId];
    if (!recipientPublicKeyString) {
      throw new Error("Chiave pubblica del destinatario non trovata");
    }

    // Recupera la chiave pubblica del mittente (necessaria per cifrare una copia leggibile da me).
    const senderPublicKeyString = chat.publicKeys?.[currentUser.uid];
    if (!senderPublicKeyString) {
      throw new Error("Chiave pubblica del mittente non trovata");
    }

    let recipientPublicKeyJwk: JsonWebKey;
    let senderPublicKeyJwk: JsonWebKey;

    // Parsing delle chiavi pubbliche salvate come stringa JSON (JWK).
    try {
      recipientPublicKeyJwk = JSON.parse(recipientPublicKeyString);
      senderPublicKeyJwk = JSON.parse(senderPublicKeyString);
    } catch (e) {
      throw new Error("Chiavi pubbliche non valide");
    }

    // Messaggio temporaneo locale (UX: mostra subito il messaggio in chat).
    const tempId = `temp_${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      chatId,
      senderId: currentUser.uid,
      text,
      sent: true,
      timestamp: new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };

    const currentChatMessages = messages.value.get(chatId) || [];
    messages.value.set(chatId, [...currentChatMessages, tempMessage]);

    try {
      // Cifra per destinatario.
      const encryptedForRecipient =
        await messageEncryptionService.encryptMessage(
          text,
          recipientPublicKeyJwk,
        );

      // Cifra per mittente.
      const encryptedForSender = await messageEncryptionService.encryptMessage(
        text,
        senderPublicKeyJwk,
      );

      console.log("🔐 Messaggio cifrato per destinatario e mittente");

      // Invio a Firebase includendo entrambe le versioni.
      await firebaseMessaging.sendMessage(
        chatId,
        currentUser.uid,
        recipientId,
        // Per il destinatario
        encryptedForRecipient.encryptedContent,
        encryptedForRecipient.encryptedAesKey,
        encryptedForRecipient.iv,
        // Per il mittente
        encryptedForSender.encryptedContent,
        encryptedForSender.encryptedAesKey,
        encryptedForSender.iv,
      );

      console.log("✅ Messaggio inviato a Firebase");

      // Update UX: segna "sent" dopo un piccolo delay.
      setTimeout(() => {
        const msgs = messages.value.get(chatId) || [];
        const msgIndex = msgs.findIndex((m) => m.id === tempId);
        if (msgIndex !== -1) {
          msgs[msgIndex].status = "sent";
          messages.value.set(chatId, [...msgs]);
        }
      }, 500);
    } catch (error) {
      // Rollback: rimuove il messaggio temporaneo se fallisce l’invio.
      const msgs = messages.value.get(chatId) || [];
      messages.value.set(
        chatId,
        msgs.filter((m) => m.id !== tempId),
      );
      throw error;
    }
  }

  /**
   * Marca come letti i messaggi ricevuti (non inviati dall'utente corrente)
   * per una determinata chat, aggiungendo l’UID in `readBy` e aggiornando:
   * - status: "read"
   * - readAt: serverTimestamp()
   *
   * Nota: per limitazioni dei filtri Firestore, filtra manualmente i già letti.
   *
   * @param chatId ID della chat su cui applicare la marcatura.
   * @returns Promise risolta quando l’operazione batch è completata.
   */
  async function markMessagesAsRead(chatId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);

      // Query: prendo solo messaggi non inviati da me.
      const q = query(messagesRef, where("senderId", "!=", currentUser.uid));

      const snapshot = await getDocs(q);

      // Filtro manualmente quelli che non contengono già il mio uid in readBy.
      const unreadMessages = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return !data.readBy || !data.readBy.includes(currentUser.uid);
      });

      if (unreadMessages.length === 0) {
        console.log("📭 Nessun messaggio da marcare come letto");
        return;
      }

      const batch = writeBatch(db);
      unreadMessages.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          status: "read",
          readBy: arrayUnion(currentUser.uid),
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();
      console.log(`✅ ${unreadMessages.length} messaggi marcati come letti`);
    } catch (error) {
      console.error("❌ Errore marcatura messaggi letti:", error);
    }
  }

  /**
   * Seleziona una chat:
   * - aggiorna selectedChatId
   * - azzera unread per la chat a livello UI
   * - carica i messaggi (storico)
   * - marca come letti i messaggi non letti
   * - aggancia un listener real-time per aggiornamenti successivi
   *
   * @param chatId ID della chat da aprire.
   * @returns Promise risolta quando storico e marcatura letti sono completati.
   */
  async function selectChat(chatId: string): Promise<void> {
    try {
      selectedChatId.value = chatId;

      const chat = chats.value.find((c) => c.id === chatId);
      if (chat) {
        chat.unread = 0;
      }

      // Disconnect previous listener (se presente nella mappa).
      const previousUnsubscriber = messageUnsubscribers.value.get(chatId);
      if (previousUnsubscriber) {
        previousUnsubscriber();
      }

      // Carica messaggi iniziali.
      await loadChatMessages(chatId);

      // Marca i messaggi come letti.
      await markMessagesAsRead(chatId);

      // Sottoscrizione real-time.
      const unsubscribe = firebaseMessaging.subscribeToMessages(
        chatId,
        (firebaseMessages) => handleNewMessages(chatId, firebaseMessages),
      );

      messageUnsubscribers.value.set(chatId, unsubscribe);
    } catch (error) {
      console.error("Errore nella selezione della chat:", error);
    }
  }

  /**
   * Converte una lista di messaggi (formato Firebase) in `Message[]` (formato app),
   * decifrando il contenuto quando possibile.
   *
   * Comportamento:
   * - Se non esiste privateKey: ritorna messaggi con testo placeholder (non decifrabili).
   * - Se il messaggio è stato inviato dall’utente corrente: usa i campi *Sender*.
   * - Se il messaggio è ricevuto: usa i campi standard.
   *
   * @param chatId ID chat a cui associare i messaggi convertiti.
   * @param firebaseMessages Messaggi grezzi letti da Firebase (qualsiasi shape compatibile).
   * @returns Array di messaggi convertiti e (quando possibile) decifrati.
   */
  async function convertFirebaseMessages(
    chatId: string,
    firebaseMessages: any[],
  ): Promise<Message[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const privateKey = keyStore.getPrivateKey();
    if (!privateKey) {
      console.warn("🔒 Chiave privata non disponibile");
      return firebaseMessages.map((msg) => ({
        id: msg.id,
        chatId,
        senderId: msg.senderId,
        text: "🔒 Sblocca le chiavi per vedere",
        sent: msg.senderId === currentUser.uid,
        timestamp: formatTimestamp(msg.timestamp),
        status: msg.status || "delivered",
      }));
    }

    const decryptedMessages: Message[] = [];

    for (const msg of firebaseMessages) {
      const isSentByMe = msg.senderId === currentUser.uid;
      let text = "Messaggio non decifrabile";

      try {
        if (isSentByMe) {
          // Se il messaggio è mio, decifra con i campi "Sender".
          if (
            msg.encryptedContentSender &&
            msg.encryptedAesKeySender &&
            msg.ivSender
          ) {
            const decrypted = await messageEncryptionService.decryptMessage(
              {
                encryptedContent: msg.encryptedContentSender,
                encryptedAesKey: msg.encryptedAesKeySender,
                iv: msg.ivSender,
              } as EncryptedMessage,
              privateKey,
            );
            text = decrypted.content;
          } else {
            text = "📤 Messaggio non disponibile";
          }
        } else {
          // Se il messaggio è ricevuto, decifra con i campi standard.
          if (msg.encryptedContent && msg.encryptedAesKey && msg.iv) {
            const decrypted = await messageEncryptionService.decryptMessage(
              {
                encryptedContent: msg.encryptedContent,
                encryptedAesKey: msg.encryptedAesKey,
                iv: msg.iv,
              } as EncryptedMessage,
              privateKey,
            );
            text = decrypted.content;
          } else {
            text = "📥 Messaggio non disponibile";
          }
        }
      } catch (e) {
        console.error("❌ Errore decifratura:", {
          messageId: msg.id,
          isSentByMe,
          error: e,
        });
        text = "❌ Errore decifratura";
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
   * Carica lo storico messaggi di una chat da Firebase, converte e aggiorna lo stato locale.
   *
   * @param chatId ID della chat.
   * @returns Promise risolta quando `messages` è stato aggiornato per la chat.
   */
  async function loadChatMessages(chatId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      console.log("📥 Caricamento messaggi per chat:", chatId);
      const firebaseMessages = await firebaseMessaging.loadChatMessages(chatId);
      const chatMessages = await convertFirebaseMessages(
        chatId,
        firebaseMessages,
      );

      messages.value.set(chatId, chatMessages);
      console.log(`✅ ${chatMessages.length} messaggi caricati`);
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error);
    }
  }

  /**
   * Gestisce l’aggiornamento real-time dei messaggi.
   * Aggiorna anche i metadati della chat (ultimo messaggio, timestamp, contatore unread).
   *
   * @param chatId ID chat a cui si riferisce l’update.
   * @param firebaseMessages Lista messaggi aggiornata (snapshot/stream) da Firebase.
   * @returns Promise risolta quando stato `messages` e metadati chat sono aggiornati.
   */
  async function handleNewMessages(
    chatId: string,
    firebaseMessages: any[],
  ): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const chatMessages = await convertFirebaseMessages(
        chatId,
        firebaseMessages,
      );
      messages.value.set(chatId, chatMessages);

      // Aggiorna preview/metadata chat (ultimo msg e timestamp).
      if (chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        const chat = chats.value.find((c) => c.id === chatId);

        if (chat) {
          chat.lastMessage = lastMsg.text;
          chat.timestamp = lastMsg.timestamp;

          // Se la chat non è aperta e il messaggio non è mio, incremento unread.
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
   * Crea (o riusa) una chat diretta con un altro utente usando il suo UID.
   * Se la chat non esiste, la crea; poi ricarica l’elenco chat.
   *
   * @param otherUserId UID dell’altro utente.
   * @throws Error se l’utente non è autenticato o se l’altro utente non esiste.
   * @returns chatId della chat diretta.
   */
  async function createChatWithUser(otherUserId: string): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ Utente non autenticato");
      throw new Error("Utente non autenticato");
    }

    try {
      const otherUserDoc = await firebaseMessaging.getUserDoc(otherUserId);
      if (!otherUserDoc) {
        console.error("❌ Utente non trovato");
        throw new Error("Utente non trovato");
      }

      const chatId = await firebaseMessaging.getOrCreateDirectChat(
        currentUser.uid,
        otherUserId,
      );

      await loadUserChats();

      return chatId;
    } catch (error) {
      console.error("Errore nella creazione della chat:", error);
      throw error;
    }
  }

  /**
   * Converte un timestamp Firebase in una stringa "HH:mm".
   * Se timestamp è assente o non convertibile, ritorna un fallback.
   *
   * @param timestamp Timestamp (tipicamente Firestore Timestamp).
   * @returns Orario formattato.
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
   * Cleanup: rimuove tutti i listener real-time quando il composable viene smontato.
   * Evita aggiornamenti su componenti non più attivi e riduce consumo risorse.
   */
  onUnmounted(() => {
    messageUnsubscribers.value.forEach((unsubscribe) => unsubscribe());
    messageUnsubscribers.value.clear();
  });

  /**
   * Pulisce lo stato locale dei messaggi di una chat e disiscrive l’eventuale listener.
   *
   * @param chatId ID della chat da pulire.
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
    markMessagesAsRead,
  };
}