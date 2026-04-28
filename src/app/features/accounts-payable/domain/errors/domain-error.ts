/**
 * domain-error.ts — TrimiCash
 * Classe base para erros de regra de negócio do domínio Accounts Payable.
 */

export class DomainError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
