import { NextResponse } from "next/server";

export async function GET() {
  const translations = [
    { short_name: "ACF11", full_name: "Almeida Corrigida Fiel (2011)" },
    { short_name: "ARA",   full_name: "Almeida Revista e Atualizada (1993)" },
    { short_name: "ARC09", full_name: "Almeida Revista e Corrigida (2009)" },
    { short_name: "NAA",   full_name: "Nova Almeida Atualizada (2017)" },
    { short_name: "NVT",   full_name: "Nova Versão Transformadora (2016)" },
    { short_name: "NTLH",  full_name: "Nova Tradução na Linguagem de Hoje (2000)" },
    { short_name: "TB10",  full_name: "Tradução Brasileira (2010)" },
    { short_name: "KJA",   full_name: "King James Atualizada (2001)" },
  ];

  return NextResponse.json(translations);
}
