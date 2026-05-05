import { expect, test } from '@playwright/test';

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseBRL(value: string): number {
  return Number(
    value
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
}

async function readStatValue(page: import('@playwright/test').Page, label: string): Promise<number> {
  const card = page.locator('tc-stat-card', { hasText: label }).first();
  await expect(card).toBeVisible();
  return parseBRL(await card.locator('.value').innerText());
}

test('fluxo principal da demo: criar e pagar conta atualiza reserva, saldo e caixa', async ({ page }) => {
  const payableDescription = `Conta E2E ${Date.now()}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await page.addInitScript(() => {
    localStorage.setItem('trimicash:userName', 'Teste Demo');
    localStorage.setItem('trimicash:demoCredentials', JSON.stringify({
      name: 'Teste Demo',
      email: 'teste.demo@gmail.com',
      password: 'teste-demo',
    }));
  });

  await page.goto('/?seed=healthy');

  const emailInput = page.getByLabel('E-mail');
  const passwordInput = page.getByLabel('Senha');
  if ((await emailInput.inputValue()) === '') {
    await emailInput.fill('teste.demo@gmail.com');
  }
  if ((await passwordInput.inputValue()) === '') {
    await passwordInput.fill('teste-demo');
  }

  const loginButton = page.getByRole('button', { name: /^Entrar$/i });
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  await expect(page.getByText('Reserva recomendada')).toBeVisible();
  const reserveBefore = await readStatValue(page, 'Reserva recomendada');
  const balanceBefore = await readStatValue(page, 'Saldo atual');

  await page.goto('/accounts-payable');
  await expect(page.getByRole('heading', { name: /Contas a Pagar/i })).toBeVisible();
  await page.getByRole('button', { name: /\+ Nova Conta/i }).first().click();

  const accountDialog = page.getByRole('dialog', { name: /Nova Conta/i });
  await accountDialog.getByLabel(/Descri/i).fill(payableDescription);
  await accountDialog.getByLabel(/Valor/i).fill('50000');
  await accountDialog.getByLabel(/Vencimento/i).fill(formatDateInput(tomorrow));
  const categoryTrigger = accountDialog.getByRole('combobox', { name: /Categoria/i });
  await categoryTrigger.focus();
  await categoryTrigger.press('End');
  await categoryTrigger.press('Enter');
  await accountDialog.getByRole('button', { name: /^Salvar$/i }).click();

  await expect(page.getByText('Conta criada.')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText('Reserva recomendada')).toBeVisible();
  const reserveAfterCreate = await readStatValue(page, 'Reserva recomendada');
  expect(reserveAfterCreate).toBeGreaterThan(reserveBefore);

  await page.goto('/accounts-payable');
  const payableItem = page.locator('tr:visible, .payable-card:visible').filter({ hasText: payableDescription }).first();
  await expect(payableItem).toBeVisible();
  await payableItem.getByRole('button', { name: /^Pagar$/i }).click();
  await page.getByRole('button', { name: /Confirmar pagamento/i }).click();

  await expect(page.getByText('Conta paga. Saldo atualizado.')).toBeVisible();

  await page.goto('/');
  const reserveAfterPay = await readStatValue(page, 'Reserva recomendada');
  const balanceAfterPay = await readStatValue(page, 'Saldo atual');
  expect(reserveAfterPay).toBeLessThan(reserveAfterCreate);
  expect(balanceAfterPay).toBe(balanceBefore - 500);

  await page.goto('/cash-flow');
  await expect(page.locator('tr:visible, .movement-card:visible').filter({ hasText: `Pagamento: ${payableDescription}` }).first()).toBeVisible();

  await page.goto('/alerts');
  await expect(page.getByRole('heading', { name: /Alertas e Avisos/i })).toBeVisible();
  await expect(page.locator('.alerts-page').getByText(payableDescription)).not.toBeVisible();
});
