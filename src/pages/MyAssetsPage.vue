<template>
  <div class="my-assets-page">
    <PageHeader title="My Assets">
      <template #actions>
        <BaseButton
          label="Export CSV"
          icon="pi pi-download"
          variant="primary"
          @click="exportCSV"
        />
      </template>
    </PageHeader>

    <BaseDataTable
      :data="portfolio"
      dataKey="id"
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
          <BaseButton
            icon="pi pi-trash"
            variant="danger"
            size="sm"
            @click="removeAsset(data.id)"
          />
        </template>
      </Column>
    </BaseDataTable>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Column from "primevue/column";
import { useForexStore } from "@/stores/forexStore";
import BaseDataTable from "@/components/molecules/BaseDataTable.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import PageHeader from "@/components/organism/PageHeader.vue";

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
</style>
