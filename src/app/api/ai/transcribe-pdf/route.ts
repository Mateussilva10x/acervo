import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Você é um assistente especializado em organizar anotações pastorais e de pregação.
Receberá o conteúdo de um PDF (livro, artigo, manuscrito ou esboço de sermão) e deve organizá-lo como uma nota estruturada.
Retorne APENAS um objeto JSON válido — sem markdown, sem explicações, sem texto adicional.`;

const USER_PROMPT = `Analise o conteúdo deste PDF e extraia as informações no formato JSON abaixo.
Preencha todos os campos que conseguir identificar. Use null para os que não existirem.

{
  "title": "título conciso da nota (máx 80 caracteres)",
  "content": "conteúdo organizado e expandido a partir do PDF",
  "themes": ["tema1", "tema2"],
  "bibleBook": "nome do livro bíblico em português, ou null",
  "bibleChapter": null,
  "bibleVerseStart": null,
  "bibleVerseEnd": null,
  "location": "local mencionado ou null"
}`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData inválido." }, { status: 400 });
  }

  const file = formData.get("pdf") as File | null;
  if (!file) {
    return NextResponse.json(
      { error: "Nenhum PDF enviado." },
      { status: 400 },
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "O arquivo enviado não é um PDF válido." },
      { status: 400 },
    );
  }

  // Limit: 32 MB (Claude's PDF limit)
  if (file.size > 32 * 1024 * 1024) {
    return NextResponse.json(
      { error: "PDF muito grande. O limite é de 32 MB." },
      { status: 413 },
    );
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "IA não retornou JSON válido." },
        { status: 500 },
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[transcribe-pdf]", err);
    return NextResponse.json(
      { error: "Falha ao processar PDF com IA." },
      { status: 500 },
    );
  }
}
