export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isGroup: boolean;
  participants?: string[];
  publicKeys?: Record<string, string>;
  lastMessageData?: {
    senderId: string;
    encryptedContent: string;
    encryptedAesKey: string;
    iv: string;
    encryptedContentSender: string;
    encryptedAesKeySender: string;
    ivSender: string;
  };
  online?: boolean; // ✅ AGGIUNTO
  email?: string; // ✅ AGGIUNTO se serve
  createdAt?: any; // ✅ AGGIUNTO se serve
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  sent: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface UserKeys {
  userId: string;
  publicKey: string;
  encryptedPrivateKey: string;
  iv: string;
  salt: string;
}
