<template>
  <div class="my-assets-page">
    <div class="header-section">
      <h2 class="page-title">My Assets</h2>
      <Button
        label="Export CSV"
        icon="pi pi-download"
        class="export-btn"
        @click="exportCSV"
      />
    </div>

    <DataTable
      :value="portfolio"
      dataKey="id"
      class="datatable-custom"
      responsiveLayout="scroll"
      :emptyMessage="'No assets in your portfolio.'"
    >
      <Column field="symbol" header="Pair" sortable style="min-width: 8rem">
        <template #body="{ data }">
          {{ formatSymbol(data.symbol) }}
        </template>
      </Column>

      <Column
        field="purchasePrice"
        header="Price"
        sortable
        style="min-width: 8rem"
      >
        <template #body="{ data }">
          {{ data.purchasePrice.toFixed(5) }}
        </template>
      </Column>

      <Column field="volume" header="Volume" sortable style="min-width: 6rem">
        <template #body="{ data }">
          {{ data.volume.toFixed(2) }}
        </template>
      </Column>

      <Column header="Total Value" sortable style="min-width: 10rem">
        <template #body="{ data }">
          {{ (data.purchasePrice * data.volume).toFixed(5) }}
        </template>
      </Column>

      <Column>
        <template #body="{ data }">
          <Button
            icon="pi pi-trash"
            class="p-button-danger p-button-sm"
            @click="removeAsset(data.id)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { useForexStore } from "@/stores/forexStore";

const forexStore = useForexStore();
const portfolio = computed(() => forexStore.portfolio);

const removeAsset = (assetId: string) => {
  forexStore.removeFromPortfolio(assetId);
};

const exportCSV = () => {
  const headers = ["Pair", "Price", "Volume ", "Total Value"];
  const rows = portfolio.value.map((asset) => {
    const pair = forexStore.formatSymbol(asset.symbol);
    const price = asset.purchasePrice.toFixed(5);
    const vol = asset.volume.toFixed(2);
    const total = (asset.purchasePrice * asset.volume).toFixed(5);
    return [pair, price, vol, total].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `portfolio_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatSymbol = (symbol: string) => {
  return forexStore.formatSymbol(symbol);
};
</script>

<style scoped>
.my-assets-page {
  padding: 16px;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.export-btn {
  background-color: #2563eb !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  cursor: pointer !important;
}

.export-btn:hover {
  background-color: #1e40af !important;
}

.datatable-custom {
  width: 100%;
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.datatable-custom .p-datatable-thead > tr > th.p-sortable) {
  background-color: #eef2ff !important;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #d1d5db !important;
  color: #374151 !important;
  font-weight: 600 !important;
}

:deep(.datatable-custom .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #fafafa !important;
}

:deep(.datatable-custom .p-datatable-tbody td) {
  color: #59626ecc !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
}

:deep(.datatable-custom .p-datatable-tbody .p-datatable-empty-message) {
  text-align: center !important;
  padding: 24px !important;
  color: #6b7280 !important;
  font-style: italic !important;
}

:deep(.datatable-custom .p-datatable-tbody td .p-button-danger) {
  background-color: transparent !important;
  border: none !important;
  color: #b91c1c;
}

:deep(.datatable-custom .p-datatable-tbody td .p-button-danger:hover) {
  background-color: #d1c2c22e !important;
}

:deep(.datatable-custom .p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6 !important;
  cursor: pointer;
}

:deep(.datatable-custom .p-datatable-tbody > tr.p-highlight:hover) {
  background-color: #e0e7ff !important;
}
:deep(.p-datatable-column-sorted) {
  background-color: #0f8dda1a !important;
  color: #1f76df !important;
}
:deep(.p-datatable-column-sorted .p-datatable-sort-icon) {
  color: #1f76df !important;
}
</style>
