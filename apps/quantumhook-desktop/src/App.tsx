import { useEffect } from 'react';
import { StatusBar } from './components/StatusBar';
import { useGatewayStore } from './stores/gatewayStore';

function App() {
    const connect = useGatewayStore((state) => state.connect);
    const disconnect = useGatewayStore((state) => state.disconnect);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return (
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-white pb-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Quantumhook Desktop</h1>
                <p className="text-zinc-400">OpenClaw Gateway Sidecar Architecture</p>
            </div>
            <StatusBar />
        </div>
    );
}

export default App;
