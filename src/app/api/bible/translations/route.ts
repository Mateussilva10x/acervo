// Valid translations from bible-api.com (https://bible-api.com/)
// Portuguese: only "almeida" (João Ferreira de Almeida)
export async function GET() {
  return Response.json([
    { short_name: "almeida", full_name: "João Ferreira de Almeida (PT)" },
    { short_name: "web",     full_name: "World English Bible" },
    { short_name: "kjv",     full_name: "King James Version" },
    { short_name: "bbe",     full_name: "Bible in Basic English" },
    { short_name: "asv",     full_name: "American Standard Version" },
    { short_name: "darby",   full_name: "Darby Bible Translation" },
    { short_name: "dra",     full_name: "Douay-Rheims 1899" },
    { short_name: "ylt",     full_name: "Young's Literal Translation" },
  ]);
}
