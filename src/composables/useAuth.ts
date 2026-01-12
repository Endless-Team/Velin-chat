import { ref, onMounted } from "vue";
import {
    onAuthStateChanged,
    signOut,
    updateProfile,
    type User
} from "firebase/auth";
import { auth } from "../firebase";

const user = ref<User | null>(null);
const loading = ref(true);

export function useAuth() {
    onMounted(() => {
        onAuthStateChanged(auth, (firebaseUser) => {
            user.value = firebaseUser;
            loading.value = false;
        });
    });

    const logout = async () => {
        await signOut(auth);
    };

    const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            throw new Error("Nessun utente autenticato");
        }

        try {
            // Prepara i dati da aggiornare
            const updateData: { displayName?: string; photoURL?: string | null } = {};

            if (data.displayName !== undefined) {
                updateData.displayName = data.displayName;
            }

            if (data.photoURL !== undefined) {
                updateData.photoURL = data.photoURL || null;
            }

            // Aggiorna su Firebase
            await updateProfile(currentUser, updateData);

            // Forza il reload del token per aggiornare i dati
            await currentUser.reload();

            // Aggiorna il ref locale
            user.value = auth.currentUser;

            console.log("Profilo aggiornato con successo");
        } catch (error: any) {
            console.error("Errore durante l'aggiornamento del profilo:", error);
            throw new Error(error.message || "Errore durante l'aggiornamento del profilo");
        }
    };

    return {
        user,
        loading,
        logout,
        updateUserProfile,
    };
}
