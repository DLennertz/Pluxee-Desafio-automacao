import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@qa.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "teste";
const NON_ADMIN_EMAIL = process.env.NON_ADMIN_EMAIL ?? "user@qa.com";
const NON_ADMIN_PASSWORD = process.env.NON_ADMIN_PASSWORD ?? "teste";

async function ensureUser(
  request: any,
  email: string,
  password: string,
  admin: boolean,
) {
  const response = await request.post("/usuarios", {
    data: {
      nome: admin ? "Admin Produto" : "User Produto",
      email,
      password,
      administrador: String(admin),
    },
  });

  if (response.status() !== 201 && response.status() !== 400) {
    throw new Error(
      `Não foi possível preparar o usuário ${email}: ${response.status()}`,
    );
  }
}

async function login(request: any, email: string, password: string) {
  const response = await request.post("/login", {
    data: { email, password },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("authorization");
  return body.authorization;
}

test.describe("Produtos API", () => {
  test("GET /produtos retorna 200 e lista de produtos", async ({ request }) => {
    const response = await request.get("/produtos");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("produtos");
    expect(Array.isArray(body.produtos)).toBeTruthy();
  });

  test("GET /produtos aceita filtros por query params", async ({ request }) => {
    const response = await request.get("/produtos?nome=Logitech MX Vertical");

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("produtos");
    expect(Array.isArray(body.produtos)).toBeTruthy();
  });

  test("POST /produtos cadastra produto com admin válido", async ({
    request,
  }) => {
    await ensureUser(request, ADMIN_EMAIL, ADMIN_PASSWORD, true);
    await ensureUser(request, NON_ADMIN_EMAIL, NON_ADMIN_PASSWORD, false);

    const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const payload = {
      nome: `Produto Playwright ${Date.now()}`,
      preco: 470,
      descricao: "Mouse",
      quantidade: 381,
    };

    const response = await request.post("/produtos", {
      headers: {
        Authorization: adminToken,
      },
      data: payload,
    });

    expect(response.status()).toBe(201);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("message", "Cadastro realizado com sucesso");
    expect(body).toHaveProperty("_id");
  });

  test("POST /produtos rejeita produto duplicado", async ({ request }) => {
    await ensureUser(request, ADMIN_EMAIL, ADMIN_PASSWORD, true);
    const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const payload = {
      nome: `Produto duplicado ${Date.now()}`,
      preco: 470,
      descricao: "Mouse",
      quantidade: 381,
    };

    await request.post("/produtos", {
      headers: { Authorization: adminToken },
      data: payload,
    });

    const response = await request.post("/produtos", {
      headers: { Authorization: adminToken },
      data: payload,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("message", "Já existe produto com esse nome");
  });

  test("POST /produtos exige token de autenticação", async ({ request }) => {
    const response = await request.post("/produtos", {
      data: {
        nome: "Produto sem token",
        preco: 100,
        descricao: "Teste",
        quantidade: 1,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty(
      "message",
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
    );
  });

  test("POST /produtos rejeita usuário não administrador", async ({
    request,
  }) => {
    await ensureUser(request, NON_ADMIN_EMAIL, NON_ADMIN_PASSWORD, false);
    const nonAdminToken = await login(
      request,
      NON_ADMIN_EMAIL,
      NON_ADMIN_PASSWORD,
    );

    const response = await request.post("/produtos", {
      headers: { Authorization: nonAdminToken },
      data: {
        nome: `Produto user não admin ${Date.now()}`,
        preco: 150,
        descricao: "Teste",
        quantidade: 10,
      },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toHaveProperty(
      "message",
      "Rota exclusiva para administradores",
    );
  });

  test("GET /produtos/:id retorna produto existente", async ({ request }) => {
    const productsResponse = await request.get("/produtos");
    const productsBody = await productsResponse.json();
    const productId = productsBody.produtos[0]._id;

    const response = await request.get(`/produtos/${productId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("_id", productId);
    expect(body).toHaveProperty("nome");
    expect(body).toHaveProperty("preco");
    expect(body).toHaveProperty("descricao");
    expect(body).toHaveProperty("quantidade");
  });

  test("GET /produtos/:id retorna 400 quando o id for inválido", async ({
    request,
  }) => {
    const response = await request.get("/produtos/ID_INEXISTENTE_123");

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.id).toContain("16 caracteres");
  });

  test("PUT /produtos/:id atualiza produto com admin válido", async ({
    request,
  }) => {
    const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const productId = "BeeJh5lz3k6kSIzA";

    const payload = {
      nome: "Logitech MX Vertical",
      preco: 470,
      descricao: "Mouse",
      quantidade: 381,
    };

    const response = await request.put(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("message", "Registro alterado com sucesso");
  });

  test("E2E: admin cria produto, usuário comum consulta, admin atualiza e exclui", async ({
    request,
  }) => {
    await ensureUser(request, ADMIN_EMAIL, ADMIN_PASSWORD, true);
    await ensureUser(request, NON_ADMIN_EMAIL, NON_ADMIN_PASSWORD, false);

    const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const nonAdminToken = await login(
      request,
      NON_ADMIN_EMAIL,
      NON_ADMIN_PASSWORD,
    );

    const productName = `Produto E2E ${Date.now()}`;
    const createPayload = {
      nome: productName,
      preco: 470,
      descricao: "Mouse",
      quantidade: 381,
    };

    const createResponse = await request.post("/produtos", {
      headers: { Authorization: adminToken },
      data: createPayload,
    });

    expect(createResponse.status()).toBe(201);
    const createdBody = await createResponse.json();
    const productId = createdBody._id;

    const readAsUserResponse = await request.get(`/produtos/${productId}`, {
      headers: { Authorization: nonAdminToken },
    });

    expect(readAsUserResponse.status()).toBe(200);
    const readAsUserBody = await readAsUserResponse.json();
    expect(readAsUserBody).toHaveProperty("_id", productId);
    expect(readAsUserBody).toHaveProperty("nome", productName);

    const updatePayload = {
      nome: `${productName} Atualizado`,
      preco: 470,
      descricao: "Mouse",
      quantidade: 381,
    };

    const updateResponse = await request.put(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
      data: updatePayload,
    });

    expect(updateResponse.status()).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody).toHaveProperty(
      "message",
      "Registro alterado com sucesso",
    );

    const updatedProductResponse = await request.get(`/produtos/${productId}`);
    const updatedProductBody = await updatedProductResponse.json();
    expect(updatedProductBody).toHaveProperty(
      "nome",
      `${productName} Atualizado`,
    );

    const deleteResponse = await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });

    expect(deleteResponse.status()).toBe(200);
    const deleteBody = await deleteResponse.json();
    expect(deleteBody).toHaveProperty("message");
  });

  test("DELETE /produtos/:id remove produto com admin", async ({ request }) => {
    await ensureUser(request, ADMIN_EMAIL, ADMIN_PASSWORD, true);
    const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const createResponse = await request.post("/produtos", {
      headers: { Authorization: adminToken },
      data: {
        nome: `Produto DELETE ${Date.now()}`,
        preco: 470,
        descricao: "Mouse",
        quantidade: 381,
      },
    });
    const createdBody = await createResponse.json();
    const productId = createdBody._id;

    const response = await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("message");
  });

  test("DELETE /produtos/:id rejeita produto que faz parte de carrinho", async ({
    request,
  }) => {
    const cartResponse = await request.get("/carrinhos");
    const cartBody = await cartResponse.json();
    const cart = (cartBody.carrinhos ?? []).find(
      (c: any) => Array.isArray(c.produtos) && c.produtos.length > 0,
    );

    expect(cart).toBeTruthy();
    const productId =
      cart.produtos[0].idProduto ?? cart.produtos[0]._id ?? cart.produtos[0];

    const adminToken = await login(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const response = await request.delete(`/produtos/${productId}`, {
      headers: { Authorization: adminToken },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty(
      "message",
      "Não é permitido excluir produto que faz parte de carrinho",
    );
    expect(body).toHaveProperty("idCarrinhos");
  });
});
