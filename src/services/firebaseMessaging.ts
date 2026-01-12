// src/services/firebaseMessaging.ts

import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { UserKeys, Chat } from '../types/chat.types';

export class FirebaseMessagingService {
    /**
     * Salva le chiavi dell'utente nel database
     */
    async saveUserKeys(userKeys: UserKeys): Promise<void> {
        try {
            const userRef = doc(db, 'users', userKeys.userId);
            await setDoc(userRef, {
                userId: userKeys.userId,
                publicKey: userKeys.publicKey,
                encryptedPrivateKey: userKeys.encryptedPrivateKey,
                iv: userKeys.iv,
                salt: userKeys.salt,
                updatedAt: serverTimestamp()
            }, { merge: true });

            console.log('✅ Chiavi salvate nel database');
        } catch (error) {
            console.error('Errore nel salvataggio delle chiavi:', error);
            throw error;
        }
    }

    /**
     * Carica le chiavi dell'utente dal database
     */
    async loadUserKeys(userId: string): Promise<UserKeys | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.log('Chiavi non trovate nel database');
                return null;
            }

            const data = userSnap.data();
            return {
                userId: data.userId,
                publicKey: data.publicKey,
                encryptedPrivateKey: data.encryptedPrivateKey,
                iv: data.iv,
                salt: data.salt
            };
        } catch (error) {
            console.error('Errore nel caricamento delle chiavi:', error);
            return null;
        }
    }

    /**
     * Salva info utente (nome, email)
     */
    async saveUserProfile(userId: string, email: string, displayName?: string): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                email,
                displayName: displayName || email.split('@')[0],
                createdAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Errore nel salvataggio del profilo:', error);
            throw error;
        }
    }

    /**
     * Crea o recupera una chat diretta tra due utenti
     */
    async getOrCreateDirectChat(currentUserId: string, otherUserId: string): Promise<string> {
        try {
            // Cerca chat esistente
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', currentUserId),
                where('type', '==', 'direct')
            );

            const querySnapshot = await getDocs(q);

            // Verifica se esiste già una chat con questo utente
            for (const docSnap of querySnapshot.docs) {
                const participants = docSnap.data().participants;
                if (participants.includes(otherUserId)) {
                    return docSnap.id;
                }
            }

            // Crea nuova chat
            const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));

            if (!currentUserDoc.exists() || !otherUserDoc.exists()) {
                throw new Error('Utenti non trovati');
            }

            const currentUserData = currentUserDoc.data();
            const otherUserData = otherUserDoc.data();

            const newChatRef = await addDoc(collection(db, 'chats'), {
                participants: [currentUserId, otherUserId],
                participantsData: {
                    [currentUserId]: {
                        name: currentUserData.displayName || currentUserData.email,
                        email: currentUserData.email,
                        publicKey: currentUserData.publicKey
                    },
                    [otherUserId]: {
                        name: otherUserData.displayName || otherUserData.email,
                        email: otherUserData.email,
                        publicKey: otherUserData.publicKey
                    }
                },
                type: 'direct',
                lastMessage: '',
                lastMessageTimestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });

            return newChatRef.id;
        } catch (error) {
            console.error('Errore nella creazione/recupero chat:', error);
            throw error;
        }
    }

    /**
     * Carica le chat dell'utente corrente
     */
    async loadUserChats(userId: string): Promise<Chat[]> {
        try {
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', userId)
            );

            const querySnapshot = await getDocs(q);
            const chats: Chat[] = [];

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const otherUserId = data.participants.find((id: string) => id !== userId);
                const otherUserData = data.participantsData[otherUserId];

                chats.push({
                    id: docSnap.id,
                    name: otherUserData?.name || 'Unknown',
                    avatar: (otherUserData?.name || 'U').substring(0, 2).toUpperCase(),
                    lastMessage: data.lastMessage || 'Nessun messaggio',
                    timestamp: this.formatTimestamp(data.lastMessageTimestamp),
                    unread: 0, // TODO: implementare conteggio non letti
                    online: false, // TODO: implementare presenza
                    participants: data.participants,
                    publicKeys: {
                        [otherUserId]: otherUserData?.publicKey || ''
                    }
                });
            });

            return chats.sort(() => {
                // Ordina per timestamp più recente
                return 0; // TODO: implementare ordinamento corretto
            });
        } catch (error) {
            console.error('Errore nel caricamento delle chat:', error);
            return [];
        }
    }

    /**
     * Invia un messaggio cifrato
     */
    async sendMessage(
        chatId: string,
        senderId: string,
        recipientId: string,
        encryptedContent: string,
        encryptedAesKey: string,
        iv: string
    ): Promise<string> {
        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const messageDoc = await addDoc(messagesRef, {
                senderId,
                recipientId,
                encryptedContent,
                encryptedAesKey,
                iv,
                timestamp: serverTimestamp(),
                status: 'sent'
            });

            // Aggiorna l'ultima attività della chat
            const chatRef = doc(db, 'chats', chatId);
            await updateDoc(chatRef, {
                lastMessage: 'Messaggio cifrato',
                lastMessageTimestamp: serverTimestamp()
            });

            return messageDoc.id;
        } catch (error) {
            console.error('Errore nell\'invio del messaggio:', error);
            throw error;
        }
    }

    /**
     * Ascolta i nuovi messaggi in tempo reale
     */
    subscribeToMessages(
        chatId: string,
        callback: (messages: any[]) => void
    ): () => void {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(messages);
        });

        return unsubscribe;
    }

    /**
     * Carica messaggi di una chat
     */
    async loadChatMessages(chatId: string): Promise<any[]> {
        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Errore nel caricamento dei messaggi:', error);
            return [];
        }
    }

    /**
     * Formatta timestamp Firestore
     */
    private formatTimestamp(timestamp: Timestamp | null): string {
        if (!timestamp) return 'Ora';

        const date = timestamp.toDate();
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (days === 1) {
            return 'Ieri';
        } else if (days < 7) {
            return `${days} giorni fa`;
        } else {
            return date.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit'
            });
        }
    }

    /**
     * Cerca utenti per email
     */
    async searchUserByEmail(email: string): Promise<any | null> {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const userDoc = querySnapshot.docs[0];
            return {
                id: userDoc.id,
                ...userDoc.data()
            };
        } catch (error) {
            console.error('Errore nella ricerca utente:', error);
            return null;
        }
    }
}

export const firebaseMessaging = new FirebaseMessagingService();
