import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Controlla se l'applicazione è in esecuzione nell'ambiente Tauri (desktop app)
 * @returns {boolean} true se siamo in Tauri, false se siamo nel browser
 */
const isTauri = (): boolean => {
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

/**
 * Attende che Firebase Auth completi l'inizializzazione
 * Restituisce l'utente corrente o null se non autenticato
 * @returns {Promise<any>} Promise che risolve con l'utente o null
 */
function getCurrentUser(): Promise<any> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject,
    );
  });
}

/**
 * Guard per bloccare l'accesso da Tauri (solo web)
 * Reindirizza al login se siamo nell'app desktop
 */
const webOnlyGuard = (_to: any, _from: any, next: any) => {
  if (isTauri()) {
    next("/login");
  } else {
    next();
  }
};

// =============================================================================
// ROUTER CONFIGURATION
// =============================================================================

export const router = createRouter({
  history: createWebHistory(),

  routes: [
    // -------------------------------------------------------------------------
    // Public Routes (accessibili solo se NON autenticati)
    // -------------------------------------------------------------------------
    {
      path: "/",
      name: "home",
      component: () => import("../views/Home.vue"),
      meta: { requiresGuest: true },
      beforeEnter: webOnlyGuard,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
      meta: { requiresGuest: true },
    },

    // -------------------------------------------------------------------------
    // Protected Routes (richiedono autenticazione)
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // Informational Pages (solo web, non accessibili da Tauri)
    // -------------------------------------------------------------------------
    {
      path: "/download",
      name: "download",
      component: () => import("../views/Download.vue"),
      beforeEnter: webOnlyGuard,
    },
    {
      path: "/safety",
      name: "safety",
      component: () => import("../views/Safety.vue"),
      beforeEnter: webOnlyGuard,
    },
    {
      path: "/support",
      name: "support",
      component: () => import("../views/Support.vue"),
      beforeEnter: webOnlyGuard,
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import("../views/Blog.vue"),
      beforeEnter: webOnlyGuard,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/About.vue"),
      beforeEnter: webOnlyGuard,
    },
    {
      path: "/careers",
      name: "careers",
      component: () => import("../views/Careers.vue"),
      beforeEnter: webOnlyGuard,
    },
  ],
});

// =============================================================================
// NAVIGATION GUARDS
// =============================================================================

/**
 * Guard globale che gestisce l'autenticazione
 * - Blocca route protette se non autenticato
 * - Reindirizza utenti autenticati da pagine guest
 */
router.beforeEach(async (to, _from, next) => {
  const user = await getCurrentUser();

  if (to.meta.requiresAuth && !user) {
    // Route protetta ma utente non loggato → vai al login
    next("/login");
  } else if (to.meta.requiresGuest && user) {
    // Route per guest ma utente già loggato → vai alla dashboard
    next("/dashboard");
  } else {
    // Tutto ok, procedi
    next();
  }
});

/**
 * Hook che esegue dopo ogni navigazione
 * Riporta lo scroll in cima alla pagina
 */
router.afterEach(() => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  // Esegui scroll multipli per garantire che funzioni
  scrollToTop();
  setTimeout(scrollToTop, 0);
  setTimeout(scrollToTop, 10);
  setTimeout(scrollToTop, 100);
});

// =============================================================================
// EXPORT
// =============================================================================

export default router;
