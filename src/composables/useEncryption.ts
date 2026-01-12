// src/composables/useEncryption.ts

import { ref, computed } from 'vue';
import { keyStore } from '../stores/keyStore';
import cryptoService from '../services/cryptoService';
import type { UserKeys } from '../types/chat.types';

export function useEncryption() {
    const isInitializing = ref(false);
    const error = ref<string | null>(null);

    const isUnlocked = computed(() => keyStore.getIsUnlocked());

    /**
     * Genera nuove chiavi per un nuovo utente (alla registrazione)
     */
    async function initializeNewUserKeys(userId: string, password: string): Promise<UserKeys> {
        try {
            isInitializing.value = true;
            error.value = null;

            const userKeys = await keyStore.initializeKeys(userId, password);

            // TODO: Salva le chiavi nel backend
            await saveKeysToBackend(userKeys);

            // Salva anche in localStorage come backup
            saveKeysToLocalStorage(userKeys);

            return userKeys;
        } catch (err) {
            console.error('Errore nell\'inizializzazione delle chiavi:', err);
            error.value = 'Errore nella generazione delle chiavi';
            throw err;
        } finally {
            isInitializing.value = false;
        }
    }

    /**
     * Carica e sblocca le chiavi di un utente esistente (al login)
     */
    async function loadAndUnlockKeys(userId: string, password: string): Promise<boolean> {
        try {
            isInitializing.value = true;
            error.value = null;

            // 1. Prima prova a caricare dal localStorage
            let userKeys = loadKeysFromLocalStorage(userId);

            // 2. Se non ci sono, prova dal backend
            if (!userKeys) {
                userKeys = await loadKeysFromBackend(userId);

                if (!userKeys) {
                    error.value = 'Chiavi non trovate. Contatta il supporto.';
                    return false;
                }

                // Salva in localStorage per il futuro
                saveKeysToLocalStorage(userKeys);
            }

            // 3. Sblocca le chiavi con la password
            const success = await keyStore.unlockKeys(userKeys, password);

            if (!success) {
                error.value = 'Password errata';
                return false;
            }

            return true;
        } catch (err) {
            console.error('Errore nel caricamento delle chiavi:', err);
            error.value = 'Errore nel caricamento delle chiavi';
            return false;
        } finally {
            isInitializing.value = false;
        }
    }

    /**
     * Blocca le chiavi (logout)
     */
    function lockKeys(): void {
        keyStore.lockKeys();
    }

    /**
     * Salva le chiavi in localStorage
     */
    function saveKeysToLocalStorage(userKeys: UserKeys): void {
        try {
            localStorage.setItem(`user_keys_${userKeys.userId}`, JSON.stringify(userKeys));
        } catch (err) {
            console.error('Errore nel salvataggio in localStorage:', err);
        }
    }

    /**
     * Carica le chiavi da localStorage
     */
    function loadKeysFromLocalStorage(userId: string): UserKeys | null {
        try {
            const stored = localStorage.getItem(`user_keys_${userId}`);
            if (!stored) return null;
            return JSON.parse(stored) as UserKeys;
        } catch (err) {
            console.error('Errore nel caricamento da localStorage:', err);
            return null;
        }
    }

    /**
     * Salva le chiavi nel backend (TODO: implementare)
     */
    async function saveKeysToBackend(userKeys: UserKeys): Promise<void> {
        // TODO: Implementare chiamata API
        console.log('Salvando chiavi nel backend:', {
            userId: userKeys.userId,
            publicKey: userKeys.publicKey,
            // NON inviare la chiave privata cifrata se non necessario
        });
    }

    /**
     * Carica le chiavi dal backend (TODO: implementare)
     */
    async function loadKeysFromBackend(userId: string): Promise<UserKeys | null> {
        // TODO: Implementare chiamata API
        console.log('Caricando chiavi dal backend per userId:', userId);
        return null;
    }

    /**
     * Esporta la chiave pubblica dell'utente corrente
     */
    function getPublicKey(): JsonWebKey | null {
        return keyStore.getPublicKey();
    }

    /**
     * Cambia password (ri-cifra la chiave privata con nuova password)
     */
    async function changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<boolean> {
        try {
            // 1. Carica le chiavi attuali
            const currentKeys = loadKeysFromLocalStorage(userId);
            if (!currentKeys) {
                error.value = 'Chiavi non trovate';
                return false;
            }

            // 2. Sblocca con la vecchia password
            const unlocked = await keyStore.unlockKeys(currentKeys, oldPassword);
            if (!unlocked) {
                error.value = 'Password attuale errata';
                return false;
            }

            // 3. Ottieni la chiave privata decifrata
            const privateKey = keyStore.getPrivateKey();
            if (!privateKey) {
                error.value = 'Errore nell\'accesso alla chiave privata';
                return false;
            }

            // 4. Esporta la chiave privata
            const privateKeyJwk = await cryptoService.exportPrivateKey(privateKey);

            // 5. Genera nuovo salt
            const newSalt = cryptoService.generateSalt();

            // 6. Deriva nuova Master Key dalla nuova password
            const newMasterKey = await cryptoService.deriveMasterKey(newPassword, newSalt);

            // 7. Ri-cifra la chiave privata con la nuova Master Key
            const { encryptedKey, iv } = await cryptoService.encryptPrivateKey(
                privateKeyJwk,
                newMasterKey
            );

            // 8. Crea il nuovo oggetto UserKeys
            const newUserKeys: UserKeys = {
                userId: currentKeys.userId,
                publicKey: currentKeys.publicKey, // La chiave pubblica rimane la stessa
                encryptedPrivateKey: encryptedKey,
                iv: iv,
                salt: cryptoService.arrayBufferToBase64(newSalt)
            };

            // 9. Salva le nuove chiavi
            saveKeysToLocalStorage(newUserKeys);
            await saveKeysToBackend(newUserKeys);

            // 10. Aggiorna il keyStore con la nuova Master Key
            keyStore.setMasterKey(newMasterKey);

            return true;
        } catch (err) {
            console.error('Errore nel cambio password:', err);
            error.value = 'Errore nel cambio password';
            return false;
        }
    }

    return {
        isUnlocked,
        isInitializing,
        error,
        initializeNewUserKeys,
        loadAndUnlockKeys,
        lockKeys,
        getPublicKey,
        changePassword
    };
}
