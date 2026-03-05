export type GatewayStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

type MessageHandler = (data: unknown) => void;

/**
 * WebSocket client with exponential backoff reconnection.
 * Connects to the local OpenClaw Gateway on ws://127.0.0.1:3000.
 */
export class GatewayWSClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectInterval = 10_000; // 10s cap
    private baseInterval = 1_000; // 1s base
    private shouldReconnect = true;

    public onStatusChange: ((status: GatewayStatus) => void) | null = null;
    public onMessage: MessageHandler | null = null;

    constructor(url = 'ws://127.0.0.1:3000') {
        this.url = url;
    }

    connect(): void {
        if (this.ws) {
            this.ws.close();
        }

        this.onStatusChange?.('CONNECTING');

        try {
            this.ws = new WebSocket(this.url);
        } catch {
            this.onStatusChange?.('DISCONNECTED');
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            console.log('[GatewayWS] Connected');
            this.reconnectAttempts = 0;
            this.onStatusChange?.('CONNECTED');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data as string);
                this.onMessage?.(data);
            } catch {
                console.warn('[GatewayWS] Failed to parse message:', event.data);
            }
        };

        this.ws.onclose = () => {
            console.log('[GatewayWS] Disconnected');
            this.onStatusChange?.('DISCONNECTED');
            this.scheduleReconnect();
        };

        this.ws.onerror = () => {
            // onclose will fire after onerror, triggering reconnect
        };
    }

    private scheduleReconnect(): void {
        if (!this.shouldReconnect) return;

        const delay = Math.min(
            this.baseInterval * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectInterval
        );

        console.log(`[GatewayWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
        this.reconnectAttempts++;

        setTimeout(() => {
            if (this.shouldReconnect) {
                this.connect();
            }
        }, delay);
    }

    send(data: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('[GatewayWS] Cannot send — not connected');
        }
    }

    disconnect(): void {
        this.shouldReconnect = false;
        this.ws?.close();
        this.ws = null;
    }
}
