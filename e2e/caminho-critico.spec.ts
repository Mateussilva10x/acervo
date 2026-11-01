import { expect, test, type Page } from "@playwright/test";

/**
 * Percorre o caminho que um pastor realmente faz: cadastrar, sair, entrar,
 * definir a senha do primeiro acesso, criar uma nota, editá-la e apagá-la.
 *
 * Cada execução usa e-mail e CPF novos, então a suíte não depende de estado
 * anterior nem toca em contas existentes.
 *
 * Os formulários usam labels sem `htmlFor`, então os campos são localizados
 * por placeholder. Associar os labels seria uma melhoria de acessibilidade à
 * parte.
 */

/** CPF válido pelos dígitos verificadores, a partir de 9 dígitos base. */
function cpfValido(base: number): string {
  const digitos = String(base).padStart(9, "0").slice(-9).split("").map(Number);

  const calcular = (parciais: number[], pesoInicial: number) => {
    const soma = parciais.reduce((acc, d, i) => acc + d * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcular(digitos, 10);
  const d2 = calcular([...digitos, d1], 11);
  return [...digitos, d1, d2].join("");
}

function contaNova() {
  const semente = Date.now() % 1_000_000_000;
  return {
    nome: "Pastor E2E",
    email: `e2e.${semente}@exemplo.test`,
    cpf: cpfValido(semente),
    senhaInicial: "SenhaInicial123",
    senhaFinal: "SenhaFinalE2E123",
  };
}

async function cadastrar(page: Page, conta: ReturnType<typeof contaNova>) {
  await page.goto("/register");
  await page.getByPlaceholder("Pastor Carlos Silva").fill(conta.nome);
  await page.getByPlaceholder("pastor@igreja.com").fill(conta.email);
  await page.locator('input[type="date"]').fill("1990-05-10");
  await page.getByPlaceholder("000.000.000-00").fill(conta.cpf);
  await page.getByPlaceholder("Mín. 8 caracteres").fill(conta.senhaInicial);
  await page.getByRole("button", { name: "Criar conta grátis" }).click();
}

async function entrar(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.getByPlaceholder("pastor@igreja.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("caminho crítico", () => {
  test("cadastro, login, criar, editar e apagar nota", async ({ page }) => {
    const conta = contaNova();

    await test.step("cadastro entra direto no app", async () => {
      await cadastrar(page, conta);
      await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 30_000 });
    });

    await test.step("sair e entrar com a senha escolhida no cadastro", async () => {
      await page.getByRole("button", { name: "Sair" }).click();
      await expect(page).toHaveURL(/\/(login)?$/, { timeout: 20_000 });

      // Quem se cadastra define a própria senha, então não passa pela tela de
      // primeiro acesso: ela é das contas criadas por admin, com senha
      // provisória. O caso de primeiro acesso tem teste próprio, abaixo.
      await entrar(page, conta.email, conta.senhaInicial);
      await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 20_000 });
    });

    await test.step("criar nota", async () => {
      await page.goto("/app/notes/new");
      await page.getByPlaceholder("Título da nota...").fill("Nota E2E");
      await page
        .getByPlaceholder(/escreva aqui sua ideia/i)
        .fill("Conteúdo original");
      await page.getByRole("button", { name: "Salvar Nota" }).click();

      await expect(page).toHaveURL(/\/app\/notes$/, { timeout: 20_000 });
      await expect(page.getByText("Nota E2E").first()).toBeVisible();
    });

    await test.step("editar nota persiste no backend", async () => {
      await page.getByText("Nota E2E").first().click();
      await page.getByRole("link", { name: /editar/i }).click();

      await page.getByPlaceholder("Título da nota...").fill("Nota E2E editada");
      await page
        .getByPlaceholder(/escreva aqui sua ideia/i)
        .fill("Conteúdo alterado");
      await page.getByRole("button", { name: /salvar alterações/i }).click();

      await expect(page.getByText("Nota E2E editada").first()).toBeVisible({
        timeout: 20_000,
      });

      // Recarrega direto do servidor: antes, a edição vivia só no store local
      // e era sobrescrita no próximo carregamento.
      await page.goto("/app/notes");
      await page.reload();
      await expect(page.getByText("Nota E2E editada").first()).toBeVisible({
        timeout: 20_000,
      });
    });

    await test.step("apagar nota remove do backend", async () => {
      await page.getByText("Nota E2E editada").first().click();
      await expect(page).toHaveURL(/\/app\/notes\/[0-9a-f-]+$/, { timeout: 20_000 });

      // O handler de exclusão desiste calado quando o token ainda não saiu da
      // hidratação (`if (!token) return`). Esperar o título da nota garante que
      // a tela terminou de carregar antes do clique — sem isso, o passo falhava
      // em cerca de uma execução a cada três.
      await expect(
        page.getByRole("heading", { name: "Nota E2E editada" }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByRole("button", { name: /excluir/i }).click();

      // O modal desmonta assim que a exclusão conclui e a página navega, e o
      // clique normal do Playwright reavalia o elemento no meio disso.
      const confirmar = page.getByRole("button", { name: /^deletar$/i });
      await confirmar.waitFor({ state: "visible" });

      // Amarrar o clique à resposta do DELETE evita seguir adiante antes de a
      // exclusão ter de fato acontecido.
      await Promise.all([
        page.waitForResponse(
          (r) => r.request().method() === "DELETE" && r.url().includes("/notes/"),
          { timeout: 20_000 },
        ),
        confirmar.dispatchEvent("click"),
      ]);

      await expect(page).toHaveURL(/\/app\/notes$/, { timeout: 20_000 });

      // Antes, o DELETE voltava 503 pelo proxy e a tela de detalhe nem chamava
      // a API: a nota reaparecia no recarregamento.
      await page.reload();
      await expect(page.getByText("Nota E2E editada")).toHaveCount(0);
    });
  });

  test("conta criada por admin passa pelo primeiro acesso", async ({ page, request }) => {
    // Só contas criadas por um administrador nascem com senha provisória. Sem
    // credenciais de admin no ambiente não há como montar o cenário, então o
    // teste se declara skipped em vez de falhar.
    const adminEmail = process.env.E2E_ADMIN_EMAIL;
    const adminSenha = process.env.E2E_ADMIN_PASSWORD;
    test.skip(
      !adminEmail || !adminSenha,
      "defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD para cobrir o primeiro acesso",
    );

    const login = await request.post("/api/proxy/api/v1/auth/login", {
      data: { email: adminEmail, password: adminSenha },
    });
    expect(login.ok()).toBeTruthy();
    const { token } = await login.json();

    const conta = contaNova();
    const criada = await request.post("/api/proxy/api/v1/users", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: conta.nome,
        email: conta.email,
        birthDate: "1990-05-10",
        password: conta.senhaInicial,
        cpf: conta.cpf,
      },
    });
    expect(criada.status()).toBe(201);

    await entrar(page, conta.email, conta.senhaInicial);
    await expect(page).toHaveURL(/\/change-password/, { timeout: 20_000 });

    await page.getByPlaceholder("Mínimo 8 caracteres").fill(conta.senhaFinal);
    await page.getByPlaceholder("Repita a senha").fill(conta.senhaFinal);
    await page.getByRole("button", { name: /definir senha/i }).click();

    // O backend responde 200 sem corpo aqui. Antes do ajuste no cliente, isso
    // virava "Não foi possível conectar ao servidor" apesar do sucesso. E
    // enquanto o cliente chamava a rota de ADMIN, tomava 403 e deixava todo
    // usuário preso nesta tela.
    await expect(page.getByText(/não foi possível conectar/i)).toHaveCount(0);
    await expect(page.getByText(/erro ao redefinir senha/i)).toHaveCount(0);
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 20_000 });

    // A senha nova é a que vale a partir de agora.
    await page.getByRole("button", { name: "Sair" }).click();
    await entrar(page, conta.email, conta.senhaFinal);
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 20_000 });
  });

  test("sessão expirada manda para o login com aviso", async ({ page, context }) => {
    const b64 = (o: unknown) =>
      Buffer.from(JSON.stringify(o)).toString("base64url");
    const expirado = [
      b64({ alg: "HS256", typ: "JWT" }),
      b64({
        iss: "auth-api",
        sub: "e2e@exemplo.test",
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
      "assinatura",
    ].join(".");

    await context.addCookies([
      { name: "acervo-token", value: expirado, url: "http://localhost:3000" },
    ]);

    await page.goto("/app/dashboard");

    await expect(page).toHaveURL(/\/login\?expirado=1/, { timeout: 20_000 });
    await expect(page.getByText(/sua sessão expirou/i)).toBeVisible();
  });

  test("/reset-password é acessível sem sessão", async ({ page }) => {
    await page.goto("/reset-password?token=token-de-teste");

    // Esta rota era bloqueada pelo middleware, matando a recuperação de senha.
    await expect(page).toHaveURL(/\/reset-password/);
    await expect(
      page.getByRole("button", { name: /salvar nova senha/i }),
    ).toBeVisible();
  });
});
