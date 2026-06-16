/**
 * bank-integration.repository.ts — TrimiCash
 * Porta de integração bancária (Open Finance).
 *
 * Fase 1: implementada por um adapter mock/local que simula o fluxo de
 * consentimento e devolve extratos fictícios.
 * Fase 2: implementada por um adapter HTTP que fala com o agregador
 * Open Finance, sem alterar esta porta nem a UI/facade.
 */

import type { Bank } from '../entities/bank.entity';
import type { BankConnection } from '../entities/bank-transaction.entity';

export interface BankIntegrationRepository {
  /** Catálogo de instituições disponíveis para conexão. */
  listAvailableBanks(): Promise<Bank[]>;

  /** Conexões (consentimentos) já autorizadas pelo usuário. */
  listConnections(): Promise<BankConnection[]>;

  /**
   * Autoriza o compartilhamento de dados de uma instituição e
   * devolve a conexão recém-criada com o extrato sincronizado.
   * Rejeita se o banco não existir ou já estiver conectado.
   */
  connect(bankId: string): Promise<BankConnection>;

  /** Revoga o consentimento e remove a conexão. */
  disconnect(connectionId: string): Promise<void>;

  /** Re-sincroniza o extrato de uma conexão existente. */
  sync(connectionId: string): Promise<BankConnection>;
}
