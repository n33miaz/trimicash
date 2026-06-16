/**
 * bank.entity.ts — TrimiCash
 * Entidades da integração Open Finance (demo simulada da Fase 1).
 * TypeScript puro — sem imports Angular.
 *
 * NOTA DE FASE: nenhuma destas entidades fala com banco real. Toda a
 * informação é gerada por mock para demonstrar como o produto exibiria
 * dados de extrato vindos do Open Finance na Fase 2.
 */

/** Segmento da instituição participante do Open Finance. */
export type BankSegment =
  | 'banco'        // banco tradicional / varejo
  | 'publico'      // banco público
  | 'fintech'      // banco digital / fintech
  | 'cooperativa'  // cooperativa de crédito
  | 'pagamentos'   // instituição de pagamento
  | 'investimento';// banco de investimento

/**
 * Bank — instituição financeira disponível para conexão via Open Finance.
 * É um item de catálogo, não uma conta conectada.
 */
export interface Bank {
  /** Identificador estável (slug). Ex: 'bb', 'itau'. */
  id: string;
  /** Nome de exibição completo. */
  name: string;
  /** Apelido curto para espaços reduzidos. */
  shortName: string;
  /** Caminho do logo servido em /assets/banks. */
  logo: string;
  /** Cor de marca usada em detalhes da UI. */
  brandColor: string;
  /** Segmento para diversidade visual do catálogo. */
  segment: BankSegment;
}

/** Modalidade da conta retornada pela instituição. */
export type BankAccountKind = 'CORRENTE' | 'POUPANCA' | 'PAGAMENTOS' | 'INVESTIMENTO';

/** Dados da conta compartilhada pela instituição (mascarados na UI). */
export interface BankAccount {
  /** Agência. Ex: '0001'. */
  agency: string;
  /** Número da conta com dígito. Ex: '45231-7'. */
  number: string;
  /** Modalidade da conta. */
  kind: BankAccountKind;
  /** Saldo atual em reais. */
  balance: number;
}
