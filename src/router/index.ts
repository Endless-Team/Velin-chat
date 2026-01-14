import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// ✅ Rileva se siamo in Tauri
const isTauri = () => {
  try {
    return !!(
      (
        // @ts-ignore
        window.__TAURI_INTERNALS__ ||
        // @ts-ignore
        window.__TAURI__ ||
        // @ts-ignore
        window.__TAURI_IPC__
      )
    );
  } catch {
    return false;
  }
};

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/Home.vue"),
      meta: { requiresGuest: true },
      beforeEnter: (_to, _from, next) => {
        // ✅ Se sei in Tauri, reindirizza al login
        if (isTauri()) {
          next("/login");
        } else {
          next();
        }
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/Dashboard.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "/chat/:chatId",
          name: "chat",
          component: () => import("../views/Chat.vue"),
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
});

// ✅ Funzione helper per aspettare che Firebase Auth si inizializzi
function getCurrentUser(): Promise<any> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}

// ✅ Navigation Guard con controllo async
router.beforeEach(async (to, _from, next) => {
  // ✅ Aspetta che Firebase Auth sia pronto
  const user = await getCurrentUser();

  // Se la rotta richiede autenticazione e l'utente non è loggato
  if (to.meta.requiresAuth && !user) {
    next("/login");
  }
  // Se la rotta è per guest (home/login) e l'utente è già loggato
  else if (to.meta.requiresGuest && user) {
    // ✅ Evita loop infinito: non redirigere se stai già andando al login
    if (to.path === "/login") {
      next("/dashboard");
    } else {
      next("/dashboard");
    }
  }
  // Altrimenti procedi normalmente
  else {
    next();
  }
});

export default router;
