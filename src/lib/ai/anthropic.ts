import Anthropic from "@anthropic-ai/sdk";
import type { StructuredLLM, StructuredRequest } from "./provider";

/**
 * Default model. Configurable via the `model` option or the ANTHROPIC_MODEL env var.
 * Confirm the exact model string on the first real run.
 *
 * Haiku is the cheapest tier — chosen to keep per-generation cost low. If copy quality
 * suffers, bump to `claude-sonnet-4-6` (balanced) or `claude-opus-4-8` (highest) via the env var.
 */
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_MAX_TOKENS = 16_000;

/**
 * Anthropic-backed `StructuredLLM` (ADR-0008). The ONLY file that imports the vendor SDK.
 *
 * Thin by design: it constrains the model's output to the supplied JSON Schema via a single
 * forced tool and returns the raw tool input. It does NOT validate against a Zod schema or
 * retry — `generateSite` owns that.
 *
 * ⚠️ Untested until run with a real `ANTHROPIC_API_KEY`. The two things only a real run can
 * confirm: (a) the model accepts `z.toJSONSchema(zSiteDocument)` as a tool `input_schema`
 * (nested `$defs`/`anyOf` from the section union are the suspect), and (b) the whole six-page
 * document fits comfortably in one tool call. If either is weak, switch to per-page generation.
 */
export class AnthropicStructuredLLM implements StructuredLLM {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Provide it via the environment or the `apiKey` option.",
      );
    }
    this.client = new Anthropic({ apiKey });
    this.model = opts.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  }

  async generateStructured(request: StructuredRequest): Promise<unknown> {
    const toolName = request.schemaName ?? "structured_output";

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.system ? { system: request.system } : {}),
      messages: [{ role: "user", content: request.prompt }],
      tools: [
        {
          name: toolName,
          description: request.schemaDescription ?? "Return the structured output.",
          input_schema: request.jsonSchema as Anthropic.Messages.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: toolName },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error(
        `Anthropic returned no tool_use block (stop_reason: ${response.stop_reason}).`,
      );
    }
    return toolUse.input;
  }
}
