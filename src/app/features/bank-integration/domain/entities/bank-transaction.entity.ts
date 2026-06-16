/**
 * bank-transaction.entity.ts — TrimiCash
 * Lançamento de extrato trazido (simuladamente) via Open Finance.
 * TypeScript puro — sem imports Angular.
 */

/** Natureza do lançamento no extrato. */
export type BankTransactionType = 'CREDITO' | 'DEBITO';

/** Canal/instrumento do lançamento, usado para rótulo e ícone na UI. */
export type BankTransactionChannel =
  | 'PIX'
  | 'TED'
  | 'BOLETO'
  | 'CARTAO'
  | 'TARIFA'
  | 'SALARIO'
  | 'RENDIMENTO'
  | 'SAQUE';

/**
 * BankTransaction — um lançamento individual do extrato de uma conta conectada.
 * Datas são fatos passados (≤ hoje), espelhando um extrato real.
 */
export interface BankTransaction {
  /** UUID v4. */
  id: string;
  /** Banco de origem (referência ao Bank.id). */
  bankId: string;
  /** Data do lançamento. */
  date: Date;
  /** Descrição livre exibida no extrato. */
  description: string;
  /** Crédito (entrada) ou débito (saída). */
  type: BankTransactionType;
  /** Valor absoluto em reais, sempre > 0. */
  amount: number;
  /** Canal/instrumento do lançamento. */
  channel: BankTransactionChannel;
}

/**
 * BankConnection — vínculo ativo entre o usuário e uma instituição.
 * Na Fase 1 representa um consentimento Open Finance simulado já autorizado.
 */
export interface BankConnection {
  /** UUID v4 do consentimento/conexão. */
  id: string;
  /** Instituição conectada (referência ao Bank.id). */
  bankId: string;
  /** Conta compartilhada pela instituição. */
  account: import('./bank.entity').BankAccount;
  /** Momento em que o consentimento foi autorizado. */
  connectedAt: Date;
  /** Última sincronização de extrato. */
  lastSyncAt: Date;
  /** Extrato sincronizado (ordenado do mais recente ao mais antigo). */
  transactions: BankTransaction[];
}
