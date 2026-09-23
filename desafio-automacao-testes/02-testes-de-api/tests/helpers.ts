export const uniqueEmail = () =>
  `playwright_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@qa.com`;

export const uniqueProductName = (prefix: string) =>
  `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 8)}`;
