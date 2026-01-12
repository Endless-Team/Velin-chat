export interface User {
    id: string;
    email: string;
    displayName?: string;
    avatar?: string;
    publicKey?: string; // Chiave pubblica JWK in formato stringa JSON
    online: boolean;
}

export interface Chat {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
    isGroup?: boolean;
    participants?: string[]; // Array di user IDs
    publicKeys?: Record<string, string>; // Map userId -> publicKey per E2EE
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string; // Testo in chiaro (dopo decifratura)
    encryptedContent?: string; // Contenuto cifrato (per invio/ricezione)
    encryptedAesKey?: string; // Chiave AES cifrata
    iv?: string; // Initialization Vector
    sent: boolean; // true se inviato da me
    timestamp: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface EncryptedMessagePayload {
    id: string;
    chatId: string;
    senderId: string;
    recipientId: string; // Per chat 1-1
    encryptedContent: string;
    encryptedAesKey: string;
    iv: string;
    timestamp: string;
}

export interface UserKeys {
    userId: string;
    publicKey: string; // JWK in formato JSON string
    encryptedPrivateKey: string; // Chiave privata cifrata
    iv: string; // IV usato per cifrare la chiave privata
    salt: string; // Salt per derivare la Master Key
}
