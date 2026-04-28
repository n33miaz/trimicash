/**
 * money.util.ts — TrimiCash
 * Utilitários de cálculo e formatação monetária em BRL.
 * TypeScript puro, sem dependências Angular.
 */

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata um número como moeda BRL.
 * Ex: 1234.5 → "R$ 1.234,50"
 */
export function formatBRL(value: number): string {
  return BRL_FORMATTER.format(value);
}

/**
 * Arredonda valor para 2 casas decimais, evitando floating-point issues.
 * Ex: 0.1 + 0.2 → 0.30 (e não 0.30000000000000004)
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Soma um array de valores com arredondamento seguro.
 */
export function sum(values: number[]): number {
  return roundCurrency(values.reduce((acc, v) => acc + v, 0));
}
