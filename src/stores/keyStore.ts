// src/stores/keyStore.ts

import {ref} from 'vue';
import cryptoService from '../services/cryptoService';
import type {UserKeys} from '../types/chat.types';

class KeyStore {
    private currentPrivateKey = ref<CryptoKey | null>(null);
    private currentPublicKey = ref<JsonWebKey | null>(null);
    private masterKey = ref<CryptoKey | null>(null);
    private isUnlocked = ref(false);

    /**
     * Inizializza le chiavi per un nuovo utente
     */
    async initializeKeys(userId: string, password: string): Promise<UserKeys> {
        try {
            // Genera salt casuale
            const salt = cryptoService.generateSalt();

            // Deriva la Master Key dalla password
            const masterKey = await cryptoService.deriveMasterKey(password, salt);
            this.masterKey.value = masterKey;

            // Genera coppia di chiavi RSA
            const keyPair = await cryptoService.generateKeyPair();

            // Esporta le chiavi
            const publicKeyJwk = await cryptoService.exportPublicKey(keyPair.publicKey);
            const privateKeyJwk = await cryptoService.exportPrivateKey(keyPair.privateKey);

            // Cifra la chiave privata con la Master Key
            const {encryptedKey, iv} = await cryptoService.encryptPrivateKey(
                privateKeyJwk,
                masterKey
            );

            // Salva in memoria
            this.currentPrivateKey.value = keyPair.privateKey;
            this.currentPublicKey.value = publicKeyJwk;
            this.isUnlocked.value = true;

            // Ritorna i dati da salvare nel database
            return {
                userId,
                publicKey: JSON.stringify(publicKeyJwk),
                encryptedPrivateKey: encryptedKey,
                iv,
                salt: cryptoService.arrayBufferToBase64(salt)
            };
        } catch (error) {
            console.error('Errore nell\'inizializzazione delle chiavi:', error);
            throw error;
        }
    }

    /**
     * Sblocca le chiavi dell'utente con la password
     */
    async unlockKeys(userKeys: UserKeys, password: string): Promise<boolean> {
        try {
            // Converti salt da base64
            const salt = cryptoService.base64ToArrayBuffer(userKeys.salt);

            // Deriva la Master Key dalla password
            const masterKey = await cryptoService.deriveMasterKey(password, new Uint8Array(salt));
            this.masterKey.value = masterKey;

            // Decifra la chiave privata
            const privateKeyJwk = await cryptoService.decryptPrivateKey(
                userKeys.encryptedPrivateKey,
                userKeys.iv,
                masterKey
            );

            // Importa la chiave privata
            const privateKey = await cryptoService.importPrivateKey(privateKeyJwk);
            this.currentPrivateKey.value = privateKey;

            // Parse la chiave pubblica
            const publicKeyJwk = JSON.parse(userKeys.publicKey);
            this.currentPublicKey.value = publicKeyJwk;

            this.isUnlocked.value = true;
            return true;
        } catch (error) {
            console.error('Errore nello sblocco delle chiavi:', error);
            this.isUnlocked.value = false;
            return false;
        }
    }

    /**
     * Blocca le chiavi (logout o timeout)
     */
    lockKeys(): void {
        this.currentPrivateKey.value = null;
        this.currentPublicKey.value = null;
        this.masterKey.value = null;
        this.isUnlocked.value = false;
    }

    /**
     * Getters
     */
    getPrivateKey(): CryptoKey | null {
        return this.currentPrivateKey.value;
    }

    getPublicKey(): JsonWebKey | null {
        return this.currentPublicKey.value;
    }

    getMasterKey(): CryptoKey | null {
        return this.masterKey.value;
    }

    getIsUnlocked(): boolean {
        return this.isUnlocked.value;
    }

    /**
     * Setters
     */
    setPrivateKey(key: CryptoKey | null): void {
        this.currentPrivateKey.value = key;
    }

    setPublicKey(key: JsonWebKey | null): void {
        this.currentPublicKey.value = key;
    }

    setMasterKey(key: CryptoKey | null): void {
        this.masterKey.value = key;
    }

    setIsUnlocked(unlocked: boolean): void {
        this.isUnlocked.value = unlocked;
    }
}

export const keyStore = new KeyStore();
