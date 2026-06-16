import { Injectable, computed, inject, signal } from '@angular/core';
import { BANK_INTEGRATION_REPOSITORY } from '../../../core/tokens/injection-tokens';
import type { Bank } from '../domain/entities/bank.entity';
import type {
  BankConnection,
  BankTransaction,
} from '../domain/entities/bank-transaction.entity';
import { sum } from '@core/utils/money.util';
import { BankCashflowSyncService } from './bank-cashflow-sync.service';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** Lançamento do extrato consolidado, já enriquecido com o banco de origem. */
export interface ConsolidatedTransaction extends BankTransaction {
  bank: Bank | undefined;
}

@Injectable({ providedIn: 'root' })
export class BankIntegrationFacade {
  private readonly repository = inject(BANK_INTEGRATION_REPOSITORY);
  private readonly cashSync = inject(BankCashflowSyncService);

  // ── State ──
  private readonly _banks = signal<Bank[]>([]);
  private readonly _connections = signal<BankConnection[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _connectingBankId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);

  // ── Public API ──
  readonly banks = this._banks.asReadonly();
  readonly connections = this._connections.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly connectingBankId = this._connectingBankId.asReadonly();
  readonly error = this._error.asReadonly();

  /** Ids de bancos já conectados (para desabilitar no catálogo). */
  readonly connectedBankIds = computed(
    () => new Set(this._connections().map((c) => c.bankId))
  );

  /** Bancos ainda não conectados, prontos para oferta no catálogo. */
  readonly availableBanks = computed(() => {
    const connected = this.connectedBankIds();
    return this._banks().filter((bank) => !connected.has(bank.id));
  });

  /** Saldo somado de todas as contas conectadas. */
  readonly consolidatedBalance = computed(() =>
    sum(this._connections().map((c) => c.account.balance))
  );

  /** Total de lançamentos sincronizados em todas as contas. */
  readonly totalTransactions = computed(() =>
    this._connections().reduce((acc, c) => acc + c.transactions.length, 0)
  );

  /** Extrato unificado de todas as contas, ordenado do mais recente ao antigo. */
  readonly consolidatedTransactions = computed<ConsolidatedTransaction[]>(() => {
    const byId = new Map(this._banks().map((b) => [b.id, b]));
    return this._connections()
      .flatMap((c) => c.transactions)
      .map((tx) => ({ ...tx, bank: byId.get(tx.bankId) }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  /** Resolve um banco pelo id (para a UI). */
  bankOf(bankId: string): Bank | undefined {
    return this._banks().find((b) => b.id === bankId);
  }

  /** Carrega catálogo + conexões persistidas. */
  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const [banks, connections] = await Promise.all([
        this.repository.listAvailableBanks(),
        this.repository.listConnections(),
      ]);
      this._banks.set(banks);
      this._connections.set(connections);
      // Garante que o caixa reflita as conexões já existentes (idempotente).
      await this.cashSync.reconcileAll(connections);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao carregar integrações.'));
    } finally {
      this._loading.set(false);
    }
  }

  /** Autoriza o consentimento (simulado) e adiciona a conexão. */
  async connect(bankId: string): Promise<void> {
    this._connectingBankId.set(bankId);
    this._error.set(null);
    try {
      const connection = await this.repository.connect(bankId);
      this._connections.update((list) => [...list, connection]);
      // Reflete as transações no caixa (entradas/saídas, saldo e dashboard).
      await this.cashSync.importConnection(connection);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao conectar instituição.'));
      throw err;
    } finally {
      this._connectingBankId.set(null);
    }
  }

  /** Revoga o consentimento de uma conexão. */
  async disconnect(connectionId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      // Remove do caixa antes de revogar (somem de Caixa, Fluxo e Dashboard).
      await this.cashSync.removeConnection(connectionId);
      await this.repository.disconnect(connectionId);
      this._connections.update((list) => list.filter((c) => c.id !== connectionId));
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao desconectar instituição.'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /** Re-sincroniza o extrato de uma conexão. */
  async sync(connectionId: string): Promise<void> {
    this._error.set(null);
    try {
      const refreshed = await this.repository.sync(connectionId);
      this._connections.update((list) =>
        list.map((c) => (c.id === connectionId ? refreshed : c))
      );
      // Re-reflete o extrato atualizado no caixa.
      await this.cashSync.removeConnection(connectionId);
      await this.cashSync.importConnection(refreshed);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao sincronizar extrato.'));
      throw err;
    }
  }
}
