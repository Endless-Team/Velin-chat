import {ref, onMounted} from "vue";
import {onAuthStateChanged, signOut, type User} from "firebase/auth";
import {auth} from "../firebase";

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

    return {
        user,
        loading,
        logout,
    };
}
