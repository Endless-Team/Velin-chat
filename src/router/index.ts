import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("../views/Home.vue"),
            meta: { requiresGuest: true }
        },
        {
            path: "/login",
            name: "login",
            component: () => import("../views/Login.vue"),
            meta: { requiresGuest: true }
        },
        {
            path: "/dashboard",
            name: "dashboard",
            component: () => import("../views/Dashboard.vue"),
            meta: { requiresAuth: true }
        },
    ],
});

// Navigation Guard
router.beforeEach((to, _from, next) => {
    const user = auth.currentUser;

    if (to.meta.requiresAuth && !user) {
        next("/login");
    } else if (to.meta.requiresGuest && user) {
        next("/dashboard");
    } else {
        next();
    }
});
