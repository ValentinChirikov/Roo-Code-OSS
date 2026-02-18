import { RooCodeSettings } from "@roo-code/types"

import type { SupportedProvider } from "@/types/index.js"

const envVarMap: Record<SupportedProvider, string> = {
	"openai-native": "OPENAI_API_KEY",
}

export function getEnvVarName(provider: SupportedProvider): string {
	return envVarMap[provider]
}

export function getApiKeyFromEnv(provider: SupportedProvider): string | undefined {
	const envVar = getEnvVarName(provider)
	return process.env[envVar]
}

export function getProviderSettings(
	provider: SupportedProvider,
	apiKey: string | undefined,
	model: string | undefined,
): RooCodeSettings {
	const config: RooCodeSettings = { apiProvider: provider }

	switch (provider) {
		case "openai-native":
			if (apiKey) config.openAiNativeApiKey = apiKey
			if (model) config.apiModelId = model
			break
		default:
			if (apiKey) config.apiKey = apiKey
			if (model) config.apiModelId = model
	}

	return config
}
