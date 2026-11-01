import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

import { isTokenExpired } from "@/lib/jwt";

const BACKEND = process.env.API_URL ?? "http://localhost:8080";

/** Limite por arquivo. Parsear PDF é caro em CPU e memória. */
const MAX_BYTES = 32 * 1024 * 1024;

/**
 * Janela simples de uso por sessão, em memória do processo.
 *
 * Não substitui um rate limit de verdade (com várias instâncias cada uma tem o
 * seu contador), mas já impede que um único usuário ocupe o servidor com
 * uploads em sequência.
 */
const JANELA_MS = 60_000;
const MAX_POR_JANELA = 10;
const usoPorToken = new Map<string, { contagem: number; expiraEm: number }>();

function excedeuCota(chave: string): boolean {
  const agora = Date.now();
  const atual = usoPorToken.get(chave);

  if (!atual || agora > atual.expiraEm) {
    usoPorToken.set(chave, { contagem: 1, expiraEm: agora + JANELA_MS });
    return false;
  }

  atual.contagem += 1;
  return atual.contagem > MAX_POR_JANELA;
}

/** Remove entradas vencidas para o Map não crescer sem limite. */
function limparExpirados() {
  const agora = Date.now();
  for (const [chave, valor] of usoPorToken) {
    if (agora > valor.expiraEm) usoPorToken.delete(chave);
  }
}

/**
 * Confirma a sessão contra o backend.
 *
 * A rota era pública: qualquer um na internet mandava um PDF de até 32 MB e o
 * servidor parseava de graça. Verificar a assinatura aqui exigiria o segredo do
 * JWT no front, então a checagem é delegada a quem já a faz — /auth/me.
 */
async function sessaoValida(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  const token = auth.slice("Bearer ".length).trim();
  if (!token || isTokenExpired(token)) return false;

  try {
    const res = await fetch(`${BACKEND}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * O pdf-parse insere um marcador por página no texto extraído ("-- 1 of 3 --").
 * Isso ia direto para o corpo da nota do pastor.
 */
function limparMarcadoresDePagina(texto: string): string {
  return texto
    .replace(/^[ \t]*--\s*\d+\s+of\s+\d+\s*--[ \t]*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";

  if (!(await sessaoValida(req))) {
    return NextResponse.json(
      { error: "Sessão inválida ou expirada." },
      { status: 401 },
    );
  }

  limparExpirados();
  if (excedeuCota(auth)) {
    return NextResponse.json(
      { error: "Muitos PDFs enviados em sequência. Aguarde um minuto." },
      { status: 429 },
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
    return NextResponse.json({ error: "Nenhum PDF enviado." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "O arquivo enviado não é um PDF válido." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "PDF muito grande. O limite é de 32 MB." },
      { status: 413 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parser = new PDFParse({ data: arrayBuffer });
    const result = await parser.getText();
    await parser.destroy();

    const title = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
    const content = limparMarcadoresDePagina(result.text);

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Não há texto selecionável neste PDF. Se ele for digitalizado, será preciso OCR.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ title, content });
  } catch (err) {
    // Arquivo corrompido ou que não é PDF de verdade é erro de quem enviou,
    // não do servidor: antes devolvia 500 e parecia falha da aplicação.
    console.error("[transcribe-pdf]", err);
    return NextResponse.json(
      { error: "Não foi possível ler este PDF. Verifique se o arquivo está íntegro." },
      { status: 400 },
    );
  }
}
