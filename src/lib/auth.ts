export interface User {
  name: string;
  email: string;
  church: string;
  plan: "gratuito" | "pro" | "igreja";
}

export interface AuthResponse {
  token: string;
  user: User;
}

const DEMO_USER: User = {
  name: "Pastor Demo",
  email: "igreja@demo.com",
  church: "Igreja Demo",
  plan: "igreja",
};

export async function mockLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 600));

  if (email === "igreja@demo.com" && password === "demo123456") {
    return {
      token: "fake-jwt-acervo-demo-token",
      user: DEMO_USER,
    };
  }

  throw new Error("Email ou senha incorretos.");
}

export async function mockRegister(
  name: string,
  email: string,
  _password: string
): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    token: "fake-jwt-new-user-token",
    user: { name, email, church: "", plan: "gratuito" },
  };
}
