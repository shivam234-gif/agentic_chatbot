const { z } = require('zod');
const LLMProviderSchema = z.object({
    apiKey: z.string().min(1, 'API key is required'),
    enabled: z.boolean().default(true),
});

const OpenAIModels = ['gpt-4o'];

const OpenClawConfigSchema = z.object({
    providers: z.object({
        openai: LLMProviderSchema.extend({
            model: z.enum(OpenAIModels).default('gpt-4o'),
        }).optional(),
    }),
});

try {
  console.log(OpenClawConfigSchema.parse({}));
} catch (e) {
  console.error("ZOD ERROR:", e.errors);
}
