import { NextResponse } from "next/server";
import type { ComparisonFacts } from "@/data/comparison-facts";
import {
  buildInsightUserPrompt,
  INSIGHT_SYSTEM_PROMPT,
  normalizeInsightResponse,
} from "@/lib/insight-prompt";

export const runtime = "nodejs";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";

function isComparisonFacts(value: unknown): value is ComparisonFacts {
  if (!value || typeof value !== "object") return false;

  const facts = value as ComparisonFacts;
  if (typeof facts.age !== "number" || typeof facts.tab !== "string") {
    return false;
  }

  if (!Array.isArray(facts.players) || facts.players.length < 2) {
    return false;
  }

  return facts.players.every(
    (player) =>
      typeof player.name === "string" &&
      (player.rank == null || typeof player.rank === "number") &&
      typeof player.gsTitles === "number" &&
      typeof player.gsFinals === "number" &&
      typeof player.weeksAtNo1 === "number",
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isComparisonFacts(body)) {
    return NextResponse.json(
      { error: "Invalid comparison facts payload." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          { role: "system", content: INSIGHT_SYSTEM_PROMPT },
          { role: "user", content: buildInsightUserPrompt(body) },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate insight." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    const insight = content ? normalizeInsightResponse(content) : null;

    if (!insight) {
      return NextResponse.json(
        { error: "Insufficient data for insight." },
        { status: 422 },
      );
    }

    return NextResponse.json({ insight, source: "ai" as const });
  } catch (error) {
    console.error("Insight generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate insight." },
      { status: 500 },
    );
  }
}
