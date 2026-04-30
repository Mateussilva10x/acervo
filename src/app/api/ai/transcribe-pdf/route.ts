import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData inválido." }, { status: 400 });
  }

  const file = formData.get("pdf") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Nenhum PDF enviado." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "O arquivo enviado não é um PDF válido." },
      { status: 400 },
    );
  }

  if (file.size > 32 * 1024 * 1024) {
    return NextResponse.json(
      { error: "PDF muito grande. O limite é de 32 MB." },
      { status: 413 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);

    const title = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
    const content = data.text.trim();

    return NextResponse.json({ title, content });
  } catch (err) {
    console.error("[transcribe-pdf]", err);
    return NextResponse.json(
      { error: "Falha ao extrair texto do PDF." },
      { status: 500 },
    );
  }
}
