// src/services/cryptoService.ts

interface EncryptedPrivateKey {
    encryptedKey: string;
    iv: string;
}

interface KeyPairData {
    publicKey: JsonWebKey;
    encryptedPrivateKey: string;
    iv: string;
    salt: string;
}

class CryptoService {
    private keyPair: CryptoKeyPair | null = null;
    private masterKey: CryptoKey | null = null;

    /**
     * Genera una coppia di chiavi RSA per l'utente
     */
    async generateKeyPair(): Promise<CryptoKeyPair> {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSA-OAEP',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                    hash: {name: 'SHA-256'}
                },
                true, // extractable
                ['encrypt', 'decrypt']
            );

            this.keyPair = keyPair;
            return keyPair;
        } catch (error) {
            console.error('Errore nella generazione delle chiavi:', error);
            throw error;
        }
    }

    /**
     * Genera la Master Key dalla password dell'utente usando PBKDF2
     */
    async deriveMasterKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);

            // Importa la password come chiave
            const passwordKey = await window.crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                {name: 'PBKDF2'},
                false,
                ['deriveBits', 'deriveKey']
            );

            // Deriva la Master Key
            const masterKey = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                passwordKey,
                {name: 'AES-GCM', length: 256},
                true,
                ['encrypt', 'decrypt']
            );

            this.masterKey = masterKey;
            return masterKey;
        } catch (error) {
            console.error('Errore nella derivazione della Master Key:', error);
            throw error;
        }
    }

    /**
     * Esporta la chiave pubblica in formato JWK
     */
    async exportPublicKey(publicKey: CryptoKey): Promise<JsonWebKey> {
        try {
            return await window.crypto.subtle.exportKey('jwk', publicKey);
        } catch (error) {
            console.error('Errore nell\'export della chiave pubblica:', error);
            throw error;
        }
    }

    /**
     * Esporta la chiave privata in formato JWK
     */
    async exportPrivateKey(privateKey: CryptoKey): Promise<JsonWebKey> {
        try {
            return await window.crypto.subtle.exportKey('jwk', privateKey);
        } catch (error) {
            console.error('Errore nell\'export della chiave privata:', error);
            throw error;
        }
    }

    /**
     * Importa una chiave pubblica da formato JWK
     */
    async importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
        try {
            return await window.crypto.subtle.importKey(
                'jwk',
                jwk,
                {
                    name: 'RSA-OAEP',
                    hash: {name: 'SHA-256'}
                },
                true,
                ['encrypt']
            );
        } catch (error) {
            console.error('Errore nell\'import della chiave pubblica:', error);
            throw error;
        }
    }

    /**
     * Importa una chiave privata da formato JWK
     */
    async importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
        try {
            return await window.crypto.subtle.importKey(
                'jwk',
                jwk,
                {
                    name: 'RSA-OAEP',
                    hash: {name: 'SHA-256'}
                },
                true,
                ['decrypt']
            );
        } catch (error) {
            console.error('Errore nell\'import della chiave privata:', error);
            throw error;
        }
    }

    /**
     * Cifra la chiave privata con la Master Key
     */
    async encryptPrivateKey(
        privateKeyJwk: JsonWebKey,
        masterKey: CryptoKey
    ): Promise<EncryptedPrivateKey> {
        try {
            const encoder = new TextEncoder();
            const privateKeyString = JSON.stringify(privateKeyJwk);
            const privateKeyBuffer = encoder.encode(privateKeyString);

            // Genera IV casuale
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            // Cifra la chiave privata
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                masterKey,
                privateKeyBuffer
            );

            // Converti in base64 per il salvataggio
            const encryptedKey = this.arrayBufferToBase64(encryptedBuffer);
            const ivBase64 = this.arrayBufferToBase64(iv);

            return {
                encryptedKey,
                iv: ivBase64
            };
        } catch (error) {
            console.error('Errore nella cifratura della chiave privata:', error);
            throw error;
        }
    }

    /**
     * Decifra la chiave privata con la Master Key
     */
    async decryptPrivateKey(
        encryptedKeyBase64: string,
        ivBase64: string,
        masterKey: CryptoKey
    ): Promise<JsonWebKey> {
        try {
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedKeyBase64);
            const iv = this.base64ToArrayBuffer(ivBase64);

            // Decifra la chiave privata
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                masterKey,
                encryptedBuffer
            );

            const decoder = new TextDecoder();
            const privateKeyString = decoder.decode(decryptedBuffer);
            return JSON.parse(privateKeyString);
        } catch (error) {
            console.error('Errore nella decifratura della chiave privata:', error);
            throw error;
        }
    }

    /**
     * Genera un salt casuale
     */
    generateSalt(): Uint8Array {
        return window.crypto.getRandomValues(new Uint8Array(16));
    }

    /**
     * Converte ArrayBuffer in base64
     */
    arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Converte base64 in ArrayBuffer
     */
    base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Getter per la coppia di chiavi corrente
     */
    getKeyPair(): CryptoKeyPair | null {
        return this.keyPair;
    }

    /**
     * Getter per la Master Key corrente
     */
    getMasterKey(): CryptoKey | null {
        return this.masterKey;
    }

    /**
     * Setter per la coppia di chiavi
     */
    setKeyPair(keyPair: CryptoKeyPair): void {
        this.keyPair = keyPair;
    }

    /**
     * Setter per la Master Key
     */
    setMasterKey(masterKey: CryptoKey): void {
        this.masterKey = masterKey;
    }
}

export default new CryptoService();
export type {EncryptedPrivateKey, KeyPairData};
