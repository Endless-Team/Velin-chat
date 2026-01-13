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
import { db, auth } from "../firebase";
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
        { merge: true }
      );

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
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("Chiavi non trovate nel database");
        return null;
      }

      const data = userSnap.data();
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
    displayName?: string
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
        { merge: true }
      );
    } catch (error) {
      console.error("Errore nel salvataggio del profilo:", error);
      throw error;
    }
  }

  /**
   * Crea o recupera una chat diretta tra due utenti
   */
  async getOrCreateDirectChat(
    currentUserId: string,
    otherUserId: string
  ): Promise<string> {
    try {
      // Cerca chat esistente
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUserId),
        where("type", "==", "direct")
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
      let currentUserDoc = await getDoc(doc(db, "users", currentUserId));
      const otherUserDoc = await getDoc(doc(db, "users", otherUserId));

      // Se il documento dell'utente corrente non esiste (vecchi account),
      // crealo al volo usando le informazioni disponibili da Auth
      if (!currentUserDoc.exists()) {
        const authCurrentUser = auth.currentUser;
        if (!authCurrentUser || authCurrentUser.uid !== currentUserId) {
          throw new Error("Utente corrente non valido");
        }

        await setDoc(
          doc(db, "users", currentUserId),
          {
            email: authCurrentUser.email,
            displayName:
              authCurrentUser.displayName ||
              authCurrentUser.email?.split("@")[0] ||
              "User",
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        currentUserDoc = await getDoc(doc(db, "users", currentUserId));
      }

      if (!otherUserDoc.exists()) {
        throw new Error("Utenti non trovati");
      }

      const currentUserData = currentUserDoc.data()!;
      const otherUserData = otherUserDoc.data();

      // Firestore non accetta undefined: usa fallback sicuri
      const currentName =
        currentUserData.displayName || currentUserData.email || "User";
      const otherName =
        otherUserData.displayName || otherUserData.email || "User";
      const currentEmail = currentUserData.email || "";
      const otherEmail = otherUserData.email || "";
      const currentPk = currentUserData.publicKey || "";
      const otherPk = otherUserData.publicKey || "";

      const newChatRef = await addDoc(collection(db, "chats"), {
        participants: [currentUserId, otherUserId],
        participantsData: {
          [currentUserId]: {
            name: currentName,
            email: currentEmail,
            publicKey: currentPk,
          },
          [otherUserId]: {
            name: otherName,
            email: otherEmail,
            publicKey: otherPk,
          },
        },
        type: "direct",
        lastMessage: "",
        lastMessageTimestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      return newChatRef.id;
    } catch (error) {
      console.error("Errore nella creazione/recupero chat:", error);
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
        where("participants", "array-contains", userId)
      );

      const snapshot = await getDocs(q);
      const userChats: Chat[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Trova l'altro partecipante (per chat dirette)
        const otherUserId = data.participants?.find(
          (id: string) => id !== userId
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
          isGroup: data.isGroup || false, // ✅ AGGIUNTO
          lastMessageData: data.lastMessageData || null, // ✅ AGGIUNTO
          email: "", // ✅ AGGIUNTO se serve
          createdAt: data.createdAt || null, // ✅ AGGIUNTO se serve
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
    encryptedContent: string,
    encryptedAesKey: string,
    iv: string,
    encryptedContentSender: string,
    encryptedAesKeySender: string,
    ivSender: string
  ): Promise<void> {
    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
      senderId,
      recipientId,
      encryptedContent,
      encryptedAesKey,
      iv,
      encryptedContentSender,
      encryptedAesKeySender,
      ivSender,
      timestamp: serverTimestamp(),
      status: "sent",
    });

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: "🔒 Messaggio cifrato",
      timestamp: serverTimestamp(),
      lastMessageData: {
        senderId,
        encryptedContent,
        encryptedAesKey,
        iv,
        encryptedContentSender,
        encryptedAesKeySender,
        ivSender,
      },
    });
  }

  /**
   * Ascolta i nuovi messaggi in tempo reale
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: any[]) => void
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

  /**
   * Ottiene un documento utente per UID
   */
  async getUserDoc(userId: string): Promise<any | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
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
}

export const firebaseMessaging = new FirebaseMessagingService();
