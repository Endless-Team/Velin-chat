// @ts-ignore
import cryptoService from "./cryptoService";

interface EncryptedMessage {
  encryptedContent: string;
  encryptedAesKey: string;
  iv: string;
}

interface DecryptedMessage {
  content: string;
}

class MessageEncryptionService {
  /**
   * Genera una chiave AES simmetrica per cifrare il messaggio
   */
  private async generateAESKey(): Promise<CryptoKey> {
    try {
      return await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      console.error("Errore nella generazione della chiave AES:", error);
      throw error;
    }
  }

  /**
   * Cifra un messaggio usando la chiave pubblica del destinatario
   * @param message - Il testo del messaggio da cifrare
   * @param recipientPublicKeyJwk - La chiave pubblica del destinatario in formato JWK
   * @returns Oggetto con il messaggio cifrato, la chiave AES cifrata e l'IV
   */
  async encryptMessage(
    message: string,
    recipientPublicKeyJwk: JsonWebKey
  ): Promise<EncryptedMessage> {
    try {
      // 1. Genera una chiave AES simmetrica per questo messaggio
      const aesKey = await this.generateAESKey();

      // 2. Genera un IV casuale
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // 3. Cifra il messaggio con AES-GCM
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      const encryptedMessageBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        aesKey,
        messageBuffer
      );

      // 4. Esporta la chiave AES in formato raw
      const aesKeyBuffer = await window.crypto.subtle.exportKey("raw", aesKey);

      // 5. Importa la chiave pubblica del destinatario
      const recipientPublicKey = await cryptoService.importPublicKey(
        recipientPublicKeyJwk
      );

      // 6. Cifra la chiave AES con la chiave pubblica RSA del destinatario
      const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        recipientPublicKey,
        aesKeyBuffer
      );

      // 7. Converti tutto in base64 per il trasporto
      return {
        encryptedContent: cryptoService.arrayBufferToBase64(
          encryptedMessageBuffer
        ),
        encryptedAesKey: cryptoService.arrayBufferToBase64(
          encryptedAesKeyBuffer
        ),
        iv: cryptoService.arrayBufferToBase64(iv.buffer),
      };
    } catch (error) {
      console.error("Errore nella cifratura del messaggio:", error);
      throw error;
    }
  }

  /**
   * Decifra un messaggio usando la chiave privata dell'utente
   * @param encryptedMessage - Oggetto con il messaggio cifrato
   * @param privateKey - La chiave privata dell'utente (già decifrata)
   * @returns Il messaggio in chiaro
   */
  async decryptMessage(
    encryptedMessage: EncryptedMessage,
    privateKey: CryptoKey
  ): Promise<DecryptedMessage> {
    try {
      // 1. Converti da base64 ad ArrayBuffer
      const encryptedAesKeyBuffer = cryptoService.base64ToArrayBuffer(
        encryptedMessage.encryptedAesKey
      );
      const encryptedContentBuffer = cryptoService.base64ToArrayBuffer(
        encryptedMessage.encryptedContent
      );
      const iv = cryptoService.base64ToArrayBuffer(encryptedMessage.iv);

      // 2. Decifra la chiave AES con la chiave privata RSA
      const aesKeyBuffer = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        privateKey,
        encryptedAesKeyBuffer
      );

      // 3. Importa la chiave AES
      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        aesKeyBuffer,
        {
          name: "AES-GCM",
          length: 256,
        },
        false,
        ["decrypt"]
      );

      // 4. Decifra il messaggio con la chiave AES
      const decryptedMessageBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(iv),
        },
        aesKey,
        encryptedContentBuffer
      );

      // 5. Converti il buffer in stringa
      const decoder = new TextDecoder();
      const content = decoder.decode(decryptedMessageBuffer);

      return { content };
    } catch (error) {
      console.error("Errore nella decifratura del messaggio:", error);
      throw error;
    }
  }

  /**
   * Cifra un messaggio per più destinatari (chat di gruppo)
   * @param message - Il testo del messaggio
   * @param recipientsPublicKeys - Array di chiavi pubbliche dei destinatari
   * @returns Array di messaggi cifrati, uno per ogni destinatario
   */
  async encryptMessageForGroup(
    message: string,
    recipientsPublicKeys: JsonWebKey[]
  ): Promise<EncryptedMessage[]> {
    try {
      const encryptedMessages: EncryptedMessage[] = [];

      for (const publicKey of recipientsPublicKeys) {
        const encrypted = await this.encryptMessage(message, publicKey);
        encryptedMessages.push(encrypted);
      }

      return encryptedMessages;
    } catch (error) {
      console.error("Errore nella cifratura del messaggio di gruppo:", error);
      throw error;
    }
  }

  /**
   * Cifra un messaggio per due destinatari (mittente e destinatario)
   * Ritorna due versioni cifrate dello stesso messaggio
   * @param message - Il testo del messaggio da cifrare
   * @param recipientPublicKeyJwk - La chiave pubblica del destinatario
   * @param senderPublicKeyJwk - La chiave pubblica del mittente
   * @returns Oggetto con due messaggi cifrati
   */
  async encryptMessageForBoth(
    message: string,
    recipientPublicKeyJwk: JsonWebKey,
    senderPublicKeyJwk: JsonWebKey
  ): Promise<{
    forRecipient: EncryptedMessage;
    forSender: EncryptedMessage;
  }> {
    try {
      // Cifra per il destinatario
      const forRecipient = await this.encryptMessage(
        message,
        recipientPublicKeyJwk
      );

      // Cifra per il mittente (così può leggere i propri messaggi)
      const forSender = await this.encryptMessage(message, senderPublicKeyJwk);

      return {
        forRecipient,
        forSender,
      };
    } catch (error) {
      console.error(
        "Errore nella cifratura del messaggio per entrambi:",
        error
      );
      throw error;
    }
  }
}

export default new MessageEncryptionService();
export type { EncryptedMessage, DecryptedMessage };
