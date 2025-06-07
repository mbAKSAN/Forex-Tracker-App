import { ref, computed, onMounted, onUnmounted } from "vue";
import { ForexService } from "@/services/websocket-service";
import { useForexStore } from "@/stores/forexStore";
import type { ForexTrade } from "@/stores/forexStore";

export function useForex() {
  const forexService = new ForexService();
  const forexStore = useForexStore();
  const isConnecting = ref(false);
  const connectionError = ref<string | null>(null);
  const isComponentMounted = ref(false);

  const connect = async (): Promise<void> => {
    if (isConnecting.value || forexStore.isConnected) {
      return;
    }

    try {
      isConnecting.value = true;
      connectionError.value = null;

      await forexService.connectToForexFeed((trades: ForexTrade[]) => {
        if (!isComponentMounted.value) {
          return;
        }
        forexStore.updateTrades(trades);
      });

      forexStore.setConnectionState(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      connectionError.value = errorMessage;
      forexStore.setConnectionState(false, errorMessage);
    } finally {
      isConnecting.value = false;
    }
  };

  const disconnect = (): void => {
    try {
      forexService.disconnect();
      forexStore.setConnectionState(false);
      isComponentMounted.value = false;
    } catch (error) {}
  };

  const checkConnection = (): boolean => {
    const isConnected = forexService.isConnected();
    forexStore.setConnectionState(isConnected);
    return isConnected;
  };

  onMounted(() => {
    isComponentMounted.value = true;
    connect();
  });

  onUnmounted(() => {
    isComponentMounted.value = false;
    disconnect();
  });

  return {
    isConnecting,
    isConnected: computed(() => forexStore.isConnected),
    connectionError,
    isComponentMounted: computed(() => isComponentMounted.value),

    connect,
    disconnect,
    checkConnection,

    tradeList: computed(() => forexStore.tradeList),
    selectedPairs: computed(() => forexStore.selectedPairs),
    portfolio: computed(() => forexStore.portfolioWithCurrentPrices),
    totalPortfolioValue: computed(() => forexStore.totalPortfolioValue),

    togglePairSelection: forexStore.togglePairSelection,
    selectAllPairs: forexStore.selectAllPairs,
    clearSelection: forexStore.clearSelection,
    addToPortfolio: forexStore.addToPortfolio,
    removeFromPortfolio: forexStore.removeFromPortfolio,
    exportPortfolioToCSV: forexStore.exportPortfolioToCSV,
    formatSymbol: forexStore.formatSymbol,
  };
}
