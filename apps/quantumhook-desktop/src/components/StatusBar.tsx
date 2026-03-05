import React from 'react';
import { useGatewayStore } from '../stores/gatewayStore';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export function StatusBar() {
    const status = useGatewayStore((state) => state.status);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-8 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 justify-between text-xs z-50">
            <div className="flex items-center space-x-2">
                {status === 'CONNECTED' && (
                    <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-zinc-300">Gateway Connected</span>
                    </>
                )}
                {status === 'CONNECTING' && (
                    <>
                        <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                        <span className="text-zinc-300">Connecting to Gateway...</span>
                    </>
                )}
                {status === 'DISCONNECTED' && (
                    <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-zinc-300">Gateway Disconnected</span>
                    </>
                )}
            </div>
            <div className="text-zinc-500">
                Port: 3000
            </div>
        </div>
    );
}
