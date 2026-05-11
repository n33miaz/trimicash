import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal,
} from '@angular/core';
import * as XLSX from 'xlsx';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { AccountsPayableFacade } from '../../../../accounts-payable/application/accounts-payable.facade';
import { AccountsReceivableFacade } from '../../../../accounts-receivable/application/accounts-receivable.facade';
import { CashFlowFacade } from '../../../application/cash-flow.facade';
import {
  CashFlowReportCalculatorService,
  CashFlowReportViewMode,
  DayColumn,
} from '../../../application/cash-flow-report-calculator.service';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'tc-cash-flow-report-page',
  standalone: true,
  imports: [PageHeaderComponent, ButtonComponent, LoadingStateComponent, BrlCurrencyPipe],
  templateUrl: './cash-flow-report-page.component.html',
  styleUrl: './cash-flow-report-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFlowReportPageComponent implements OnInit {
  private readonly cashFlow = inject(CashFlowFacade);
  private readonly payables = inject(AccountsPayableFacade);
  private readonly receivables = inject(AccountsReceivableFacade);
  private readonly categories = inject(CategoriesFacade);
  private readonly reportCalculator = new CashFlowReportCalculatorService();

  readonly loading = computed(() => this.cashFlow.loading());
  readonly viewMode = signal<CashFlowReportViewMode>('MONTHLY');
  readonly currentDay = signal(this.startOfToday());
  readonly currentMonth = signal(new Date().getMonth());
  readonly currentYear = signal(new Date().getFullYear());
  readonly currentWeekStart = signal(this.getMonday(new Date()));
  readonly expandedDays = signal<Set<number>>(new Set());

  readonly periodLabel = computed(() => {
    if (this.viewMode() === 'DAILY') {
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(this.currentDay());
    }
    if (this.viewMode() === 'MONTHLY') {
      const d = new Date(this.currentYear(), this.currentMonth(), 1);
      return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
        .format(d).toUpperCase().replace(' DE ', ' / ');
    }
    const s = this.currentWeekStart();
    const e = new Date(s); e.setDate(e.getDate() + 6);
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    return `${fmt(s)} a ${fmt(e)}/${e.getFullYear()}`;
  });

  readonly dayColumns = computed<DayColumn[]>(() => {
    const wk = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    if (this.viewMode() === 'DAILY') {
      const d = this.currentDay();
      return [{ date: d, label: `${wk[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}` }];
    }
    if (this.viewMode() === 'MONTHLY') {
      const y = this.currentYear(), m = this.currentMonth();
      const dim = new Date(y, m+1, 0).getDate();
      return Array.from({length: dim}, (_, i) => {
        const d = new Date(y, m, i+1);
        return { date: d, label: `${wk[d.getDay()]}, ${String(i+1).padStart(2,'0')}/${String(m+1).padStart(2,'0')}` };
      });
    }
    const start = this.currentWeekStart();
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate()+i);
      return { date: d, label: `${wk[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}` };
    });
  });

  readonly reportSnapshot = computed(() => this.reportCalculator.build({
    columns: this.dayColumns(),
    movements: this.cashFlow.movements(),
    payables: this.payables.payables(),
    receivables: this.receivables.receivables(),
    categories: this.categories.categories(),
  }));

  readonly flowRows = computed(() => this.reportSnapshot().rows);

  readonly dailySummary = computed(() => this.reportSnapshot().dailySummary);

  readonly periodProjectedResult = computed(() => {
    const row = this.flowRows().find(item => item.section === 'projetado');
    if (!row) return 0;
    return row.dailyValues.reduce((acc, value) => acc + value, 0) + row.overdueValue;
  });

  readonly monthResult = computed(() => {
    const rows = this.flowRows();
    const res = rows.find(r => r.section === 'resultado');
    if (!res) return 0;
    return res.dailyValues.reduce((a,b) => a+b, 0) + res.overdueValue;
  });

  async ngOnInit() {
    await Promise.all([this.cashFlow.load(), this.categories.load(), this.payables.load(), this.receivables.load()]);
  }

  setMode(mode: CashFlowReportViewMode) { this.viewMode.set(mode); }

  previousPeriod() {
    if (this.viewMode() === 'DAILY') {
      const d = new Date(this.currentDay()); d.setDate(d.getDate()-1); this.currentDay.set(d);
    } else if (this.viewMode() === 'MONTHLY') {
      if (this.currentMonth() === 0) { this.currentMonth.set(11); this.currentYear.update(y=>y-1); }
      else this.currentMonth.update(m=>m-1);
    } else {
      const s = new Date(this.currentWeekStart()); s.setDate(s.getDate()-7); this.currentWeekStart.set(s);
    }
  }

  nextPeriod() {
    if (this.viewMode() === 'DAILY') {
      const d = new Date(this.currentDay()); d.setDate(d.getDate()+1); this.currentDay.set(d);
    } else if (this.viewMode() === 'MONTHLY') {
      if (this.currentMonth() === 11) { this.currentMonth.set(0); this.currentYear.update(y=>y+1); }
      else this.currentMonth.update(m=>m+1);
    } else {
      const s = new Date(this.currentWeekStart()); s.setDate(s.getDate()+7); this.currentWeekStart.set(s);
    }
  }

  toggleDay(idx: number) {
    if (this.viewMode() === 'DAILY') return;
    const s = new Set(this.expandedDays());
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    this.expandedDays.set(s);
  }

  isDayExpanded(idx: number) { return this.viewMode() === 'DAILY' || this.expandedDays().has(idx); }

  isPositiveSection(section: string): boolean {
    return section === 'receita' || section === 'projetado' || section === 'acumulado' || section === 'limite';
  }

  private getMonday(d: Date): Date {
    const dt = new Date(d); dt.setHours(0,0,0,0);
    const day = dt.getDay(); const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff); return dt;
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }

  exportExcel(): void {
    const cols = this.dayColumns();
    const rows = this.flowRows();
    const totalCols = cols.length + 2; // Categoria, Atrasados, dias
    
    const aoa: (string | number)[][] = [];
    
    const titleRow: (string | number)[] = [this.periodLabel()];
    for (let i = 1; i < totalCols; i++) titleRow.push('');
    aoa.push(titleRow);
    
    const headerRow: (string | number)[] = ['Categoria', 'Hoje'];
    cols.forEach(c => headerRow.push(c.label));
    aoa.push(headerRow);
    
    rows.forEach(r => {
      const row: (string | number)[] = [r.isHeader ? r.label : `  ${r.label}`, r.overdueValue];
      r.dailyValues.forEach(v => row.push(v));
      aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];
    
    const colWidths = [{ wch: 30 }, { wch: 16 }];
    cols.forEach(() => colWidths.push({ wch: 14 }));
    ws['!cols'] = colWidths;
    
    const numFmt = '#.##0,00;-#.##0,00;0,00';
    for (let r = 2; r < aoa.length; r++) {
      for (let c = 1; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = numFmt;
        }
      }
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fluxo_de_Caixa');
    
    const filename = `Fluxo_de_Caixa_${this.periodLabel().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, filename);
  }
}
