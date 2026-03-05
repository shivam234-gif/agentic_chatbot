import { create } from 'zustand';
import { GatewayWSClient, type GatewayStatus } from '../lib/ws-client';

interface GatewayState {
    status: GatewayStatus;
    client: GatewayWSClient;
    connect: () => void;
    disconnect: () => void;
    send: (data: unknown) => void;
}

const wsClient = new GatewayWSClient();

export const useGatewayStore = create<GatewayState>((set) => {
    // Wire status changes from the WS client into Zustand
    wsClient.onStatusChange = (status) => {
        set({ status });
    };

    return {
        status: 'DISCONNECTED',
        client: wsClient,

        connect: () => {
            wsClient.connect();
        },

        disconnect: () => {
            wsClient.disconnect();
            set({ status: 'DISCONNECTED' });
        },

        send: (data: unknown) => {
            wsClient.send(data);
        },
    };
});
