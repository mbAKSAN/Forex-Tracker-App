<template>
  <div class="layout-container">
    <aside class="sidebar">
      <h3 class="Menu_Header">Menu</h3>
      <Menu
        :model="menuItems"
        :autoDisplay="false"
        class="custom-menu"
        style="width: 100%; border: none"
      />
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Menu from "primevue/menu";
import { useRouter } from "vue-router";

const router = useRouter();

const menuItems = ref([
  {
    label: "Tracker",
    icon: "pi pi-chart-line",
    command: () => router.push("/tracker"),
  },
  {
    label: "My Assets",
    icon: "pi pi-wallet",
    command: () => router.push("/assets"),
  },
]);
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f3f4f6;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 16rem;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.custom-menu {
  flex: 1;
  overflow-y: auto;
  padding-top: 0.5rem;
}

:deep(.custom-menu .p-menuitem-link) {
  display: flex !important;
  align-items: center;
  padding: 0.75rem 1rem !important;
  color: #374151 !important;
  font-size: 1rem;
  border-radius: 0.375rem !important;
  transition: background-color 0.2s !important;
}

:deep(.custom-menu .p-menuitem-link .p-menuitem-icon) {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  color: inherit !important;
}

:deep(.custom-menu .p-menuitem-link:hover) {
  background-color: #eef2ff !important;
}

:deep(.custom-menu .p-menuitem-active > .p-menuitem-link) {
  background-color: #e0f2fe !important;
  color: #0369a1 !important;
}

:deep(.custom-menu .p-menuitem-active > .p-menuitem-link .p-menuitem-icon) {
  color: #0369a1 !important;
}

.main-content {
  margin-left: 16rem;
  flex: 1;
  overflow-y: auto;
  background-color: #f3f4f6;
}
.Menu_Header {
  text-align: center;
}
</style>
