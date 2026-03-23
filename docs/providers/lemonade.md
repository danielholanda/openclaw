---
summary: "Run OpenClaw with Lemonade Server (local AI with GPU/NPU acceleration, OpenAI-compatible)"
read_when:
  - You want to run OpenClaw against a local Lemonade Server instance
  - You want to use GPU or NPU-accelerated local models
  - You want OpenAI-compatible /api/v1 endpoints with Lemonade
title: "Lemonade"
---

# Lemonade

[Lemonade Server](https://lemonade-server.ai/) is a local AI server that provides an OpenAI-compatible HTTP API. It supports multiple backends (llama.cpp, ONNX Runtime GenAI, FastFlowLM, whisper.cpp, stable-diffusion.cpp) and can accelerate inference using CPU, GPU, and NPU hardware.

OpenClaw connects to Lemonade using the `openai-completions` API and can **auto-discover** available models.

## Quick start

1. Install and start Lemonade Server (see [Lemonade getting started](https://lemonade-server.ai/docs/getting_started/)):

```bash
lemonade-server serve
```

The server runs on `http://127.0.0.1:8000` by default, with OpenAI-compatible endpoints at `/api/v1/`.

2. Opt in (any value works since Lemonade does not enforce auth by default):

```bash
export LEMONADE_API_KEY="lemonade-local"
```

3. Select a model (replace with one of your Lemonade model IDs from `GET /api/v1/models`):

```json5
{
  agents: {
    defaults: {
      model: { primary: "lemonade/Qwen3-0.6B-GGUF" },
    },
  },
}
```

## Model discovery (implicit provider)

When `LEMONADE_API_KEY` is set (or an auth profile exists) and you **do not** define `models.providers.lemonade`, OpenClaw will query:

- `GET http://127.0.0.1:8000/api/v1/models`

...and convert the returned IDs into model entries.

If you set `models.providers.lemonade` explicitly, auto-discovery is skipped and you must define models manually.

## Explicit configuration (manual models)

Use explicit config when:

- Lemonade runs on a different host/port.
- You want to pin `contextWindow`/`maxTokens` values.
- You want to control which models are available.

```json5
{
  models: {
    providers: {
      lemonade: {
        baseUrl: "http://127.0.0.1:8000/api/v1",
        apiKey: "${LEMONADE_API_KEY}",
        api: "openai-completions",
        models: [
          {
            id: "Qwen3-0.6B-GGUF",
            name: "Qwen3 0.6B (GGUF)",
            reasoning: true,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 32768,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

## Supported backends

Lemonade Server supports multiple model backends:

| Backend              | Format       | Hardware               |
| -------------------- | ------------ | ---------------------- |
| llama.cpp            | .GGUF        | CPU, GPU (Vulkan/ROCm) |
| ONNX Runtime GenAI   | .ONNX        | NPU (Ryzen AI)         |
| FastFlowLM           | .q4nx        | NPU (Ryzen AI)         |
| whisper.cpp          | .bin         | CPU, NPU               |
| stable-diffusion.cpp | .safetensors | CPU, GPU               |

## Troubleshooting

- Check the server is reachable:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

- List available models:

```bash
curl http://127.0.0.1:8000/api/v1/models
```

- If models are not appearing, make sure they are downloaded via the Lemonade web app (`http://localhost:8000`) or the `/api/v1/pull` endpoint.

- If requests fail with auth errors, set a real `LEMONADE_API_KEY` that matches your server configuration, or configure the provider explicitly under `models.providers.lemonade`.
