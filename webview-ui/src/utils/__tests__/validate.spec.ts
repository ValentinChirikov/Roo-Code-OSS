import type { ProviderSettings, OrganizationAllowList } from "@roo-code/types"

// Mock i18next to return translation keys with interpolated values
vi.mock("i18next", () => ({
	default: {
		t: (key: string, options?: Record<string, string>) => {
			if (options) {
				let result = key
				Object.entries(options).forEach(([k, v]) => {
					result += ` ${k}=${v}`
				})
				return result
			}
			return key
		},
	},
}))

import { getModelValidationError } from "../validate"

describe("Model Validation Functions", () => {
	const allowAllOrganization: OrganizationAllowList = {
		allowAll: true,
		providers: {},
	}

	describe("getModelValidationError", () => {
		it("returns undefined for OpenAI models when no router models provided", () => {
			const config: ProviderSettings = {
				apiProvider: "openai",
				openAiModelId: "gpt-4",
			}

			const result = getModelValidationError(config, undefined, allowAllOrganization)
			expect(result).toBeUndefined()
		})
	})
})
