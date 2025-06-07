export class ForexService {
    private ws: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly API_KEY = 'd1230lhr01qjtpe90scgd1230lhr01qjtpe90sd0';
    private readonly MAJOR_PAIRS = [
        'OANDA:EUR_USD', 'OANDA:GBP_USD', 'OANDA:USD_JPY', 'OANDA:USD_CHF',
        'OANDA:USD_CAD', 'OANDA:AUD_USD', 'OANDA:NZD_USD', 'OANDA:EUR_GBP',
        'OANDA:EUR_JPY', 'OANDA:GBP_JPY', 'OANDA:CHF_JPY', 'OANDA:EUR_CHF',
        'OANDA:EUR_CAD', 'OANDA:AUD_JPY', 'OANDA:GBP_CHF', 'OANDA:EUR_AUD',
        'OANDA:EUR_NZD', 'OANDA:GBP_AUD', 'OANDA:AUD_CAD', 'OANDA:AUD_NZD'
    ];

    async connectToForexFeed(onMessage: (data: any) => void): Promise<void> {
        try {

            if (this.reconnectTimer !== null) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.API_KEY}`);
            
            this.ws.onopen = () => {
                console.log('WebSocket connection opened');
                this.MAJOR_PAIRS.forEach(pair => {
                    this.ws?.send(JSON.stringify({
                        "type": "subscribe",
                        "symbol": pair
                    }));
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'trade' && data.data && data.data.length > 0) {
                        onMessage(data.data); 
                    }
                } catch (error) {
                     console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                 console.error('WebSocket error:', error);
                throw error;
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                this.reconnectTimer = setTimeout(() => {
                    this.connectToForexFeed(onMessage);
                }, 5000);
            };
        } catch (error) {
            console.error('Error in connectToForexFeed:', error);
            throw error;
        }
    }

    disconnect(): void {
        console.log("Disconnecting WebSocket");
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.MAJOR_PAIRS.forEach(pair => {
                this.ws?.send(JSON.stringify({
                    "type": "unsubscribe",
                    "symbol": pair
                }));
            });
            
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}