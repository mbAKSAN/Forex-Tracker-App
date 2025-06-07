import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import TrackerPage from "@/pages/TrackerPage.vue";
import MyAssetsPage from "@/pages/MyAssetsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/tracker",
  },
  {
    path: "/tracker",
    name: "Tracker",
    component: TrackerPage,
  },
  {
    path: "/assets",
    name: "MyAssets",
    component: MyAssetsPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
