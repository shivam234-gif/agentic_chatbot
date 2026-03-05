import { Settings, Cpu, Globe, Server, MessageSquare } from 'lucide-react';

export type ConfigCategory = 'app' | 'openai' | 'anthropic' | 'google' | 'channels' | 'server';

interface ConfigSidebarProps {
    activeCategory: ConfigCategory;
    onSelect: (cat: ConfigCategory) => void;
}

export function ConfigSidebar({ activeCategory, onSelect }: ConfigSidebarProps) {
    const categories: { id: ConfigCategory; label: string; icon: React.ReactNode }[] = [
        { id: 'app', label: 'App Settings', icon: <Settings className="w-4 h-4" /> },
        { id: 'openai', label: 'OpenAI', icon: <Cpu className="w-4 h-4" /> },
        { id: 'anthropic', label: 'Anthropic', icon: <Cpu className="w-4 h-4" /> },
        { id: 'google', label: 'Google Gemini', icon: <Cpu className="w-4 h-4" /> },
        { id: 'channels', label: 'Channels', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'server', label: 'Gateway Server', icon: <Server className="w-4 h-4" /> },
    ];

    return (
        <div className="w-64 border-r border-zinc-800 bg-zinc-900 h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Configuration</h2>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${activeCategory === cat.id
                                ? 'bg-zinc-800 text-white font-medium'
                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                            }`}
                    >
                        {cat.icon}
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
