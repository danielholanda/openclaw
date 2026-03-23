import {
  LEMONADE_DEFAULT_API_KEY_ENV_VAR,
  LEMONADE_DEFAULT_BASE_URL,
  LEMONADE_MODEL_PLACEHOLDER,
  LEMONADE_PROVIDER_LABEL,
} from "openclaw/plugin-sdk/agent-runtime";
import {
  definePluginEntry,
  type OpenClawPluginApi,
  type ProviderAuthMethodNonInteractiveContext,
} from "openclaw/plugin-sdk/plugin-entry";

const PROVIDER_ID = "lemonade";

async function loadProviderSetup() {
  return await import("openclaw/plugin-sdk/self-hosted-provider-setup");
}

export default definePluginEntry({
  id: "lemonade",
  name: "Lemonade Provider",
  description: "Bundled Lemonade Server provider plugin",
  register(api: OpenClawPluginApi) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Lemonade",
      docsPath: "/providers/lemonade",
      envVars: ["LEMONADE_API_KEY"],
      auth: [
        {
          id: "custom",
          label: LEMONADE_PROVIDER_LABEL,
          hint: "Local AI server with GPU/NPU acceleration (OpenAI-compatible)",
          kind: "custom",
          run: async (ctx) => {
            const providerSetup = await loadProviderSetup();
            return await providerSetup.promptAndConfigureOpenAICompatibleSelfHostedProviderAuth({
              cfg: ctx.config,
              prompter: ctx.prompter,
              providerId: PROVIDER_ID,
              providerLabel: LEMONADE_PROVIDER_LABEL,
              defaultBaseUrl: LEMONADE_DEFAULT_BASE_URL,
              defaultApiKeyEnvVar: LEMONADE_DEFAULT_API_KEY_ENV_VAR,
              modelPlaceholder: LEMONADE_MODEL_PLACEHOLDER,
            });
          },
          runNonInteractive: async (ctx: ProviderAuthMethodNonInteractiveContext) => {
            const providerSetup = await loadProviderSetup();
            return await providerSetup.configureOpenAICompatibleSelfHostedProviderNonInteractive({
              ctx,
              providerId: PROVIDER_ID,
              providerLabel: LEMONADE_PROVIDER_LABEL,
              defaultBaseUrl: LEMONADE_DEFAULT_BASE_URL,
              defaultApiKeyEnvVar: LEMONADE_DEFAULT_API_KEY_ENV_VAR,
              modelPlaceholder: LEMONADE_MODEL_PLACEHOLDER,
            });
          },
        },
      ],
      discovery: {
        order: "late",
        run: async (ctx) => {
          const providerSetup = await loadProviderSetup();
          return await providerSetup.discoverOpenAICompatibleSelfHostedProvider({
            ctx,
            providerId: PROVIDER_ID,
            buildProvider: providerSetup.buildLemonadeProvider,
          });
        },
      },
      wizard: {
        setup: {
          choiceId: "lemonade",
          choiceLabel: "Lemonade",
          choiceHint: "Local AI server with GPU/NPU acceleration (OpenAI-compatible)",
          groupId: "lemonade",
          groupLabel: "Lemonade",
          groupHint: "Local AI server with GPU/NPU acceleration",
          methodId: "custom",
        },
        modelPicker: {
          label: "Lemonade (custom)",
          hint: "Enter Lemonade Server URL + API key + model",
          methodId: "custom",
        },
      },
    });
  },
});
