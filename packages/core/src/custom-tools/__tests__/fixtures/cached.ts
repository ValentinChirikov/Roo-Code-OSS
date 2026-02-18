import { parametersSchema, defineCustomTool } from "@roo-code-oss/types"

export default defineCustomTool({
	name: "cached",
	description: "Cached tool",
	parameters: parametersSchema.object({}),
	async execute() {
		return "cached"
	},
})
