import { ref, computed } from 'vue';
import messageEncryptionService from '../services/messageEncryptionService';
import { keyStore } from '../stores/keyStore';
import type { Message, Chat, EncryptedMessagePayload } from '../types/chat.types';

export function useEncryptedChat() {
    const chats = ref<Chat[]>([]);
    const messages = ref<Map<string, Message[]>>(new Map());
    const selectedChatId = ref<string | null>(null);

    const selectedChat = computed(() => {
        if (!selectedChatId.value) return null;
        return chats.value.find(c => c.id === selectedChatId.value);
    });

    const currentMessages = computed(() => {
        if (!selectedChatId.value) return [];
        return messages.value.get(selectedChatId.value) || [];
    });

    /**
     * Invia un messaggio cifrato
     */
    async function sendEncryptedMessage(
        chatId: string,
        text: string,
        recipientPublicKey: string
    ): Promise<void> {
        try {
            const chat = chats.value.find(c => c.id === chatId);
            if (!chat) throw new Error('Chat non trovata');

            // Parse la chiave pubblica del destinatario
            const recipientPublicKeyJwk = JSON.parse(recipientPublicKey);

            // Cifra il messaggio
            const encryptedMessage = await messageEncryptionService.encryptMessage(
                text,
                recipientPublicKeyJwk
            );

            // Crea il messaggio
            const message: Message = {
                id: Date.now().toString(),
                chatId,
                senderId: 'current-user-id', // TODO: prendere da auth
                text, // Testo in chiaro per visualizzazione locale
                encryptedContent: encryptedMessage.encryptedContent,
                encryptedAesKey: encryptedMessage.encryptedAesKey,
                iv: encryptedMessage.iv,
                sent: true,
                timestamp: new Date().toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                status: 'sending'
            };

            // Aggiungi alla lista locale
            const chatMessages = messages.value.get(chatId) || [];
            chatMessages.push(message);
            messages.value.set(chatId, chatMessages);

            // TODO: Invia al server via WebSocket/API
            const payload: EncryptedMessagePayload = {
                id: message.id,
                chatId,
                senderId: message.senderId,
                recipientId: chat.participants?.[0] || '', // Per chat 1-1
                encryptedContent: encryptedMessage.encryptedContent,
                encryptedAesKey: encryptedMessage.encryptedAesKey,
                iv: encryptedMessage.iv,
                timestamp: message.timestamp
            };

            console.log('Messaggio cifrato da inviare:', payload);

            // Aggiorna ultimo messaggio nella chat
            chat.lastMessage = text;
            chat.timestamp = message.timestamp;

        } catch (error) {
            console.error('Errore nell\'invio del messaggio:', error);
            throw error;
        }
    }

    /**
     * Ricevi e decifra un messaggio
     */
    async function receiveEncryptedMessage(
        encryptedPayload: EncryptedMessagePayload
    ): Promise<void> {
        try {
            const privateKey = keyStore.getPrivateKey();
            if (!privateKey) {
                throw new Error('Chiave privata non disponibile. Effettua il login.');
            }

            // Decifra il messaggio
            const decrypted = await messageEncryptionService.decryptMessage(
                {
                    encryptedContent: encryptedPayload.encryptedContent,
                    encryptedAesKey: encryptedPayload.encryptedAesKey,
                    iv: encryptedPayload.iv
                },
                privateKey
            );

            // Crea il messaggio decifrato
            const message: Message = {
                id: encryptedPayload.id,
                chatId: encryptedPayload.chatId,
                senderId: encryptedPayload.senderId,
                text: decrypted.content,
                sent: false,
                timestamp: encryptedPayload.timestamp,
                status: 'delivered'
            };

            // Aggiungi alla lista
            const chatMessages = messages.value.get(encryptedPayload.chatId) || [];
            chatMessages.push(message);
            messages.value.set(encryptedPayload.chatId, chatMessages);

            // Aggiorna la chat
            const chat = chats.value.find(c => c.id === encryptedPayload.chatId);
            if (chat) {
                chat.lastMessage = decrypted.content;
                chat.timestamp = message.timestamp;
                chat.unread++;
            }

        } catch (error) {
            console.error('Errore nella ricezione del messaggio:', error);
            throw error;
        }
    }

    /**
     * Seleziona una chat
     */
    function selectChat(chatId: string): void {
        selectedChatId.value = chatId;

        // Azzera i messaggi non letti
        const chat = chats.value.find(c => c.id === chatId);
        if (chat) {
            chat.unread = 0;
        }
    }

    /**
     * Carica le chat
     */
    function loadChats(chatList: Chat[]): void {
        chats.value = chatList;
    }

    return {
        chats,
        selectedChat,
        currentMessages,
        selectedChatId,
        sendEncryptedMessage,
        receiveEncryptedMessage,
        selectChat,
        loadChats
    };
}
