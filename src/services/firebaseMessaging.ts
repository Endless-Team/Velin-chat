// src/services/firebaseMessaging.ts

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Chat, UserKeys } from "../types/chat.types";

export class FirebaseMessagingService {
  /**
   * Salva le chiavi dell'utente nel database
   */
  async saveUserKeys(userKeys: UserKeys): Promise<void> {
    try {
      const userRef = doc(db, "users", userKeys.userId);
      await setDoc(
        userRef,
        {
          userId: userKeys.userId,
          publicKey: userKeys.publicKey,
          encryptedPrivateKey: userKeys.encryptedPrivateKey,
          iv: userKeys.iv,
          salt: userKeys.salt,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      // ✅ AGGIUNTO: Salva anche in userKeys collection
      const userKeysRef = doc(db, "userKeys", userKeys.userId);
      await setDoc(userKeysRef, {
        userId: userKeys.userId,
        publicKey: userKeys.publicKey,
        encryptedPrivateKey: userKeys.encryptedPrivateKey,
        iv: userKeys.iv,
        salt: userKeys.salt,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Chiavi salvate nel database");
    } catch (error) {
      console.error("Errore nel salvataggio delle chiavi:", error);
      throw error;
    }
  }

  /**
   * Carica le chiavi dell'utente dal database
   */
  async loadUserKeys(userId: string): Promise<UserKeys | null> {
    try {
      const userKeysRef = doc(db, "userKeys", userId);
      const userKeysSnap = await getDoc(userKeysRef);

      if (!userKeysSnap.exists()) {
        console.log("Chiavi non trovate nel database");
        return null;
      }

      const data = userKeysSnap.data();
      return {
        userId: data.userId,
        publicKey: data.publicKey,
        encryptedPrivateKey: data.encryptedPrivateKey,
        iv: data.iv,
        salt: data.salt,
      };
    } catch (error) {
      console.error("Errore nel caricamento delle chiavi:", error);
      return null;
    }
  }

  /**
   * Salva info utente (nome, email)
   */
  async saveUserProfile(
    userId: string,
    email: string,
    displayName?: string,
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          email,
          displayName: displayName || email.split("@")[0],
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Errore nel salvataggio del profilo:", error);
      throw error;
    }
  }

  /**
   * Ottiene un documento utente per UID
   */
  async getUserDoc(userId: string): Promise<any | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("❌ Utente non trovato:", userId);
        return null;
      }

      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } catch (error) {
      console.error("Errore nel recupero utente:", error);
      return null;
    }
  }

  /**
   * Crea o recupera una chat diretta tra due utenti
   */
  async getOrCreateDirectChat(
    userId1: string,
    userId2: string,
  ): Promise<string> {
    try {
      console.log("🔍 Cerco chat tra:", userId1, "e", userId2);

      // Cerca chat esistente
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId1),
        where("isGroup", "==", false),
      );

      const snapshot = await getDocs(q);

      // Trova chat con entrambi i partecipanti
      let existingChat: any = null;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.participants?.includes(userId2)) {
          existingChat = { id: docSnap.id, ...data };
        }
      });

      if (existingChat) {
        console.log("♻️ Chat esistente trovata:", existingChat.id);

        // ✅ Verifica se ha le chiavi pubbliche
        if (
          !existingChat.publicKeys ||
          !existingChat.publicKeys[userId1] ||
          !existingChat.publicKeys[userId2]
        ) {
          console.log("⚠️ Chat senza chiavi pubbliche, le aggiungo ora...");

          // Recupera le chiavi pubbliche degli utenti
          const user1Doc = await this.getUserDoc(userId1);
          const user2Doc = await this.getUserDoc(userId2);

          if (!user1Doc?.publicKey || !user2Doc?.publicKey) {
            console.error("❌ Chiavi pubbliche mancanti!");
            console.log("User1 publicKey:", !!user1Doc?.publicKey);
            console.log("User2 publicKey:", !!user2Doc?.publicKey);
            throw new Error(
              "Le chiavi pubbliche degli utenti non sono disponibili. Assicurati che entrambi abbiano generato le chiavi.",
            );
          }

          const chatRef = doc(db, "chats", existingChat.id);
          await updateDoc(chatRef, {
            publicKeys: {
              [userId1]: user1Doc.publicKey,
              [userId2]: user2Doc.publicKey,
            },
          });
          console.log("✅ Chiavi pubbliche aggiunte alla chat esistente");
        }

        return existingChat.id;
      }

      // ✅ Crea nuova chat CON le chiavi pubbliche
      console.log("➕ Creazione nuova chat tra:", userId1, "e", userId2);

      // Recupera i documenti degli utenti per ottenere le chiavi pubbliche
      const user1Doc = await this.getUserDoc(userId1);
      const user2Doc = await this.getUserDoc(userId2);

      if (!user1Doc || !user2Doc) {
        throw new Error("Uno o entrambi gli utenti non trovati");
      }

      // Recupera le chiavi pubbliche
      const publicKey1 = user1Doc.publicKey;
      const publicKey2 = user2Doc.publicKey;

      if (!publicKey1 || !publicKey2) {
        console.error("❌ Chiavi pubbliche mancanti!");
        console.log("User1 publicKey:", !!publicKey1);
        console.log("User2 publicKey:", !!publicKey2);
        throw new Error(
          "Le chiavi pubbliche degli utenti non sono disponibili. Assicurati che entrambi abbiano generato le chiavi.",
        );
      }

      console.log("✅ Chiavi pubbliche recuperate per entrambi gli utenti");

      const newChat = {
        participants: [userId1, userId2],
        isGroup: false,
        createdAt: serverTimestamp(),
        lastMessage: "",
        timestamp: serverTimestamp(),
        publicKeys: {
          [userId1]: publicKey1,
          [userId2]: publicKey2,
        },
      };

      const chatDocRef = await addDoc(chatsRef, newChat);
      console.log("✅ Nuova chat creata con ID:", chatDocRef.id);
      console.log("✅ PublicKeys salvate:", Object.keys(newChat.publicKeys));

      return chatDocRef.id;
    } catch (error) {
      console.error("❌ Errore in getOrCreateDirectChat:", error);
      throw error;
    }
  }

  /**
   * Carica le chat dell'utente corrente
   */
  async loadUserChats(userId: string): Promise<Chat[]> {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId),
      );

      const snapshot = await getDocs(q);
      const userChats: Chat[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Trova l'altro partecipante (per chat dirette)
        const otherUserId = data.participants?.find(
          (id: string) => id !== userId,
        );
        let chatName = "Chat";
        let chatAvatar = "";

        if (otherUserId && !data.isGroup) {
          const otherUserDoc = await this.getUserDoc(otherUserId);
          if (otherUserDoc) {
            chatName =
              otherUserDoc.displayName || otherUserDoc.email || "Utente";
            chatAvatar = otherUserDoc.avatar || "";
          }
        } else if (data.isGroup) {
          chatName = data.name || "Gruppo";
          chatAvatar = data.avatar || "";
        }

        userChats.push({
          id: docSnap.id,
          name: chatName,
          avatar: chatAvatar,
          lastMessage: data.lastMessage || "",
          timestamp: this.formatTimestamp(data.timestamp),
          unread: 0,
          online: false,
          participants: data.participants || [],
          publicKeys: data.publicKeys || {},
          isGroup: data.isGroup || false,
          lastMessageData: data.lastMessageData || null,
          email: "",
          createdAt: data.createdAt || null,
        });
      }

      return userChats;
    } catch (error) {
      console.error("Errore nel caricamento delle chat:", error);
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
    // Dati cifrati per il destinatario
    encryptedContent: string,
    encryptedAesKey: string,
    iv: string,
    // ✅ AGGIUNTO: Dati cifrati per il mittente
    encryptedContentSender: string,
    encryptedAesKeySender: string,
    ivSender: string,
  ): Promise<void> {
    const messageRef = collection(db, `chats/${chatId}/messages`);

    await addDoc(messageRef, {
      senderId,
      recipientId,
      // Per il destinatario
      encryptedContent,
      encryptedAesKey,
      iv,
      // ✅ Per il mittente
      encryptedContentSender,
      encryptedAesKeySender,
      ivSender,
      timestamp: serverTimestamp(),
      status: "sent",
      readBy: [],
    });

    // Aggiorna lastMessage nella chat
    const chatRef = doc(db, `chats/${chatId}`);
    await updateDoc(chatRef, {
      lastMessage: encryptedContent.substring(0, 50),
      lastMessageTime: serverTimestamp(),
    });
  }

  /**
   * Ascolta i nuovi messaggi in tempo reale
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: any[]) => void,
  ): () => void {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
  }

  /**
   * Carica messaggi di una chat
   */
  async loadChatMessages(chatId: string): Promise<any[]> {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error);
      return [];
    }
  }

  /**
   * Formatta timestamp Firestore
   */
  private formatTimestamp(timestamp: Timestamp | null): string {
    if (!timestamp) return "Ora";

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Ieri";
    } else if (days < 7) {
      return `${days} giorni fa`;
    } else {
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  }

  /**
   * Cerca utenti per email
   */
  async searchUserByEmail(email: string): Promise<any | null> {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    } catch (error) {
      console.error("Errore nella ricerca utente:", error);
      return null;
    }
  }
}

export const firebaseMessaging = new FirebaseMessagingService();
