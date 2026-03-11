import { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useConfigStore } from '../../../stores/configStore';
import { OpenClawConfigSchema } from '../schema/config.schema';

interface RawJsonEditorProps {
    onValidChange: (isValid: boolean) => void;
}

export function RawJsonEditor({ onValidChange }: RawJsonEditorProps) {
    const { config, saveConfig } = useConfigStore();
    const [localValue, setLocalValue] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const monaco = useMonaco();

    useEffect(() => {
        if (!localValue && Object.keys(config).length > 0) {
            setLocalValue(JSON.stringify(config, null, 2));
        }
    }, [config, localValue]);

    useEffect(() => {
        if (monaco) {
            // use any to bypass strict type bound errors in some environments
            const mj = (monaco.languages as any).json;
            if (mj && mj.jsonDefaults) {
                mj.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    schemas: [{
                        uri: 'http://quantumhook/openclaw.json',
                        fileMatch: ['*'],
                        schema: {
                            type: 'object',
                            properties: {
                                server: { type: 'object' },
                                providers: { type: 'object' },
                                app: { type: 'object' },
                                channels: { type: 'object' }
                            }
                        }
                    }]
                });
            }
        }
    }, [monaco]);

    const handleEditorChange = (value: string | undefined) => {
        const val = value || '';
        setLocalValue(val);

        try {
            const parsed = JSON.parse(val);
            const validData = OpenClawConfigSchema.parse(parsed);
            setErrorMsg(null);
            onValidChange(true);
            saveConfig(validData);
        } catch (err) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg('Invalid Config format.');
            }
            onValidChange(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
            {errorMsg && (
                <div className="absolute bottom-4 left-4 right-4 z-10 bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded shadow-lg">
                    <p className="text-sm font-semibold mb-1">Validation Error</p>
                    <p className="text-xs font-mono break-words">{errorMsg}</p>
                </div>
            )}
            <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={localValue}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    formatOnPaste: true,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 24 }
                }}
                loading={<div className="p-8 text-zinc-500 animate-pulse">Loading Monaco Editor...</div>}
            />
        </div>
    );
}
