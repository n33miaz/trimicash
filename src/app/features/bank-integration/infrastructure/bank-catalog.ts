/**
 * bank-catalog.ts — TrimiCash
 * Catálogo estático de instituições disponíveis para conexão na demo de
 * Open Finance. Os logos oficiais ficam em /assets/banks (exibidos com
 * cantos arredondados pela UI). Uso meramente demonstrativo/identificação.
 *
 * TypeScript puro — sem dependências Angular.
 */

import type { Bank } from '../domain/entities/bank.entity';

export const BANK_CATALOG: Bank[] = [
  {
    id: 'bb',
    name: 'Banco do Brasil',
    shortName: 'BB',
    logo: 'assets/banks/bb.jpeg',
    brandColor: '#FAE128',
    segment: 'banco',
  },
  {
    id: 'itau',
    name: 'Itaú',
    shortName: 'Itaú',
    logo: 'assets/banks/itau.jpeg',
    brandColor: '#EC7000',
    segment: 'banco',
  },
  {
    id: 'bradesco',
    name: 'Bradesco',
    shortName: 'Bradesco',
    logo: 'assets/banks/bradesco.png',
    brandColor: '#CC092F',
    segment: 'banco',
  },
  {
    id: 'santander',
    name: 'Santander',
    shortName: 'Santander',
    logo: 'assets/banks/santander.jpeg',
    brandColor: '#EC0000',
    segment: 'banco',
  },
  {
    id: 'caixa',
    name: 'Caixa Econômica',
    shortName: 'Caixa',
    logo: 'assets/banks/caixa.jpeg',
    brandColor: '#005CA9',
    segment: 'publico',
  },
  {
    id: 'nubank',
    name: 'Nubank',
    shortName: 'Nubank',
    logo: 'assets/banks/nubank.png',
    brandColor: '#820AD1',
    segment: 'fintech',
  },
  {
    id: 'inter',
    name: 'Banco Inter',
    shortName: 'Inter',
    logo: 'assets/banks/inter.jpeg',
    brandColor: '#FF7A00',
    segment: 'fintech',
  },
  {
    id: 'c6',
    name: 'C6 Bank',
    shortName: 'C6',
    logo: 'assets/banks/c6.png',
    brandColor: '#242424',
    segment: 'fintech',
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    shortName: 'BTG',
    logo: 'assets/banks/btg.png',
    brandColor: '#06213F',
    segment: 'investimento',
  },
  {
    id: 'sicoob',
    name: 'Sicoob',
    shortName: 'Sicoob',
    logo: 'assets/banks/sicoob.jpeg',
    brandColor: '#003641',
    segment: 'cooperativa',
  },
  {
    id: 'sicredi',
    name: 'Sicredi',
    shortName: 'Sicredi',
    logo: 'assets/banks/sicredi.jpeg',
    brandColor: '#3AAA35',
    segment: 'cooperativa',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    shortName: 'Mercado Pago',
    logo: 'assets/banks/mercadopago.jpeg',
    brandColor: '#00AEEF',
    segment: 'pagamentos',
  },
];

/** Busca rápida por id. */
export function findBank(id: string): Bank | undefined {
  return BANK_CATALOG.find((bank) => bank.id === id);
}
