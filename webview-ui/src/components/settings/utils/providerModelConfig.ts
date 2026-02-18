import type { ProviderName, ModelInfo, ProviderSettings } from "@roo-code/types"
import { openAiNativeDefaultModelId } from "@roo-code/types"

import { MODELS_BY_PROVIDER } from "../constants"

export interface ProviderServiceConfig {
	serviceName: string
	serviceUrl: string
}

export const PROVIDER_SERVICE_CONFIG: Partial<Record<ProviderName, ProviderServiceConfig>> = {
	"openai-native": { serviceName: "OpenAI", serviceUrl: "https://platform.openai.com" },
	ollama: { serviceName: "Ollama", serviceUrl: "https://ollama.ai" },
	lmstudio: { serviceName: "LM Studio", serviceUrl: "https://lmstudio.ai/docs" },
	"vscode-lm": {
		serviceName: "VS Code LM",
		serviceUrl: "https://code.visualstudio.com/api/extension-guides/language-model",
	},
}

export const PROVIDER_DEFAULT_MODEL_IDS: Partial<Record<ProviderName, string>> = {
	"openai-native": openAiNativeDefaultModelId,
}

export const getProviderServiceConfig = (provider: ProviderName): ProviderServiceConfig => {
	return PROVIDER_SERVICE_CONFIG[provider] ?? { serviceName: provider, serviceUrl: "" }
}

export const getDefaultModelIdForProvider = (provider: ProviderName, apiConfiguration?: ProviderSettings): string => {
	return PROVIDER_DEFAULT_MODEL_IDS[provider] ?? ""
}

export const getStaticModelsForProvider = (
	provider: ProviderName,
	customArnLabel?: string,
): Record<string, ModelInfo> => {
	const models = MODELS_BY_PROVIDER[provider] ?? {}

	return models
}

/**
 * Checks if a provider uses static models from MODELS_BY_PROVIDER
 */
export const isStaticModelProvider = (provider: ProviderName): boolean => {
	return provider in MODELS_BY_PROVIDER
}

/**
 * List of providers that have their own custom model selection UI
 * and should not use the generic ModelPicker in ApiOptions
 */
export const PROVIDERS_WITH_CUSTOM_MODEL_UI: ProviderName[] = [
	"openai", // OpenAI Compatible
	"openai-codex", // OpenAI Codex has custom UI with auth and rate limits
	"litellm",
	"ollama",
	"lmstudio",
	"vscode-lm",
]

/**
 * Checks if a provider should use the generic ModelPicker
 */
export const shouldUseGenericModelPicker = (provider: ProviderName): boolean => {
	return isStaticModelProvider(provider) && !PROVIDERS_WITH_CUSTOM_MODEL_UI.includes(provider)
}

/**
 * Handles provider-specific side effects when a model is changed.
 * Centralizes provider-specific logic to keep it out of the ApiOptions template.
 */
export const handleModelChangeSideEffects = <K extends keyof ProviderSettings>(
	provider: ProviderName,
	modelId: string,
	setApiConfigurationField: (field: K, value: ProviderSettings[K]) => void,
): void => {
	// All providers: Clear reasoning effort when switching models to allow
	// the new model's default to take effect. Different models within the
	// same provider can have different reasoning effort defaults/options.
	setApiConfigurationField("reasoningEffort" as K, undefined as ProviderSettings[K])
}
