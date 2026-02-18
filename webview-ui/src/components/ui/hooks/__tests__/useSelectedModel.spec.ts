// npx vitest src/components/ui/hooks/__tests__/useSelectedModel.spec.ts

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react"
import type { Mock } from "vitest"

import { ProviderSettings, ModelInfo, litellmDefaultModelInfo, openAiModelInfoSaneDefaults } from "@roo-code/types"

import { useSelectedModel } from "../useSelectedModel"
import { useRouterModels } from "../useRouterModels"
import { useOpenRouterModelProviders } from "../useOpenRouterModelProviders"

vi.mock("../useRouterModels")

const mockUseRouterModels = useRouterModels as Mock<typeof useRouterModels>
const mockUseOpenRouterModelProviders = useOpenRouterModelProviders as Mock<typeof useOpenRouterModelProviders>

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	})
	return ({ children }: { children: React.ReactNode }) =>
		React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useSelectedModel", () => {
	describe("litellm provider", () => {
		beforeEach(() => {
			mockUseOpenRouterModelProviders.mockReturnValue({
				data: {},
				isLoading: false,
				isError: false,
			} as any)
		})

		it("should use litellmDefaultModelInfo as fallback when routerModels.litellm is empty", () => {
			mockUseRouterModels.mockReturnValue({
				data: {
					openrouter: {},
					requesty: {},
					litellm: {},
				},
				isLoading: false,
				isError: false,
			} as any)

			const apiConfiguration: ProviderSettings = {
				apiProvider: "litellm",
				litellmModelId: "some-model",
			}

			const wrapper = createWrapper()
			const { result } = renderHook(() => useSelectedModel(apiConfiguration), { wrapper })

			expect(result.current.provider).toBe("litellm")
			// Should fall back to default model ID since "some-model" doesn't exist in empty litellm models
			expect(result.current.id).toBe("claude-3-7-sonnet-20250219")
			// Should use litellmDefaultModelInfo as fallback
			expect(result.current.info).toEqual(litellmDefaultModelInfo)
		})

		it("should use litellmDefaultModelInfo when selected model not found in routerModels", () => {
			mockUseRouterModels.mockReturnValue({
				data: {
					openrouter: {},
					requesty: {},
					litellm: {
						"existing-model": {
							maxTokens: 4096,
							contextWindow: 8192,
							supportsImages: false,
							supportsPromptCache: false,
						},
					},
				},
				isLoading: false,
				isError: false,
			} as any)

			const apiConfiguration: ProviderSettings = {
				apiProvider: "litellm",
				litellmModelId: "non-existing-model",
			}

			const wrapper = createWrapper()
			const { result } = renderHook(() => useSelectedModel(apiConfiguration), { wrapper })

			expect(result.current.provider).toBe("litellm")
			// Falls back to default model ID
			expect(result.current.id).toBe("claude-3-7-sonnet-20250219")
			// Should use litellmDefaultModelInfo as fallback since default model also not in router models
			expect(result.current.info).toEqual(litellmDefaultModelInfo)
		})

		it("should return routerModels info when model exists", () => {
			const customModelInfo: ModelInfo = {
				maxTokens: 16384,
				contextWindow: 128000,
				supportsImages: true,
				supportsPromptCache: true,
				description: "Custom LiteLLM model",
			}

			mockUseRouterModels.mockReturnValue({
				data: {
					openrouter: {},
					requesty: {},
					litellm: {
						"custom-model": customModelInfo,
					},
				},
				isLoading: false,
				isError: false,
			} as any)

			const apiConfiguration: ProviderSettings = {
				apiProvider: "litellm",
				litellmModelId: "custom-model",
			}

			const wrapper = createWrapper()
			const { result } = renderHook(() => useSelectedModel(apiConfiguration), { wrapper })

			expect(result.current.provider).toBe("litellm")
			expect(result.current.id).toBe("custom-model")
			expect(result.current.info).toEqual(customModelInfo)
		})
	})

	describe("openai provider", () => {
		beforeEach(() => {
			mockUseRouterModels.mockReturnValue({
				data: {
					openrouter: {},
					requesty: {},
					litellm: {},
				},
				isLoading: false,
				isError: false,
			} as any)

			mockUseOpenRouterModelProviders.mockReturnValue({
				data: {},
				isLoading: false,
				isError: false,
			} as any)
		})

		it("should use openAiModelInfoSaneDefaults when no custom model info is provided", () => {
			const apiConfiguration: ProviderSettings = {
				apiProvider: "openai",
				openAiModelId: "gpt-4o",
			}

			const wrapper = createWrapper()
			const { result } = renderHook(() => useSelectedModel(apiConfiguration), { wrapper })

			expect(result.current.provider).toBe("openai")
			expect(result.current.id).toBe("gpt-4o")
			expect(result.current.info).toEqual(openAiModelInfoSaneDefaults)
		})

		it("should return custom model info when provided", () => {
			const customModelInfo: ModelInfo = {
				maxTokens: 16384,
				contextWindow: 128000,
				supportsImages: true,
				supportsPromptCache: false,
				inputPrice: 0.01,
				outputPrice: 0.03,
				description: "Custom OpenAI-compatible model",
			}

			const apiConfiguration: ProviderSettings = {
				apiProvider: "openai",
				openAiModelId: "custom-model",
				openAiCustomModelInfo: customModelInfo,
			}

			const wrapper = createWrapper()
			const { result } = renderHook(() => useSelectedModel(apiConfiguration), { wrapper })

			expect(result.current.provider).toBe("openai")
			expect(result.current.id).toBe("custom-model")
			expect(result.current.info).toEqual(customModelInfo)
		})

		it("should return custom model info as-is", () => {
			const customModelInfo: ModelInfo = {
				maxTokens: 8192,
				contextWindow: 32000,
				supportsImages: false,
				supportsPromptCache: false,
			}

			const apiConfiguration: ProviderSettings = {
				apiProvider: "openai",
				openAiModelId: "custom-model-no-tools",
				openAiCustomModelInfo: customModelInfo,
			}

			const wrapper = createWrapper()
			const { result } = renderHook(() => useSelectedModel(apiConfiguration), { wrapper })

			expect(result.current.provider).toBe("openai")
			expect(result.current.id).toBe("custom-model-no-tools")
			expect(result.current.info).toEqual(customModelInfo)
		})
	})
})
