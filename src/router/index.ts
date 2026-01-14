import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase";

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

// ✅ Navigation Guard
router.beforeEach((to, _from, next) => {
  const user = auth.currentUser;

  // Se la rotta richiede autenticazione e l'utente non è loggato
  if (to.meta.requiresAuth && !user) {
    next("/login");
  }
  // Se la rotta è per guest (home/login) e l'utente è già loggato
  else if (to.meta.requiresGuest && user) {
    next("/dashboard");
  }
  // Altrimenti procedi normalmente
  else {
    next();
  }
});

export default router;
