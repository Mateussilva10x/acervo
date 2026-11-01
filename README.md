# Acervo — Segundo Cérebro do Pregador (front-end)

Interface web do Acervo: organização de sermões, temas, referências bíblicas e
leitura da Bíblia, para pastores e pregadores.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Zustand

---

## ⚠️ Este front não funciona sozinho

Toda a informação vem da API [`segundoCerebroApi`](https://github.com/tiagosilva91/segundoCerebroApi).
Sem ela de pé, o login falha e as telas ficam vazias.

Suba o backend primeiro:

```bash
cd ../segundoCerebroApi
docker compose up -d --build       # API em http://localhost:8080
```

As chamadas do browser vão para `/api/proxy/*`, uma rota do próprio Next.js que
repassa server-to-server para a API — é o que evita CORS. O destino é definido
por `API_URL`.

## Como rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

### Scripts

| Comando | O que faz |
| :-- | :-- |
| `npm run dev` | Desenvolvimento, apontando para a API local (`localhost:8080`) |
| `npm run dev:prod` | Desenvolvimento, apontando para a API publicada na Railway |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes end-to-end (Playwright) — veja os requisitos abaixo |

### Variáveis de ambiente

| Variável | Padrão | Para que serve |
| :-- | :-- | :-- |
| `API_URL` | `http://localhost:8080` | Backend para onde `/api/proxy/*` repassa. Lida apenas no servidor. |
| `NEXT_PUBLIC_APP_ENV` | — | Identifica o ambiente no cliente. `dev:prod` define como `production`. |
| `PLAYWRIGHT_CHROMIUM_PATH` | — | Chromium já instalado, para o E2E não baixar o próprio. |

Para apontar o front local para outro backend:

```bash
API_URL=https://sua-api.exemplo.com npm run dev
```

## Testes

### Unitários

```bash
npm test             # uma vez
npm run test:watch   # em watch
```

Cobrem o cliente HTTP (`src/lib/api.ts`), o tratamento de JWT (`src/lib/jwt.ts`)
e as regras de rota do proxy (`src/proxy.ts`).

### End-to-end

Os navegadores do Playwright **não** vêm no `npm install`. Antes da primeira
execução:

```bash
npx playwright install chromium
```

O E2E roda contra a aplicação de verdade, então o backend **e** o front precisam
estar no ar:

```bash
cd ../segundoCerebroApi && docker compose up -d   # terminal 1
npm run dev                                       # terminal 2
npm run test:e2e                                  # terminal 3
```

Se o ambiente já tiver um Chromium (CI, container), aponte para ele em vez de
baixar outro:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/caminho/para/chromium npm run test:e2e
```

A suíte percorre o caminho crítico: cadastro, primeiro acesso, criar, editar e
apagar nota, além da sessão expirada e do acesso a `/reset-password` sem sessão.

## Estrutura

```
src/
  app/
    (app)/app/        telas autenticadas: dashboard, notas, temas, bíblia,
                      leitor, busca, configurações
    api/
      proxy/[...path] repasse server-to-server para a API (resolve CORS)
      ai/transcribe-pdf  extração de texto de PDF (exige sessão)
    login/ register/ reset-password/ change-password/
  components/         layout (shell, sidebar, auth guard) e UI
  lib/                cliente da API, JWT, catálogo de livros bíblicos
  store/              estado global (Zustand, persistido em localStorage)
  proxy.ts            proteção de rotas (substitui o antigo middleware.ts)
e2e/                  testes Playwright
```

## Autenticação

O login guarda o JWT no store e espelha num cookie `acervo-token`, com validade
igual à do token. `src/proxy.ts` roda antes da renderização e manda para `/` quem
não tem cookie, e para `/login?expirado=1` quem tem um token já vencido — a
assinatura continua sendo verificada pelo backend a cada requisição.

Rotas públicas: `/`, `/login`, `/register` e `/reset-password`.
