import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers";

const buildUserPayload = (overrides = {}) => ({
  nome: "Usuário Playwright",
  email: uniqueEmail(),
  password: "123456",
  administrador: "true",
  ...overrides,
});

test.describe("Usuarios API", () => {
  test("POST /usuarios cadastra usuário válido com sucesso", async ({
    request,
  }) => {
    const payload = buildUserPayload();

    const response = await request.post("/usuarios", { data: payload });

    expect(response.status()).toBe(201);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("message", "Cadastro realizado com sucesso");
    expect(body).toHaveProperty("_id");
  });

  test("POST /usuarios rejeita payload inválido", async ({ request }) => {
    const response = await request.post("/usuarios", {
      data: {
        nome: "",
        email: "email-invalido",
        password: "123",
        administrador: "false",
      },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("email");
    expect(body).toHaveProperty("nome");
    expect(body.email).toContain("email");
    expect(body.nome).toContain("nome");
  });

  test("PUT /usuarios/:id atualiza usuário com sucesso", async ({
    request,
  }) => {
    const createdUser = buildUserPayload({
      nome: "Usuário Original",
    });

    const createResponse = await request.post("/usuarios", {
      data: createdUser,
    });
    const createBody = await createResponse.json();
    const userId = createBody._id;

    const updatedUser = buildUserPayload({
      nome: "Usuário Atualizado",
      password: "654321",
      administrador: "false",
    });

    const response = await request.put(`/usuarios/${userId}`, {
      data: updatedUser,
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("message", "Registro alterado com sucesso");
  });

  test("DELETE /usuarios/:id remove usuário com sucesso", async ({
    request,
  }) => {
    const newUser = buildUserPayload({
      nome: "Usuário para Remoção",
    });

    const createResponse = await request.post("/usuarios", { data: newUser });
    const createBody = await createResponse.json();
    const userId = createBody._id;

    const response = await request.delete(`/usuarios/${userId}`);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("message", "Registro excluído com sucesso");
  });
});
