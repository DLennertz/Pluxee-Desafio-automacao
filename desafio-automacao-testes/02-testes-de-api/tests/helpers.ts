export const uniqueEmail = () =>
  `playwright_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@qa.com`;
