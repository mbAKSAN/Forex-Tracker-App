import { defineStore } from 'pinia';

export interface ForexTrade {
  c: string[] | null; 
  p: number;          
  s: string;          
  t: number;         
  v: number;          
  change?: number;    
  direction?: 'up' | 'down' | 'none'; 
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  purchasePrice: number;
  volume: number;
  purchaseDate: Date;
  currentPrice?: number;
  totalValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

type ForexTradeMap = Record<string, ForexTrade>;

interface ForexStoreState {
  lastTrades: ForexTradeMap;
  previousPrices: Record<string, number>;
  portfolio: PortfolioAsset[];
  selectedPairs: string[];
  isConnected: boolean;
  connectionError: string | null;
}

export const useForexStore = defineStore('forex', {
  state: (): ForexStoreState => ({
    lastTrades: {},
    previousPrices: {},
    portfolio: [],
    selectedPairs: [],
    isConnected: false,
    connectionError: null,
  }),

  getters: {
    tradeList: (state): ForexTrade[] => {
      return Object.values(state.lastTrades)
        .sort((a, b) => b.t - a.t); 
    },

    selectedTradeList: (state): ForexTrade[] => {
      return state.selectedPairs
        .map(symbol => state.lastTrades[symbol])
        .filter((trade): trade is ForexTrade => Boolean(trade))
        .sort((a, b) => b.t - a.t);
    },

    portfolioWithCurrentPrices: (state): PortfolioAsset[] => {
      return state.portfolio.map(asset => {
        const currentTrade = state.lastTrades[asset.symbol];
        const currentPrice = currentTrade?.p || asset.purchasePrice;
        const totalValue = currentPrice * asset.volume;
        const profitLoss = totalValue - (asset.purchasePrice * asset.volume);
        const profitLossPercentage = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;

        return {
          ...asset,
          currentPrice,
          totalValue,
          profitLoss,
          profitLossPercentage: Number(profitLossPercentage.toFixed(3))
        };
      });
    },

    totalPortfolioValue: (state): number => {
      return state.portfolio.reduce((total, asset) => {
        const currentPrice = state.lastTrades[asset.symbol]?.p || asset.purchasePrice;
        return total + (currentPrice * asset.volume);
      }, 0);
    },

    formatSymbol: () => (symbol: string): string => {
      return symbol.replace('OANDA:', '').replace('_', '/');
    }
  },

  actions: {
    updateTrades(trades: ForexTrade[]): void {
      trades.forEach(trade => {
        const prev = this.lastTrades[trade.s]?.p;
        let change: number | undefined;
        let direction: 'up' | 'down' | 'none' = 'none';

        if (typeof prev === 'number') {
          change = prev !== 0 ? ((trade.p - prev) / prev) * 100 : 0;
          if (change > 0) direction = 'up';
          else if (change < 0) direction = 'down';
          else direction = 'none';
        }

        this.lastTrades[trade.s] = {
          ...trade,
          change: change !== undefined ? Number(change.toFixed(3)) : undefined,
          direction,
        };

        this.previousPrices[trade.s] = prev ?? trade.p;
      });
    },

    togglePairSelection(symbol: string): void {
      const index = this.selectedPairs.indexOf(symbol);
      if (index > -1) {
        this.selectedPairs.splice(index, 1);
      } else {
        this.selectedPairs.push(symbol);
      }
    },

    selectAllPairs(): void {
      this.selectedPairs = Object.keys(this.lastTrades);
    },

    clearSelection(): void {
      this.selectedPairs = [];
    },

    addToPortfolio(symbol: string, volume: number): void {
      const currentTrade = this.lastTrades[symbol];
      if (!currentTrade) {
        throw new Error('Current price not available for this pair');
      }

      const existingAssetIndex = this.portfolio.findIndex(asset => asset.symbol === symbol);
      
      if (existingAssetIndex > -1) {
        const existingAsset = this.portfolio[existingAssetIndex];
        const totalVolume = existingAsset.volume + volume;
        const totalCost = (existingAsset.purchasePrice * existingAsset.volume) + (currentTrade.p * volume);
        const averagePrice = totalCost / totalVolume;

        this.portfolio[existingAssetIndex] = {
          ...existingAsset,
          volume: totalVolume,
          purchasePrice: averagePrice
        };
      } else {
        const newAsset: PortfolioAsset = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          symbol,
          purchasePrice: currentTrade.p,
          volume,
          purchaseDate: new Date()
        };
        this.portfolio.push(newAsset);
      }
    },

    removeFromPortfolio(assetId: string): void {
      const index = this.portfolio.findIndex(asset => asset.id === assetId);
      if (index > -1) {
        this.portfolio.splice(index, 1);
      }
    },

    exportPortfolioToCSV(): void {
      const portfolioData = this.portfolioWithCurrentPrices;
      const headers = ['Pair', 'Purchase Price', 'Current Price', 'Volume', 'Total Value', 'Profit/Loss', 'Profit/Loss %', 'Purchase Date'];
      
      const csvContent = [
        headers.join(','),
        ...portfolioData.map(asset => [
          this.formatSymbol(asset.symbol),
          asset.purchasePrice.toFixed(5),
          asset.currentPrice?.toFixed(5) || 'N/A',
          asset.volume.toString(),
          asset.totalValue?.toFixed(2) || 'N/A',
          asset.profitLoss?.toFixed(2) || 'N/A',
          (asset.profitLossPercentage?.toFixed(3) || 'N/A') + '%',
          asset.purchaseDate.toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `forex_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    setConnectionState(connected: boolean, error: string | null = null): void {
      this.isConnected = connected;
      this.connectionError = error;
    },

    clearTrades(): void {
      this.lastTrades = {};
      this.previousPrices = {};
    },

    clearAll(): void {
      this.clearTrades();
      this.portfolio = [];
      this.selectedPairs = [];
      this.isConnected = false;
      this.connectionError = null;
    },

    savePortfolioToLocalStorage(): void {
      try {
        localStorage.setItem('forex-portfolio', JSON.stringify(this.portfolio));
      } catch (error) {
        console.error('Failed to save portfolio to localStorage:', error);
      }
    },

    loadPortfolioFromLocalStorage(): void {
      try {
        const savedPortfolio = localStorage.getItem('forex-portfolio');
        if (savedPortfolio) {
          const parsed = JSON.parse(savedPortfolio);
          this.portfolio = parsed.map((asset: any) => ({
            ...asset,
            purchaseDate: new Date(asset.purchaseDate)
          }));
        }
      } catch (error) {
        console.error('Failed to load portfolio from localStorage:', error);
      }
    }
  }
});