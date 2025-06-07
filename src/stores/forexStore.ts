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

export const useForexStore = defineStore('forex', {
  state: () => ({
    lastTrades: {} as ForexTradeMap,
    previousPrices: {} as Record<string, number>,
   
    portfolio: [] as PortfolioAsset[],
    
  
    selectedPairs: [] as string[],
    isConnected: false,
    connectionError: null as string | null,
  }),

  getters: {
 
    tradeList: (state) => {
      return Object.values(state.lastTrades)
        .sort((a, b) => b.t - a.t); 
    },

  
    selectedTradeList: (state) => {
      console.log('TestForex',state)
      return state.selectedPairs
        .map(symbol => state.lastTrades[symbol])
        .filter(Boolean)
        .sort((a, b) => b.t - a.t);
    },

   
    portfolioWithCurrentPrices: (state) => {
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

   
    totalPortfolioValue: (state) => {
      return state.portfolio.reduce((total, asset) => {
        const currentPrice = state.lastTrades[asset.symbol]?.p || asset.purchasePrice;
        return total + (currentPrice * asset.volume);
      }, 0);
    },

   
    formatSymbol: () => (symbol: string) => {
      return symbol.replace('OANDA:', '').replace('_', '/');
    }
  },

  actions: {
    
    updateTrades(trades: ForexTrade[]) {
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

   
    togglePairSelection(symbol: string) {
      const index = this.selectedPairs.indexOf(symbol);
      if (index > -1) {
        this.selectedPairs.splice(index, 1);
      } else {
        this.selectedPairs.push(symbol);
      }
    },

    selectAllPairs() {
      this.selectedPairs = Object.keys(this.lastTrades);
    },

    clearSelection() {
      this.selectedPairs = [];
    },

  
    addToPortfolio(symbol: string, volume: number) {
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
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          symbol,
          purchasePrice: currentTrade.p,
          volume,
          purchaseDate: new Date()
        };
        this.portfolio.push(newAsset);
      }
    },

    removeFromPortfolio(assetId: string) {
      const index = this.portfolio.findIndex(asset => asset.id === assetId);
      if (index > -1) {
        this.portfolio.splice(index, 1);
      }
    },

  
    exportPortfolioToCSV() {
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
          asset.profitLossPercentage?.toFixed(3) + '%' || 'N/A',
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

   
    setConnectionState(connected: boolean, error: string | null = null) {
      this.isConnected = connected;
      this.connectionError = error;
    },

   
    clearTrades() {
      this.lastTrades = {};
      this.previousPrices = {};
    },

    clearAll() {
      this.clearTrades();
      this.portfolio = [];
      this.selectedPairs = [];
      this.isConnected = false;
      this.connectionError = null;
    }
  },

 
});
