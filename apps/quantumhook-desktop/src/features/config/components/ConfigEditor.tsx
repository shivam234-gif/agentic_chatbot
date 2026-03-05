import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfigStore } from '../../../stores/configStore';
import { OpenClawConfig, OpenClawConfigSchema, OpenAIModels, AnthropicModels, GeminiModels } from '../schema/config.schema';
import { ConfigSidebar, ConfigCategory } from './ConfigSidebar';
import { AlertCircle, Save, Check } from 'lucide-react';

export function ConfigEditor() {
    const { config, saveConfig } = useConfigStore();
    const [activeCategory, setActiveCategory] = useState<ConfigCategory>('app');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty },
    } = useForm<OpenClawConfig>({
        resolver: zodResolver(OpenClawConfigSchema),
        defaultValues: config,
    });

    // Re-sync form if store config changes exactly once or on deep merge updates
    useEffect(() => {
        reset(config);
    }, [config, reset]);

    const onSubmit = async (data: OpenClawConfig) => {
        setIsSaving(true);
        await saveConfig(data);
        reset(data); // reset dirty state
        setIsSaving(false);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden pt-12">
            <ConfigSidebar activeCategory={activeCategory} onSelect={setActiveCategory} />

            <div className="flex-1 flex flex-col relative">
                {/* Header toolbar */}
                <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50">
                    <h2 className="text-lg font-medium capitalize">{activeCategory} Settings</h2>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isDirty || isSaving}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isDirty
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                        >
                            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
                    <form className="max-w-2xl space-y-8" id="config-form" onSubmit={handleSubmit(onSubmit)}>

                        {activeCategory === 'app' && (
                            <section className="space-y-6">
                                <div>
                                    <h3 className="text-base font-medium text-white">Application Theme</h3>
                                    <p className="text-sm text-zinc-400 mt-1">Select your preferred color scheme.</p>
                                    <select
                                        {...register('app.theme')}
                                        className="mt-3 block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="system">System Default</option>
                                        <option value="dark">Dark</option>
                                        <option value="light">Light</option>
                                    </select>
                                </div>

                                <div className="pt-4 border-t border-zinc-800">
                                    <h3 className="text-base font-medium text-white">Experience Mode</h3>
                                    <p className="text-sm text-zinc-400 mt-1">Tailor the UI complexity to your needs.</p>
                                    <select
                                        {...register('app.uxMode')}
                                        className="mt-3 block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="consumer">Consumer (Simple)</option>
                                        <option value="power_user">Power User (Advanced)</option>
                                        <option value="developer">Developer (Raw Configs & Logs)</option>
                                    </select>
                                </div>
                            </section>
                        )}

                        {activeCategory === 'openai' && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-white">OpenAI Provider</h3>
                                        <p className="text-sm text-zinc-400">Configure GPT models.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('providers.openai.enabled')} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">API Key</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            placeholder="sk-proj-..."
                                            {...register('providers.openai.apiKey')}
                                            className={`block w-full rounded-md bg-zinc-900 border py-2 px-3 text-sm focus:outline-none focus:ring-1 ${errors.providers?.openai?.apiKey ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500'}`}
                                        />
                                        {errors.providers?.openai?.apiKey && (
                                            <p className="mt-2 text-sm text-red-500 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.providers.openai.apiKey.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Default Model</label>
                                    <select
                                        {...register('providers.openai.model')}
                                        className="block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {OpenAIModels.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </section>
                        )}

                        {/* Same structure for Anthropic / Google / Server / Channels ... */}
                        {activeCategory === 'anthropic' && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-white">Anthropic Provider</h3>
                                        <p className="text-sm text-zinc-400">Configure Claude models.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('providers.anthropic.enabled')} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="sk-ant-..."
                                        {...register('providers.anthropic.apiKey')}
                                        className="block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Default Model</label>
                                    <select
                                        {...register('providers.anthropic.model')}
                                        className="block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {AnthropicModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </section>
                        )}

                        {activeCategory === 'google' && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-white">Google Gemini</h3>
                                        <p className="text-sm text-zinc-400">Configure Gemini models.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('providers.google.enabled')} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="AIzaSy..."
                                        {...register('providers.google.apiKey')}
                                        className="block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Default Model</label>
                                    <select
                                        {...register('providers.google.model')}
                                        className="block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {GeminiModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </section>
                        )}

                        {activeCategory === 'server' && (
                            <section className="space-y-6">
                                <div>
                                    <h3 className="text-base font-medium text-white">Gateway Server Port</h3>
                                    <p className="text-sm text-zinc-400 mt-1">Local port for the sidecar process.</p>
                                    <input
                                        type="number"
                                        {...register('server.port', { valueAsNumber: true })}
                                        className={`mt-3 block w-full rounded-md border bg-zinc-900 py-2 px-3 text-sm focus:outline-none focus:ring-1 ${errors.server?.port ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500'}`}
                                    />
                                    {errors.server?.port && (
                                        <p className="mt-2 text-sm text-red-500 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.server.port.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-white">Gateway Host</h3>
                                    <p className="text-sm text-zinc-400 mt-1">Bind address.</p>
                                    <input
                                        type="text"
                                        {...register('server.host')}
                                        className="mt-3 block w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </section>
                        )}

                        {activeCategory === 'channels' && (
                            <section className="space-y-6">
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <p className="text-sm text-zinc-400">Advanced channel onboarding will be available in Phase 2. Basic flags currently active.</p>
                                </div>
                            </section>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
}
