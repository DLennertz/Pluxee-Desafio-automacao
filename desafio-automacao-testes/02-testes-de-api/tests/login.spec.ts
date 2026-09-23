import { test, expect } from "@playwright/test";

const validLoginPayload = {
  email: "fulano1@qa.com",
  password: "teste",
};

async function ensureUserExists(request: any) {
  const response = await request.post("/usuarios", {
    data: {
      nome: "Fulano da Silva",
      email: validLoginPayload.email,
      password: validLoginPayload.password,
      administrador: "true",
    },
  });

  if (response.status() !== 201 && response.status() !== 400) {
    throw new Error(
      `Falha ao preparar o usuário para login: ${response.status()}`,
    );
  }
}

test.describe("Login API", () => {
  test("Scenario: Realizar login com credenciais válidas", async ({
    request,
  }) => {
    await ensureUserExists(request);

    const response = await request.post("/login", { data: validLoginPayload });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["strict-transport-security"]).toContain(
      "max-age=15552000",
    );

    const body = await response.json();
    expect(body).toHaveProperty("message", "Login realizado com sucesso");
    expect(body).toHaveProperty("authorization");
    expect(body.authorization).toMatch(/^Bearer\s.+/);
    expect(body).not.toHaveProperty("password");
    expect(body).not.toHaveProperty("email");
  });

  test("Scenario: Realizar login utilizando email com letras maiúsculas", async ({
    request,
  }) => {
    await ensureUserExists(request);

    const response = await request.post("/login", {
      data: {
        email: "FULANO1@QA.COM",
        password: "teste",
      },
    });

    expect(response.status()).toBe(401);
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("message", "Email e/ou senha inválidos");
  });

  test("Scenario: Realizar login com espaços laterais no email", async ({
    request,
  }) => {
    await ensureUserExists(request);

    const response = await request.post("/login", {
      data: {
        email: " fulano1@qa.com ",
        password: "teste",
      },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
    const body = await response.json();
    expect(body).toHaveProperty("email");
  });

  test("Scenario: Tentar realizar login com email não cadastrado", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "naoexiste@qa.com",
        password: "teste",
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("message", "Email e/ou senha inválidos");
  });

  test("Scenario: Tentar realizar login com senha incorreta", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "fulano1@qa.com",
        password: "senhaIncorreta",
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("message", "Email e/ou senha inválidos");
  });

  test("Scenario: Tentar realizar login sem informar o email", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "",
        password: "teste",
      },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("email", "email não pode ficar em branco");
  });

  test("Scenario: Tentar realizar login sem informar a senha", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "fulano1@qa.com",
        password: "",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty(
      "password",
      "password não pode ficar em branco",
    );
  });

  test("Scenario: Tentar realizar login com email nulo", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: null,
        password: "teste",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("email");
    expect(body.email).toMatch(/email/i);
  });

  test("Scenario: Tentar realizar login com senha nula", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "fulano1@qa.com",
        password: null,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("password");
    expect(body.password).toMatch(/password/i);
  });

  test("Scenario: Tentar realizar login sem informar os campos obrigatórios", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {},
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("password");
  });

  test("Scenario: Tentar realizar login sem enviar body", async ({
    request,
  }) => {
    const response = await request.post("/login");

    expect(response.status()).toBe(400);
  });

  test("Scenario: Tentar realizar login com JSON inválido", async ({
    request,
  }) => {
    const response = await request.fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: '{"email":"fulano1@qa.com","password":}',
    });

    expect(response.status()).toBe(400);
  });

  test("Scenario: Tentar realizar login com email em formato inválido", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "fulano1qa.com",
        password: "teste",
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("email");
  });

  test("Scenario: Tentar realizar login utilizando Content-Type incompatível", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      headers: {
        "Content-Type": "text/plain",
      },
      data: '{"email":"fulano1@qa.com","password":"teste"}',
    });

    expect(response.status()).toBe(400);
  });

  test("Scenario: Tentar realizar login utilizando método HTTP não suportado", async ({
    request,
  }) => {
    const response = await request.get("/login");

    expect(response.status()).toBe(405);
  });

  test("Scenario: Tentar realizar login utilizando payload de SQL Injection no email", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: "' OR '1'='1",
        password: "teste",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("Scenario: Tentar realizar login enviando payload excessivamente grande", async ({
    request,
  }) => {
    const response = await request.post("/login", {
      data: {
        email: `${"a".repeat(5000)}@qa.com`,
        password: "b".repeat(5000),
      },
    });

    expect(response.status()).toBe(400);
  });
});
