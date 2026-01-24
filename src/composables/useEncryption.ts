// src/composables/useEncryption.ts - AGGIORNATO

import {ref, computed} from 'vue';
import {keyStore} from '../stores/keyStore';
import {firebaseMessaging} from '../services/firebaseMessaging';
import type {UserKeys} from '../types/chat.types';

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

            // Salva le chiavi in Firebase
            await firebaseMessaging.saveUserKeys(userKeys);

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

            // 1. Prima prova localStorage
            let userKeys = loadKeysFromLocalStorage(userId);

            // 2. Se non ci sono, prova Firebase
            if (!userKeys) {
                userKeys = await firebaseMessaging.loadUserKeys(userId);

                if (!userKeys) {
                    error.value = 'Chiavi non trovate.';
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

    function lockKeys(): void {
        keyStore.lockKeys();
    }

    function saveKeysToLocalStorage(userKeys: UserKeys): void {
        try {
            localStorage.setItem(`user_keys_${userKeys.userId}`, JSON.stringify(userKeys));
        } catch (err) {
            console.error('Errore nel salvataggio in localStorage:', err);
        }
    }

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

    function getPublicKey(): JsonWebKey | null {
        return keyStore.getPublicKey();
    }

    return {
        isUnlocked,
        isInitializing,
        error,
        initializeNewUserKeys,
        loadAndUnlockKeys,
        lockKeys,
        getPublicKey
    };
}
