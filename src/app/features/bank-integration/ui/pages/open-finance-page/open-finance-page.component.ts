import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { BankIntegrationFacade } from '../../../application/bank-integration.facade';
import type { Bank, BankAccountKind, BankSegment } from '../../../domain/entities/bank.entity';
import type {
  BankConnection,
  BankTransactionChannel,
} from '../../../domain/entities/bank-transaction.entity';
import { BadgeComponent } from '../../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../../shared/components/stat-card/stat-card.component';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';

type ConnectPhase = 'consent' | 'connecting' | 'done' | 'error';
type BankFilter = 'TODOS' | string;

@Component({
  selector: 'tc-open-finance-page',
  standalone: true,
  imports: [
    DatePipe,
    PageHeaderComponent,
    StatCardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    BrlCurrencyPipe,
  ],
  template: `
    <div class="of-page">
      <tc-page-header title="Open Finance">
        <div class="page-header-action">
          <tc-button variant="primary" (clicked)="openCatalog()">+ Conectar banco</tc-button>
        </div>
      </tc-page-header>

      <!-- ─── Hero ─────────────────────────────────────────── -->
      <section class="of-hero">
        <div class="of-hero-glow" aria-hidden="true"></div>
        <div class="of-hero-content">
          <span class="of-pill">
            <span class="of-pill-dot" aria-hidden="true"></span>
            Conexão Segura
          </span>
          <h2 class="of-hero-title">Todas as suas contas em um só lugar</h2>
          <p class="of-hero-sub">
            Conecte instituições financeiras e visualize saldos e extratos de forma
            consolidada. Você decide o que compartilhar e revoga quando quiser.
          </p>
        </div>

        <div class="of-hero-logos" aria-hidden="true">
          @for (bank of facade.banks(); track bank.id) {
            <img class="of-hero-logo" [src]="bank.logo" [alt]="bank.name" loading="lazy" />
          }
        </div>
      </section>

      <!-- ─── Aviso de demonstração ────────────────────────── -->
      <!-- <div class="of-demo-note" role="note">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>
          <strong>Demonstração.</strong> Esta é uma simulação do fluxo de Open Finance —
          os dados de saldo e extrato são ilustrativos e não há conexão real com bancos.
        </span>
      </div> -->

      @if (facade.loading() && facade.connections().length === 0) {
        <tc-loading-state message="Carregando integrações..."></tc-loading-state>
      } @else {
        <!-- ─── KPIs ───────────────────────────────────────── -->
        <div class="kpis-grid">
          <tc-stat-card
            label="Instituições conectadas"
            [value]="facade.connections().length.toString()"
            icon="balance"
            tone="primary"
            [hint]="facade.banks().length + ' disponíveis no catálogo'"
          ></tc-stat-card>
          <tc-stat-card
            label="Saldo consolidado"
            [value]="facade.consolidatedBalance() | brlCurrency"
            icon="income"
            tone="success"
            hint="Somatório de todas as contas"
          ></tc-stat-card>
          <tc-stat-card
            label="Lançamentos sincronizados"
            [value]="facade.totalTransactions().toString()"
            icon="calendar"
            tone="neutral"
            hint="Extrato dos últimos dias"
          ></tc-stat-card>
        </div>

        <!-- ─── Contas conectadas ──────────────────────────── -->
        <section class="of-section">
          <div class="of-section-head">
            <h3 class="of-section-title">Contas conectadas</h3>
            @if (facade.connections().length > 0) {
              <tc-badge tone="success">{{ facade.connections().length }} ativa(s)</tc-badge>
            }
          </div>

          @if (facade.connections().length === 0) {
            <tc-empty-state
              title="Nenhuma conta conectada"
              message="Conecte uma instituição abaixo para visualizar saldos e extratos consolidados."
            ></tc-empty-state>
          } @else {
            <div class="connected-grid">
              @for (conn of facade.connections(); track conn.id) {
                <article class="connected-card">
                  <header class="connected-head">
                    <span class="bank-logo lg" [style.box-shadow]="ringFor(conn.bankId)">
                      <img [src]="logoOf(conn.bankId)" [alt]="nameOf(conn.bankId)" />
                    </span>
                    <div class="connected-id">
                      <span class="connected-name">{{ nameOf(conn.bankId) }}</span>
                      <span class="connected-meta">
                        {{ accountKindLabel(conn.account.kind) }} · Ag. {{ conn.account.agency }} ·
                        {{ maskAccount(conn.account.number) }}
                      </span>
                    </div>
                  </header>

                  <div class="connected-balance">
                    <span class="balance-label">Saldo disponível</span>
                    <span class="balance-value">{{ conn.account.balance | brlCurrency }}</span>
                    <span class="balance-sync">
                      <span class="sync-dot" aria-hidden="true"></span>
                      Sincronizado em {{ conn.lastSyncAt | date: 'dd/MM HH:mm' }}
                    </span>
                  </div>

                  <div class="mini-statement">
                    <span class="mini-title">Últimos lançamentos</span>
                    @for (tx of recentOf(conn); track tx.id) {
                      <div class="mini-row">
                        <span class="mini-icon" [class]="'tone-' + (tx.type === 'CREDITO' ? 'in' : 'out')" aria-hidden="true">
                          {{ tx.type === 'CREDITO' ? '↓' : '↑' }}
                        </span>
                        <span class="mini-desc" [title]="tx.description">{{ tx.description }}</span>
                        <span class="mini-amount" [class]="'tone-' + (tx.type === 'CREDITO' ? 'in' : 'out')">
                          {{ tx.type === 'CREDITO' ? '+' : '−' }}{{ tx.amount | brlCurrency }}
                        </span>
                      </div>
                    }
                  </div>

                  <footer class="connected-actions">
                    <tc-button
                      variant="secondary"
                      size="sm"
                      [block]="true"
                      [loading]="syncingId() === conn.id"
                      (clicked)="syncConnection(conn)"
                    >Sincronizar</tc-button>
                    <tc-button
                      variant="ghost"
                      size="sm"
                      [block]="true"
                      (clicked)="openDisconnect(conn)"
                    >Desconectar</tc-button>
                  </footer>
                </article>
              }
            </div>
          }
        </section>

        <!-- Catálogo movido para o modal "Conectar nova instituição" (botão no topo) -->

        <!-- ─── Extrato consolidado ────────────────────────── -->
        @if (facade.connections().length > 0) {
          <section class="of-section">
            <div class="of-section-head">
              <h3 class="of-section-title">Extrato consolidado</h3>
              <span class="of-section-hint">{{ filteredTransactions().length }} lançamentos</span>
            </div>

            <div class="filter-chips" role="tablist" aria-label="Filtrar por banco">
              <button
                class="chip"
                [class.active]="bankFilter() === 'TODOS'"
                (click)="bankFilter.set('TODOS')"
              >Todos</button>
              @for (conn of facade.connections(); track conn.id) {
                <button
                  class="chip"
                  [class.active]="bankFilter() === conn.bankId"
                  (click)="bankFilter.set(conn.bankId)"
                >
                  <img class="chip-logo" [src]="logoOf(conn.bankId)" [alt]="''" aria-hidden="true" />
                  {{ shortNameOf(conn.bankId) }}
                </button>
              }
            </div>

            <div class="table-wrapper desktop-only">
              <table class="tc-table">
                <thead>
                  <tr>
                    <th>Instituição</th>
                    <th>Descrição</th>
                    <th class="text-center">Canal</th>
                    <th class="text-center">Data</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tx of filteredTransactions(); track tx.id) {
                    <tr>
                      <td>
                        <span class="cell-bank">
                          <img class="cell-logo" [src]="tx.bank?.logo" [alt]="tx.bank?.name ?? ''" />
                          {{ tx.bank?.shortName }}
                        </span>
                      </td>
                      <td class="truncate-cell" [title]="tx.description">{{ tx.description }}</td>
                      <td class="text-center"><tc-badge tone="neutral">{{ channelLabel(tx.channel) }}</tc-badge></td>
                      <td class="text-center text-secondary">{{ tx.date | date: 'dd/MM/yyyy' }}</td>
                      <td class="text-right amount" [class]="'tone-' + (tx.type === 'CREDITO' ? 'in' : 'out')">
                        {{ tx.type === 'CREDITO' ? '+' : '−' }}{{ tx.amount | brlCurrency }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="mobile-cards mobile-only">
              @for (tx of filteredTransactions(); track tx.id) {
                <div class="tx-card">
                  <div class="tx-card-top">
                    <span class="cell-bank">
                      <img class="cell-logo" [src]="tx.bank?.logo" [alt]="tx.bank?.name ?? ''" />
                      {{ tx.bank?.shortName }}
                    </span>
                    <span class="amount" [class]="'tone-' + (tx.type === 'CREDITO' ? 'in' : 'out')">
                      {{ tx.type === 'CREDITO' ? '+' : '−' }}{{ tx.amount | brlCurrency }}
                    </span>
                  </div>
                  <span class="tx-desc">{{ tx.description }}</span>
                  <div class="tx-card-meta">
                    <tc-badge tone="neutral">{{ channelLabel(tx.channel) }}</tc-badge>
                    <span class="text-secondary">{{ tx.date | date: 'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>

    <!-- ─── Modal: catálogo de instituições ──────────────────── -->
    <tc-modal
      [open]="isCatalogOpen()"
      title="Conectar nova instituição"
      (close)="closeCatalog()"
    >
      @if (facade.availableBanks().length === 0) {
        <div class="of-all-connected in-modal" role="status">
          <span class="check-circle" aria-hidden="true">✓</span>
          Todas as instituições do catálogo já estão conectadas.
        </div>
      } @else {
        <div class="catalog-search">
          <svg class="catalog-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            #searchInput
            type="text"
            class="catalog-search-input"
            placeholder="Buscar por nome ou tipo..."
            [value]="catalogSearch()"
            (input)="catalogSearch.set(searchInput.value)"
            aria-label="Buscar instituição"
          />
          @if (catalogSearch()) {
            <button type="button" class="catalog-search-clear" (click)="catalogSearch.set('')" aria-label="Limpar busca">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          }
        </div>

        @if (filteredAvailableBanks().length === 0) {
          <p class="catalog-empty">Nenhuma instituição encontrada para “{{ catalogSearch() }}”.</p>
        } @else {
          <div class="catalog-grid in-modal">
            @for (bank of filteredAvailableBanks(); track bank.id) {
              <article class="catalog-card">
                <span class="bank-logo md" [style.box-shadow]="ringFor(bank.id)">
                  <img [src]="bank.logo" [alt]="bank.name" loading="lazy" />
                </span>
                <div class="catalog-info">
                  <span class="catalog-name">{{ bank.name }}</span>
                  <tc-badge [tone]="segmentTone(bank.segment)">{{ segmentLabel(bank.segment) }}</tc-badge>
                </div>
                <tc-button
                  variant="primary"
                  size="sm"
                  [block]="true"
                  (clicked)="openConsent(bank)"
                >Conectar</tc-button>
              </article>
            }
          </div>
        }
      }
    </tc-modal>

    <!-- ─── Modal: consentimento / conexão ───────────────────── -->
    <tc-modal
      [open]="isConsentOpen()"
      [title]="consentTitle()"
      [closeOnBackdrop]="connectPhase() !== 'connecting'"
      (close)="closeConsent()"
    >
      @if (consentBank(); as bank) {
        <!-- Etapa 1: consentimento -->
        @if (connectPhase() === 'consent') {
          <div class="consent">
            <div class="consent-bank">
              <span class="bank-logo lg" [style.box-shadow]="ringFor(bank.id)">
                <img [src]="bank.logo" [alt]="bank.name" />
              </span>
              <div>
                <span class="consent-bank-name">{{ bank.name }}</span>
                <span class="consent-bank-seg">{{ segmentLabel(bank.segment) }}</span>
              </div>
            </div>

            <p class="consent-lead">
              O <strong>TrimiCash</strong> solicita autorização para acessar, via Open Finance,
              os seguintes dados de <strong>{{ bank.shortName }}</strong>:
            </p>

            <ul class="consent-scopes">
              @for (scope of consentScopes; track scope) {
                <li>
                  <span class="scope-check" aria-hidden="true">✓</span>
                  {{ scope }}
                </li>
              }
            </ul>

            <p class="consent-legal">
              O compartilhamento é por tempo determinado e pode ser revogado a qualquer momento.
              <em>Fluxo simulado para fins de demonstração.</em>
            </p>

            <div class="modal-actions">
              <tc-button variant="ghost" [block]="true" (clicked)="closeConsent()">Cancelar</tc-button>
              <tc-button variant="primary" [block]="true" (clicked)="authorizeConnect()">Autorizar e conectar</tc-button>
            </div>
          </div>
        }

        <!-- Etapa 2: conectando (stepper) -->
        @if (connectPhase() === 'connecting') {
          <div class="connecting" aria-live="polite">
            <div class="connecting-spinner">
              <span class="bank-logo lg pulse" [style.box-shadow]="ringFor(bank.id)">
                <img [src]="bank.logo" [alt]="bank.name" />
              </span>
            </div>
            <ul class="stepper">
              @for (step of connectSteps; track step; let i = $index) {
                <li class="step" [class]="'step-' + stepState(i)">
                  <span class="step-marker" aria-hidden="true">
                    @if (stepState(i) === 'done') { ✓ } @else if (stepState(i) === 'active') {
                      <span class="step-spin"></span>
                    }
                  </span>
                  <span class="step-label">{{ step }}</span>
                </li>
              }
            </ul>
          </div>
        }

        <!-- Etapa 3: sucesso -->
        @if (connectPhase() === 'done') {
          <div class="done" aria-live="polite">
            <div class="done-badge" aria-hidden="true">✓</div>
            <h3 class="done-title">{{ bank.shortName }} conectado!</h3>
            <p class="done-sub">Saldos e extrato foram sincronizados e já aparecem na sua visão consolidada.</p>
            <tc-button variant="primary" [block]="true" (clicked)="closeConsent()">Concluir</tc-button>
          </div>
        }

        <!-- Erro -->
        @if (connectPhase() === 'error') {
          <div class="done">
            <div class="done-badge error" aria-hidden="true">!</div>
            <h3 class="done-title">Não foi possível conectar</h3>
            <p class="done-sub">{{ connectError() }}</p>
            <tc-button variant="primary" [block]="true" (clicked)="closeConsent()">Fechar</tc-button>
          </div>
        }
      }
    </tc-modal>

    <!-- ─── Modal: desconectar ───────────────────────────────── -->
    <tc-modal
      [open]="isDisconnectOpen()"
      title="Revogar conexão"
      (close)="closeDisconnect()"
    >
      @if (connectionToDisconnect(); as conn) {
        <p class="body-md" style="margin-bottom: var(--space-3);">
          Deseja revogar o compartilhamento com <strong>{{ nameOf(conn.bankId) }}</strong>?
        </p>
        <p class="body-sm text-secondary" style="margin-bottom: var(--space-5);">
          A conta e o extrato deixarão de aparecer na visão consolidada. Você pode reconectar quando quiser.
        </p>
        <div class="modal-actions">
          <tc-button variant="ghost" [block]="true" (clicked)="closeDisconnect()">Voltar</tc-button>
          <tc-button variant="danger" [block]="true" [loading]="facade.loading()" (clicked)="confirmDisconnect()">
            Sim, desconectar
          </tc-button>
        </div>
      }
    </tc-modal>
  `,
  styles: [`
    .of-page {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: var(--space-8);
    }

    /* ─── Hero ──────────────────────────────────────────── */
    .of-hero {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-xl);
      background: var(--gradient-deep);
      color: #fff;
      padding: var(--space-6);
      margin-bottom: var(--space-4);
      box-shadow: var(--shadow-lg);
    }

    .of-hero-glow {
      position: absolute;
      top: -60px; right: -40px;
      width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(86, 163, 243, 0.55) 0%, transparent 70%);
      pointer-events: none;
    }

    .of-hero-content { position: relative; max-width: 620px; }

    .of-pill {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 5px 12px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.22);
      font-size: var(--font-size-xs);
      font-weight: 600;
      letter-spacing: 0.02em;
      backdrop-filter: blur(6px);
    }

    .of-pill-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6);
      animation: livePulse 2s ease-in-out infinite;
    }

    @keyframes livePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5); }
      50% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
    }

    .of-hero-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-3xl);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: var(--space-4) 0 var(--space-2);
      line-height: 1.1;
    }

    .of-hero-sub {
      margin: 0;
      font-size: var(--font-size-md);
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.85);
    }

    .of-hero-logos {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-5);
    }

    .of-hero-logo {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 13px;
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      transition: transform var(--motion-normal);
    }

    .of-hero-logo:hover { transform: translateY(-4px) scale(1.06); }

    /* ─── Aviso demo ────────────────────────────────────── */
    .of-demo-note {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-warning-50);
      color: var(--color-text-primary);
      border: 1px solid rgba(245, 158, 11, 0.25);
      font-size: var(--font-size-sm);
      line-height: 1.45;
      margin-bottom: var(--space-5);
    }

    .of-demo-note svg { color: var(--color-warning-500); flex-shrink: 0; margin-top: 1px; }

    /* ─── KPIs ──────────────────────────────────────────── */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    @media (max-width: 768px) {
      .kpis-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .kpis-grid > *:last-child:nth-child(3) { grid-column: 1 / -1; }
    }

    /* ─── Seções ────────────────────────────────────────── */
    .of-section { margin-bottom: var(--space-6); }

    .of-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .of-section-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }

    .of-section-hint {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    /* ─── Logo do banco (reutilizável) ──────────────────────
       Ícones quadrados padronizados, exibidos com cantos
       arredondados (estilo "app icon") preenchendo a caixa. */
    .bank-logo {
      display: inline-block;
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .bank-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .bank-logo.md { width: 56px; height: 56px; }
    .bank-logo.lg { width: 58px; height: 58px; }
    .bank-logo.pulse { animation: logoPulse 1.6s ease-in-out infinite; }

    /* Logo compacto em linhas de tabela / cards de extrato */
    .cell-logo {
      width: 26px;
      height: 26px;
      object-fit: cover;
      background: #fff;
      border-radius: 7px;
      display: inline-block;
      vertical-align: middle;
      flex-shrink: 0;
    }

    @keyframes logoPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }

    /* ─── Cards de contas conectadas ────────────────────── */
    .connected-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-4);
    }

    .connected-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      transition: transform 0.3s var(--motion-spring), box-shadow 0.3s var(--motion-spring), border-color 0.3s;
    }

    .connected-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-glow-accent);
      border-color: rgba(47, 128, 237, 0.2);
    }

    .connected-head { display: flex; align-items: center; gap: var(--space-3); }
    .connected-id { display: flex; flex-direction: column; min-width: 0; }
    .connected-name {
      font-family: var(--font-family-display);
      font-weight: 700;
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
    }
    .connected-meta {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .connected-balance {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-bg-row);
      border: 1px solid var(--color-border-card);
    }
    .balance-label { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
    .balance-value {
      font-family: var(--font-family-display);
      font-size: var(--font-size-2xl);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
    }
    .balance-sync {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: var(--space-1);
    }
    .sync-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--color-success-500);
    }

    .mini-statement { display: flex; flex-direction: column; gap: var(--space-2); }
    .mini-title {
      font-size: var(--font-size-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
    }
    .mini-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
    }
    .mini-icon {
      width: 22px; height: 22px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .mini-desc {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-text-secondary);
    }
    .mini-amount { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }

    .tone-in { color: var(--color-success-500); }
    .tone-out { color: var(--color-danger-500); }
    .mini-icon.tone-in { background: var(--color-success-50); color: var(--color-success-500); }
    .mini-icon.tone-out { background: var(--color-danger-50); color: var(--color-danger-500); }

    .connected-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
      margin-top: auto;
    }

    /* ─── Catálogo ──────────────────────────────────────── */
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .catalog-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--space-3);
      transition: transform 0.3s var(--motion-spring), box-shadow 0.3s var(--motion-spring), border-color 0.3s;
    }

    .catalog-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-glow-accent);
      border-color: rgba(47, 128, 237, 0.2);
    }

    .catalog-info { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
    .catalog-name {
      font-weight: 600;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      line-height: 1.3;
    }

    .of-all-connected {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-5);
      border-radius: var(--radius-lg);
      background: var(--color-success-50);
      border: 1px dashed rgba(22, 163, 74, 0.3);
      color: var(--color-success-500);
      font-size: var(--font-size-sm);
      font-weight: 600;
      margin-bottom: var(--space-6);
    }
    .check-circle {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: var(--color-success-500);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 13px;
    }

    .of-all-connected.in-modal { margin-bottom: 0; }

    /* ─── Busca do modal de catálogo ────────────────────── */
    .catalog-search {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    .catalog-search-icon {
      position: absolute;
      left: 12px;
      color: var(--color-text-muted);
      pointer-events: none;
    }
    .catalog-search-input {
      width: 100%;
      padding: 11px 38px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-card);
      background: var(--color-bg-input);
      color: var(--color-text-primary);
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
    }
    .catalog-search-input::placeholder { color: var(--color-text-muted); }
    .catalog-search-input:focus {
      outline: none;
      border-color: var(--color-accent-500);
      box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.15);
    }
    .catalog-search-clear {
      position: absolute;
      right: 8px;
      display: grid;
      place-items: center;
      width: 26px; height: 26px;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: background var(--motion-fast), color var(--motion-fast);
    }
    .catalog-search-clear:hover { background: var(--color-bg-row-hover); color: var(--color-text-primary); }

    .catalog-grid.in-modal {
      grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
      gap: var(--space-3);
    }
    .catalog-grid.in-modal .catalog-card { padding: var(--space-4); }

    .catalog-empty {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      padding: var(--space-6) var(--space-4);
      margin: 0;
    }

    /* ─── Filtro de bancos ──────────────────────────────── */
    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border-card);
      background: var(--color-bg-card);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--motion-fast);
    }
    .chip:hover { border-color: var(--color-accent-500); color: var(--color-accent-500); }
    .chip.active {
      background: var(--color-accent-500);
      border-color: var(--color-accent-500);
      color: #fff;
    }
    .chip-logo { width: 18px; height: 18px; object-fit: cover; border-radius: 5px; background: #fff; }

    /* ─── Tabela ────────────────────────────────────────── */
    .table-wrapper {
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-card);
      overflow-x: auto;
      box-shadow: var(--shadow-card);
    }
    .tc-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 640px; }
    .tc-table th {
      padding: var(--space-3) var(--space-4);
      background: var(--color-background);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--color-border-card);
    }
    .tc-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border-card);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    .tc-table tr:last-child td { border-bottom: none; }
    .tc-table tbody tr { transition: background var(--motion-fast); }
    .tc-table tbody tr:hover { background: var(--color-bg-row-hover); }

    .cell-bank { display: inline-flex; align-items: center; gap: var(--space-2); font-weight: 600; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-secondary { color: var(--color-text-secondary); }
    .amount { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .truncate-cell { max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ─── Cards mobile do extrato ───────────────────────── */
    .tx-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-card);
    }
    .tx-card-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .tx-desc {
      display: block;
      margin: var(--space-2) 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    .tx-card-meta { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); font-size: var(--font-size-xs); }

    .desktop-only { display: block; }
    .mobile-only { display: none; }
    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only { display: block; }
      .page-header-action { margin-left: auto; }
      .of-hero-title { font-size: var(--font-size-2xl); }
      .connected-grid, .catalog-grid { grid-template-columns: 1fr; }
    }

    /* ─── Modal: consentimento ──────────────────────────── */
    .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
    @media (max-width: 767px) {
      .modal-actions { flex-direction: column-reverse; }
      .modal-actions > * { width: 100%; }
    }

    .consent-bank {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-bg-row);
      border: 1px solid var(--color-border-card);
      margin-bottom: var(--space-4);
    }
    .consent-bank-name { display: block; font-weight: 700; color: var(--color-text-primary); }
    .consent-bank-seg { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); }

    .consent-lead { margin: 0 0 var(--space-3); font-size: var(--font-size-sm); line-height: 1.5; color: var(--color-text-primary); }
    .consent-scopes { list-style: none; margin: 0 0 var(--space-4); padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
    .consent-scopes li {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    .scope-check {
      width: 20px; height: 20px;
      border-radius: 50%;
      background: var(--color-success-50);
      color: var(--color-success-500);
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .consent-legal {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0 0 var(--space-5);
    }

    /* ─── Modal: conectando ─────────────────────────────── */
    .connecting { text-align: center; padding: var(--space-2) 0; }
    .connecting-spinner { display: grid; place-items: center; margin-bottom: var(--space-5); }
    .stepper { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); text-align: left; }
    .step { display: flex; align-items: center; gap: var(--space-3); font-size: var(--font-size-sm); transition: opacity var(--motion-normal); }
    .step-marker {
      width: 24px; height: 24px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 700;
      border: 2px solid var(--color-border);
      color: var(--color-text-muted);
    }
    .step-pending { opacity: 0.5; }
    .step-pending .step-label { color: var(--color-text-secondary); }
    .step-active .step-marker { border-color: var(--color-accent-500); }
    .step-active .step-label { color: var(--color-text-primary); font-weight: 600; }
    .step-done .step-marker { background: var(--color-success-500); border-color: var(--color-success-500); color: #fff; }
    .step-done .step-label { color: var(--color-text-primary); }
    .step-spin {
      width: 12px; height: 12px;
      border: 2px solid var(--color-accent-500);
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* ─── Modal: sucesso/erro ───────────────────────────── */
    .done { text-align: center; padding: var(--space-2) 0; }
    .done-badge {
      width: 64px; height: 64px;
      margin: 0 auto var(--space-4);
      border-radius: 50%;
      background: var(--color-success-50);
      color: var(--color-success-500);
      display: grid;
      place-items: center;
      font-size: 30px;
      font-weight: 800;
      animation: popIn 0.35s var(--motion-spring) both;
    }
    .done-badge.error { background: var(--color-danger-50); color: var(--color-danger-500); }
    @keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .done-title { font-family: var(--font-family-display); font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--space-2); }
    .done-sub { font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.5; margin: 0 0 var(--space-5); }

    /* ─── Ajustes dark ──────────────────────────────────── */
    :host-context([data-theme="dark"]) .of-hero-logo,
    :host-context([data-theme="dark"]) .bank-logo,
    :host-context([data-theme="dark"]) .cell-logo,
    :host-context([data-theme="dark"]) .chip-logo {
      background: #f4f6fb;
    }
    :host-context([data-theme="dark"]) .of-demo-note {
      background: rgba(245, 158, 11, 0.12);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenFinancePageComponent implements OnInit {
  readonly facade = inject(BankIntegrationFacade);
  private readonly toast = inject(ToastService);

  // ── Estado de UI ──
  readonly bankFilter = signal<BankFilter>('TODOS');
  readonly syncingId = signal<string | null>(null);

  // Modal de catálogo (conectar nova instituição) + busca
  readonly isCatalogOpen = signal(false);
  readonly catalogSearch = signal('');

  // Modal de consentimento/conexão
  readonly consentBank = signal<Bank | null>(null);
  readonly connectPhase = signal<ConnectPhase>('consent');
  readonly connectStepIndex = signal(0);
  readonly connectError = signal<string | null>(null);

  // Modal de desconexão
  readonly connectionToDisconnect = signal<BankConnection | null>(null);

  readonly connectSteps = [
    'Redirecionando para o ambiente seguro',
    'Autenticando sua identidade',
    'Autorizando o compartilhamento de dados',
    'Sincronizando contas e extrato',
  ];

  readonly consentScopes = [
    'Dados cadastrais da conta',
    'Saldos em conta',
    'Extrato de transações (últimos 12 meses)',
  ];

  readonly isConsentOpen = computed(() => this.consentBank() !== null);
  readonly isDisconnectOpen = computed(() => this.connectionToDisconnect() !== null);

  readonly consentTitle = computed(() => {
    switch (this.connectPhase()) {
      case 'connecting': return 'Conectando...';
      case 'done': return 'Conexão concluída';
      case 'error': return 'Falha na conexão';
      default: return 'Autorizar Open Finance';
    }
  });

  readonly filteredTransactions = computed(() => {
    const filter = this.bankFilter();
    const all = this.facade.consolidatedTransactions();
    return filter === 'TODOS' ? all : all.filter((tx) => tx.bankId === filter);
  });

  /** Instituições do catálogo filtradas pela busca do modal. */
  readonly filteredAvailableBanks = computed(() => {
    const term = this.catalogSearch().trim().toLowerCase();
    const banks = this.facade.availableBanks();
    if (!term) return banks;
    return banks.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.shortName.toLowerCase().includes(term) ||
        this.segmentLabel(b.segment).toLowerCase().includes(term)
    );
  });

  async ngOnInit(): Promise<void> {
    await this.facade.load();
  }

  // ── Helpers de banco ──
  logoOf(bankId: string): string { return this.facade.bankOf(bankId)?.logo ?? ''; }
  nameOf(bankId: string): string { return this.facade.bankOf(bankId)?.name ?? bankId; }
  shortNameOf(bankId: string): string { return this.facade.bankOf(bankId)?.shortName ?? bankId; }

  /** Anel sutil com a cor de marca ao redor do logo. */
  ringFor(bankId: string): string {
    const color = this.facade.bankOf(bankId)?.brandColor ?? '#2f80ed';
    return `0 0 0 2px ${color}33`;
  }

  recentOf(conn: BankConnection) {
    return conn.transactions.slice(0, 3);
  }

  accountKindLabel(kind: BankAccountKind): string {
    switch (kind) {
      case 'CORRENTE': return 'Conta Corrente';
      case 'POUPANCA': return 'Poupança';
      case 'PAGAMENTOS': return 'Conta de Pagamento';
      case 'INVESTIMENTO': return 'Conta Investimento';
    }
  }

  maskAccount(number: string): string {
    return `C/C ••••${number.slice(-4)}`;
  }

  segmentLabel(segment: BankSegment): string {
    switch (segment) {
      case 'banco': return 'Banco';
      case 'publico': return 'Banco público';
      case 'fintech': return 'Banco digital';
      case 'cooperativa': return 'Cooperativa';
      case 'pagamentos': return 'Pagamentos';
      case 'investimento': return 'Investimentos';
    }
  }

  segmentTone(segment: BankSegment): 'neutral' | 'info' | 'success' | 'accent' | 'warning' {
    switch (segment) {
      case 'fintech': return 'accent';
      case 'cooperativa': return 'success';
      case 'pagamentos': return 'info';
      case 'investimento': return 'warning';
      default: return 'neutral';
    }
  }

  channelLabel(channel: BankTransactionChannel): string {
    switch (channel) {
      case 'PIX': return 'Pix';
      case 'TED': return 'TED';
      case 'BOLETO': return 'Boleto';
      case 'CARTAO': return 'Cartão';
      case 'TARIFA': return 'Tarifa';
      case 'SALARIO': return 'Salário';
      case 'RENDIMENTO': return 'Rendimento';
      case 'SAQUE': return 'Saque';
    }
  }

  stepState(index: number): 'done' | 'active' | 'pending' {
    const current = this.connectStepIndex();
    if (index < current) return 'done';
    if (index === current) return 'active';
    return 'pending';
  }

  // ── Modal de catálogo ──
  openCatalog(): void {
    this.catalogSearch.set('');
    this.isCatalogOpen.set(true);
  }

  closeCatalog(): void {
    this.isCatalogOpen.set(false);
  }

  // ── Fluxo de conexão ──
  openConsent(bank: Bank): void {
    this.isCatalogOpen.set(false);
    this.consentBank.set(bank);
    this.connectPhase.set('consent');
    this.connectStepIndex.set(0);
    this.connectError.set(null);
  }

  closeConsent(): void {
    if (this.connectPhase() === 'connecting') return; // evita fechar no meio
    this.consentBank.set(null);
  }

  async authorizeConnect(): Promise<void> {
    const bank = this.consentBank();
    if (!bank) return;

    this.connectPhase.set('connecting');
    this.connectStepIndex.set(0);

    try {
      const stepper = this.runStepper();
      await this.facade.connect(bank.id);
      await stepper;
      this.connectPhase.set('done');
      this.toast.show(`${bank.shortName} conectado com sucesso.`, 'success');
    } catch (err: unknown) {
      this.connectError.set(err instanceof Error ? err.message : 'Não foi possível concluir a conexão.');
      this.connectPhase.set('error');
    }
  }

  private async runStepper(): Promise<void> {
    for (let i = 0; i < this.connectSteps.length; i++) {
      this.connectStepIndex.set(i);
      await this.sleep(700);
    }
    this.connectStepIndex.set(this.connectSteps.length);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ── Sincronização ──
  async syncConnection(conn: BankConnection): Promise<void> {
    this.syncingId.set(conn.id);
    try {
      await this.facade.sync(conn.id);
      this.toast.show(`Extrato de ${this.shortNameOf(conn.bankId)} atualizado.`, 'success');
    } catch {
      this.toast.show('Erro ao sincronizar extrato.', 'error');
    } finally {
      this.syncingId.set(null);
    }
  }

  // ── Desconexão ──
  openDisconnect(conn: BankConnection): void {
    this.connectionToDisconnect.set(conn);
  }

  closeDisconnect(): void {
    this.connectionToDisconnect.set(null);
  }

  async confirmDisconnect(): Promise<void> {
    const conn = this.connectionToDisconnect();
    if (!conn) return;

    try {
      await this.facade.disconnect(conn.id);
      this.toast.show('Conexão revogada.', 'success');
      // Se o filtro apontava para o banco removido, volta para "Todos".
      if (this.bankFilter() === conn.bankId) this.bankFilter.set('TODOS');
      this.closeDisconnect();
    } catch {
      this.toast.show('Erro ao desconectar instituição.', 'error');
    }
  }
}
