import { useEffect } from 'react';
import { StatusBar } from './components/StatusBar';
import { useGatewayStore } from './stores/gatewayStore';
import { useConfigStore } from './stores/configStore';
import { ConfigEditor } from './features/config/components/ConfigEditor';

function App() {
    const { connect } = useGatewayStore();
    const { loadConfig, isLoading, error } = useConfigStore();

    useEffect(() => {
        // Initiate WebSocket connection
        connect('ws://127.0.0.1:3000/ws');
        // Load config from Tauri FS safely
        loadConfig();
    }, [connect, loadConfig]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-emerald-500">
                <div className="animate-pulse flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animation-delay-400"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-red-500 p-8 text-center">
                <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
                <p className="text-zinc-400 max-w-md">{error}</p>
                <button
                    onClick={() => loadConfig()}
                    className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-zinc-950 font-sans">
            <StatusBar />
            <ConfigEditor />
        </div>
    );
}

export default App;
