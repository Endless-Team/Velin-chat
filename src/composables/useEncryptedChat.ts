import {ref, computed, onUnmounted} from 'vue';
import {firebaseMessaging} from '../services/firebaseMessaging';
import {auth} from '../firebase';
import type {Message, Chat} from '../types/chat.types';

export function useEncryptedChat() {
    const chats = ref<Chat[]>([]);
    const messages = ref<Map<string, Message[]>>(new Map());
    const selectedChatId = ref<string | null>(null);
    const messageUnsubscribers = ref<Map<string, () => void>>(new Map());

    const selectedChat = computed(() => {
        if (!selectedChatId.value) return null;
        return chats.value.find(c => c.id === selectedChatId.value);
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
                console.error('Utente non autenticato');
                return;
            }

            console.log('📥 Caricamento chat da Firebase...');
            const userChats = await firebaseMessaging.loadUserChats(currentUser.uid);
            chats.value = userChats;
            console.log(`✅ ${userChats.length} chat caricate`);
        } catch (error) {
            console.error('Errore nel caricamento delle chat:', error);
        }
    }

    /**
     * Invia un messaggio cifrato (MODALITÀ MOCK per ora)
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

        console.log('📤 Invio messaggio:', {chatId, text});

        // MODALITÀ MOCK: Invia senza crittografia per ora
        // TODO: Riattivare crittografia con chiavi reali

        const recipientId = chat.participants?.find(id => id !== currentUser.uid);
        if (!recipientId) {
            console.error('❌ Destinatario non trovato');
            throw new Error('Destinatario non trovato');
        }

        // Simula dati cifrati (in realtà sono mock)
        const mockEncrypted = {
            encryptedContent: btoa(text), // Base64 del testo
            encryptedAesKey: 'mock-aes-key',
            iv: 'mock-iv'
        };

        try {
            // Invia a Firebase
            await firebaseMessaging.sendMessage(
                chatId,
                currentUser.uid,
                recipientId,
                mockEncrypted.encryptedContent,
                mockEncrypted.encryptedAesKey,
                mockEncrypted.iv
            );

            console.log('✅ Messaggio inviato a Firebase');

            // Nota: Il messaggio apparirà tramite il listener real-time
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

            const chat = chats.value.find(c => c.id === chatId);
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
            console.error('Errore nella selezione della chat:', error);
        }
    }

    /**
     * Decifra un messaggio (MOCK: decodifica base64)
     */
    function decryptMessage(encryptedContent: string): string {
        try {
            return atob(encryptedContent);
        } catch {
            return 'Messaggio non decifrabile';
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

        return firebaseMessages.map((msg) => ({
            id: msg.id,
            chatId,
            senderId: msg.senderId,
            text: decryptMessage(msg.encryptedContent),
            sent: msg.senderId === currentUser.uid,
            timestamp: formatTimestamp(msg.timestamp),
            status: msg.status || 'delivered'
        }));
    }

    /**
     * Carica messaggi di una chat da Firebase
     */
    async function loadChatMessages(chatId: string): Promise<void> {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            console.log('📥 Caricamento messaggi per chat:', chatId);

            const firebaseMessages = await firebaseMessaging.loadChatMessages(chatId);
            const chatMessages = await convertFirebaseMessages(chatId, firebaseMessages);

            messages.value.set(chatId, chatMessages);
            console.log(`✅ ${chatMessages.length} messaggi caricati`);

        } catch (error) {
            console.error('Errore nel caricamento dei messaggi:', error);
        }
    }

    /**
     * Gestisce nuovi messaggi dal listener real-time
     */
    async function handleNewMessages(chatId: string, firebaseMessages: any[]): Promise<void> {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const chatMessages = await convertFirebaseMessages(chatId, firebaseMessages);
            messages.value.set(chatId, chatMessages);

            // Aggiorna ultimo messaggio nella chat
            if (chatMessages.length > 0) {
                const lastMsg = chatMessages[chatMessages.length - 1];
                const chat = chats.value.find(c => c.id === chatId);
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
            console.error('Errore nella gestione nuovi messaggi:', error);
        }
    }

    /**
     * Crea una nuova chat con un utente
     */
    async function createChatWithUser(otherUserEmail: string): Promise<string | null> {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('❌ Utente non autenticato');
            throw new Error('Utente non autenticato');
        }

        try {
            // Cerca l'utente per email
            const otherUser = await firebaseMessaging.searchUserByEmail(otherUserEmail);
            if (!otherUser) {
                console.error('❌ Utente non trovato');
                throw new Error('Utente non trovato');
            }

            // Crea o recupera chat
            const chatId = await firebaseMessaging.getOrCreateDirectChat(
                currentUser.uid,
                otherUser.id
            );

            // Ricarica le chat
            await loadUserChats();

            return chatId;
        } catch (error) {
            console.error('Errore nella creazione della chat:', error);
            throw error;
        }
    }

    /**
     * Formatta timestamp
     */
    function formatTimestamp(timestamp: any): string {
        if (!timestamp) return 'Ora';

        try {
            const date = timestamp.toDate();
            return date.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Ora';
        }
    }

    /**
     * Pulisci i listener quando il composable viene distrutto
     */
    onUnmounted(() => {
        messageUnsubscribers.value.forEach(unsubscribe => unsubscribe());
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
        clearChatMessages
    };
}
