import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const translation = searchParams.get("tr") || "almeida";
  const bookName = searchParams.get("book") || "genesis";
  const chapter = searchParams.get("chapter") || "1";

  const passage = encodeURIComponent(`${bookName} ${chapter}`);
  const url = `https://bible-api.com/${passage}?translation=${translation}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return Response.json({ error: `Erro ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error }, { status: 404 });
    }
    return Response.json(data);
  } catch {
    return Response.json({ error: "Falha ao carregar capítulo" }, { status: 500 });
  }
}
