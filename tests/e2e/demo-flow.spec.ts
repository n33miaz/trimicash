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

  await page.goto('/?seed=healthy');

  await expect(page.getByRole('button', { name: /Entrar na Demo/i })).toBeVisible();
  await page.getByRole('button', { name: /Entrar na Demo/i }).click();

  await expect(page.getByText('Reserva recomendada')).toBeVisible();
  const reserveBefore = await readStatValue(page, 'Reserva recomendada');
  const balanceBefore = await readStatValue(page, 'Saldo atual');

  await page.getByRole('link', { name: /Contas/i }).click();
  await expect(page.getByRole('heading', { name: /Contas a Pagar/i })).toBeVisible();
  await page.getByRole('button', { name: /\+ Nova conta/i }).first().click();

  await page.getByLabel('Descrição').fill(payableDescription);
  await page.getByLabel('Valor').fill('50000');
  await page.getByLabel('Vencimento').fill(formatDateInput(tomorrow));
  await page.getByLabel('Categoria').selectOption({ label: 'Outros' });
  await page.getByLabel('Recorrência').selectOption('NONE');
  await page.getByRole('button', { name: /^Salvar$/i }).click();

  await expect(page.getByText('Conta criada.')).toBeVisible();

  await page.getByRole('link', { name: /Dashboard/i }).click();
  await expect(page.getByText('Reserva recomendada')).toBeVisible();
  const reserveAfterCreate = await readStatValue(page, 'Reserva recomendada');
  expect(reserveAfterCreate).toBeGreaterThan(reserveBefore);

  await page.getByRole('link', { name: /Contas/i }).click();
  const payableItem = page.locator('tr:visible, .payable-card:visible').filter({ hasText: payableDescription }).first();
  await expect(payableItem).toBeVisible();
  await payableItem.getByRole('button', { name: /^Pagar$/i }).click();
  await page.getByRole('button', { name: /Confirmar pagamento/i }).click();

  await expect(page.getByText('Conta paga. Saldo atualizado.')).toBeVisible();

  await page.getByRole('link', { name: /Dashboard/i }).click();
  const reserveAfterPay = await readStatValue(page, 'Reserva recomendada');
  const balanceAfterPay = await readStatValue(page, 'Saldo atual');
  expect(reserveAfterPay).toBeLessThan(reserveAfterCreate);
  expect(balanceAfterPay).toBe(balanceBefore - 500);

  await page.getByRole('link', { name: /^Caixa$/i }).click();
  await expect(page.getByText(`Pagamento: ${payableDescription}`)).toBeVisible();

  await page.getByRole('link', { name: /Alertas/i }).click();
  await expect(page.getByRole('heading', { name: /Alertas e Avisos/i })).toBeVisible();
  await expect(page.locator('.alerts-page').getByText(payableDescription)).not.toBeVisible();
});
