import { create } from 'zustand';
import { BaseDirectory, readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import type { OpenClawConfig } from '../features/config/schema/config.schema';
import { OpenClawConfigSchema } from '../features/config/schema/config.schema';

const CONFIG_FILENAME = 'openclaw.json';

interface ConfigState {
    config: OpenClawConfig;
    isLoading: boolean;
    error: string | null;
    loadConfig: () => Promise<void>;
    saveConfig: (newConfig: OpenClawConfig) => Promise<void>;
    resetConfig: () => Promise<void>;
}

// Generate the fully expanded default object
const DEFAULT_CONFIG = OpenClawConfigSchema.parse({});

// Helper to check if we are actually running inside Tauri 
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const useConfigStore = create<ConfigState>((set) => ({
    config: DEFAULT_CONFIG,
    isLoading: true,
    error: null,

    loadConfig: async () => {
        try {
            set({ isLoading: true, error: null });

            if (!isTauri()) {
                console.warn('[configStore] Not running in Tauri context. Using default config.');
                set({ config: DEFAULT_CONFIG, isLoading: false });
                return;
            }

            const fileExists = await exists(CONFIG_FILENAME, { baseDir: BaseDirectory.AppData });
            if (!fileExists) {
                // If no config exists, save the default one
                await writeTextFile(CONFIG_FILENAME, JSON.stringify(DEFAULT_CONFIG, null, 2), {
                    baseDir: BaseDirectory.AppData,
                });
                set({ config: DEFAULT_CONFIG, isLoading: false });
                return;
            }

            const rawContent = await readTextFile(CONFIG_FILENAME, { baseDir: BaseDirectory.AppData });
            const parsed = JSON.parse(rawContent);

            // Validate against our schema. If it fails, we catch and show error.
            const validConfig = OpenClawConfigSchema.parse(parsed);

            set({ config: validConfig, isLoading: false });
        } catch (err) {
            console.error('Failed to load config:', err);
            // Attempt to salvage partially broken configs or show a severe error
            set({
                error: err instanceof Error ? err.message : 'Unknown config parsing error.',
                isLoading: false
            });
        }
    },

    saveConfig: async (newConfig: OpenClawConfig) => {
        try {
            set({ isLoading: true, error: null });

            if (!isTauri()) {
                console.warn('[configStore] Not running in Tauri context. Cannot save to FS.');
                set({ config: newConfig, isLoading: false });
                return;
            }

            // Ensure the AppData directory actually exists before writing
            const dirExists = await exists('', { baseDir: BaseDirectory.AppData });
            if (!dirExists) {
                await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
            }

            // Format nicely for developers
            const fileContent = JSON.stringify(newConfig, null, 2);
            await writeTextFile(CONFIG_FILENAME, fileContent, {
                baseDir: BaseDirectory.AppData,
            });

            set({ config: newConfig, isLoading: false });
        } catch (err) {
            console.error('Failed to save config:', err);
            set({
                error: err instanceof Error ? err.message : 'Unknown save error.',
                isLoading: false
            });
        }
    },

    resetConfig: async () => {
        try {
            set({ isLoading: true, error: null });

            if (!isTauri()) {
                set({ config: DEFAULT_CONFIG, isLoading: false });
                return;
            }

            await writeTextFile(CONFIG_FILENAME, JSON.stringify(DEFAULT_CONFIG, null, 2), {
                baseDir: BaseDirectory.AppData,
            });
            set({ config: DEFAULT_CONFIG, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to reset config.', isLoading: false });
        }
    }
}));
