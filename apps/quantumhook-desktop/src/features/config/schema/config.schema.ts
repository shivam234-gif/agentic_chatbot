import { z } from 'zod';

// ─── LLM Provider Schema ──────────────────────────────

const LLMProviderSchema = z.object({
    apiKey: z.string().min(1, 'API key is required'),
    enabled: z.boolean().default(true),
});

const OpenAIModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'o1',
    'o1-mini',
    'o3-mini',
] as const;

const AnthropicModels = [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
] as const;

const GeminiModels = [
    'gemini-2.5-pro-preview-06-05',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
] as const;

// ─── Full Config Schema ────────────────────────────────

export const OpenClawConfigSchema = z.object({
    providers: z.object({
        openai: LLMProviderSchema.extend({
            model: z.enum(OpenAIModels).default('gpt-4o'),
        }).optional(),
        anthropic: LLMProviderSchema.extend({
            model: z.enum(AnthropicModels).default('claude-sonnet-4-20250514'),
        }).optional(),
        google: LLMProviderSchema.extend({
            model: z.enum(GeminiModels).default('gemini-2.5-flash-preview-05-20'),
        }).optional(),
    }),
    server: z.object({
        port: z.number().int().min(1024).max(65535).default(3000),
        host: z.string().default('127.0.0.1'),
    }).default({ port: 3000, host: '127.0.0.1' }),
});

// ─── Inferred TypeScript types ─────────────────────────

export type OpenClawConfig = z.infer<typeof OpenClawConfigSchema>;
export type LLMProvider = z.infer<typeof LLMProviderSchema>;

// ─── Exports for model dropdowns ───────────────────────

export { OpenAIModels, AnthropicModels, GeminiModels };
