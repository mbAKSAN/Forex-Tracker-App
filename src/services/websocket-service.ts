export class ForexService {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly API_KEY = "d126uh1r01qmhi3gq930d126uh1r01qmhi3gq93g";
  private readonly MAJOR_PAIRS = [
    "OANDA:EUR_USD",
    "OANDA:GBP_USD",
    "OANDA:USD_JPY",
    "OANDA:USD_CHF",
    "OANDA:USD_CAD",
    "OANDA:AUD_USD",
    "OANDA:NZD_USD",
    "OANDA:EUR_GBP",
    "OANDA:EUR_JPY",
    "OANDA:GBP_JPY",
    "OANDA:CHF_JPY",
    "OANDA:EUR_CHF",
    "OANDA:EUR_CAD",
    "OANDA:AUD_JPY",
    "OANDA:GBP_CHF",
    "OANDA:EUR_AUD",
    "OANDA:EUR_NZD",
    "OANDA:GBP_AUD",
    "OANDA:AUD_CAD",
    "OANDA:AUD_NZD",
  ];

  async connectToForexFeed(onMessage: (data: any) => void): Promise<void> {
    try {
      if (this.reconnectTimer !== null) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.API_KEY}`);

      this.ws.onopen = () => {
        this.MAJOR_PAIRS.forEach((pair) => {
          this.ws?.send(
            JSON.stringify({
              type: "subscribe",
              symbol: pair,
            })
          );
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "trade" && data.data && data.data.length > 0) {
            onMessage(data.data);
          }
        } catch (error) {}
      };

      this.ws.onerror = (error) => {
        throw error;
      };

      this.ws.onclose = (event) => {
        if (event.code !== 1000) {
          this.reconnectTimer = setTimeout(() => {
            this.connectToForexFeed(onMessage);
          }, 5000);
        }
      };
    } catch (error) {
      throw error;
    }
  }

  disconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.MAJOR_PAIRS.forEach((pair) => {
        this.ws?.send(
          JSON.stringify({
            type: "unsubscribe",
            symbol: pair,
          })
        );
      });

      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
