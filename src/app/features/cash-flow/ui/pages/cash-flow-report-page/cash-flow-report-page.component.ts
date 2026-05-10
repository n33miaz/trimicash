import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { CategoriesFacade } from '../../../../categories/application/categories.facade';
import { AccountsPayableFacade } from '../../../../accounts-payable/application/accounts-payable.facade';
import { AccountsReceivableFacade } from '../../../../accounts-receivable/application/accounts-receivable.facade';
import { CashFlowFacade } from '../../../application/cash-flow.facade';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { LoadingStateComponent } from '../../../../../shared/components/loading-state/loading-state.component';
import { BrlCurrencyPipe } from '../../../../../shared/pipes/brl-currency.pipe';

interface FlowRow {
  label: string;
  section: 'saldo'|'receita'|'despesa'|'resultado'|'acumulado'|'limite';
  isHeader: boolean;
  overdueValue: number;
  dailyValues: number[];
}

interface DayColumn {
  date: Date;
  label: string;
}

@Component({
  selector: 'tc-cash-flow-report-page',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent, ButtonComponent, LoadingStateComponent, BrlCurrencyPipe],
  templateUrl: './cash-flow-report-page.component.html',
  styleUrl: './cash-flow-report-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFlowReportPageComponent implements OnInit {
  private readonly cashFlow = inject(CashFlowFacade);
  private readonly payables = inject(AccountsPayableFacade);
  private readonly receivables = inject(AccountsReceivableFacade);
  private readonly categories = inject(CategoriesFacade);

  readonly loading = computed(() => this.cashFlow.loading());
  readonly viewMode = signal<'WEEKLY'|'MONTHLY'>('MONTHLY');
  readonly currentMonth = signal(new Date().getMonth());
  readonly currentYear = signal(new Date().getFullYear());
  readonly currentWeekStart = signal(this.getMonday(new Date()));
  readonly expandedDays = signal<Set<number>>(new Set());

  readonly periodLabel = computed(() => {
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

  readonly flowRows = computed<FlowRow[]>(() => {
    const cols = this.dayColumns();
    if (!cols.length) return [];
    const movements = this.cashFlow.movements();
    const pays = this.payables.payables();
    const recs = this.receivables.receivables();
    const cats = this.categories.categories();
    const catName = (id: string) => cats.find(c => c.id === id)?.name || 'Sem Categoria';

    const startDate = cols[0].date;
    const endDate = new Date(cols[cols.length-1].date); endDate.setHours(23,59,59);
    const numDays = cols.length;

    type DayMap = Map<string, number>;
    const dailyIn: {realized: DayMap; predicted: DayMap}[] = [];
    const dailyOut: {realized: DayMap; predicted: DayMap}[] = [];
    const overdueIn = new Map<string, number>();
    const overdueOut = new Map<string, number>();

    for (let i = 0; i < numDays; i++) {
      dailyIn.push({realized: new Map(), predicted: new Map()});
      dailyOut.push({realized: new Map(), predicted: new Map()});
    }

    const dayIndex = (d: Date) => {
      const diff = Math.floor((d.getTime() - startDate.getTime()) / 86400000);
      return diff >= 0 && diff < numDays ? diff : -1;
    };

    movements.filter(m => m.date >= startDate && m.date <= endDate).forEach(m => {
      const idx = dayIndex(m.date); if (idx < 0) return;
      const t = m.type === 'ENTRADA' ? dailyIn[idx].realized : dailyOut[idx].realized;
      t.set(m.categoryId, (t.get(m.categoryId)||0) + m.amount);
    });

    recs.filter(r => r.status === 'PENDENTE' || r.status === 'ATRASADA').forEach(r => {
      if (r.dueDate < startDate) { if (r.status === 'ATRASADA') overdueIn.set(r.categoryId, (overdueIn.get(r.categoryId)||0)+r.amount); }
      else { const idx = dayIndex(r.dueDate); if (idx >= 0) { const m = dailyIn[idx].predicted; m.set(r.categoryId, (m.get(r.categoryId)||0)+r.amount); } }
    });

    pays.filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADA').forEach(p => {
      if (p.dueDate < startDate) { if (p.status === 'ATRASADA') overdueOut.set(p.categoryId, (overdueOut.get(p.categoryId)||0)+p.amount); }
      else { const idx = dayIndex(p.dueDate); if (idx >= 0) { const m = dailyOut[idx].predicted; m.set(p.categoryId, (m.get(p.categoryId)||0)+p.amount); } }
    });

    const sumMap = (m: DayMap) => { let s=0; m.forEach(v => s+=v); return s; };
    const dayInTotal = (i: number) => sumMap(dailyIn[i].realized) + sumMap(dailyIn[i].predicted);
    const dayOutTotal = (i: number) => sumMap(dailyOut[i].realized) + sumMap(dailyOut[i].predicted);
    const dayCatIn = (i: number, c: string) => (dailyIn[i].realized.get(c)||0) + (dailyIn[i].predicted.get(c)||0);
    const dayCatOut = (i: number, c: string) => (dailyOut[i].realized.get(c)||0) + (dailyOut[i].predicted.get(c)||0);

    const pastMov = movements.filter(m => m.date < startDate);
    const opening = pastMov.reduce((a, m) => a + (m.type === 'ENTRADA' ? m.amount : -m.amount), 0);

    const inCats = new Set<string>(); const outCats = new Set<string>();
    overdueIn.forEach((_,c) => inCats.add(c)); overdueOut.forEach((_,c) => outCats.add(c));
    dailyIn.forEach(d => { d.realized.forEach((_,c) => inCats.add(c)); d.predicted.forEach((_,c) => inCats.add(c)); });
    dailyOut.forEach(d => { d.realized.forEach((_,c) => outCats.add(c)); d.predicted.forEach((_,c) => outCats.add(c)); });

    const rows: FlowRow[] = [];
    let bal = opening;
    const balArr: number[] = [];
    const saldoVals: number[] = [];
    for (let i = 0; i < numDays; i++) { saldoVals.push(bal); balArr.push(bal); bal += dayInTotal(i) - dayOutTotal(i); }
    rows.push({ label: 'SALDO INICIAL', section: 'saldo', isHeader: true, overdueValue: 0, dailyValues: saldoVals });

    const oInT = sumMap(overdueIn);
    rows.push({ label: 'RECEITAS', section: 'receita', isHeader: true, overdueValue: oInT, dailyValues: Array.from({length:numDays},(_,i) => dayInTotal(i)) });
    inCats.forEach(c => rows.push({ label: catName(c), section: 'receita', isHeader: false, overdueValue: overdueIn.get(c)||0, dailyValues: Array.from({length:numDays},(_,i) => dayCatIn(i,c)) }));

    const oOutT = sumMap(overdueOut);
    rows.push({ label: 'DESPESAS', section: 'despesa', isHeader: true, overdueValue: -oOutT, dailyValues: Array.from({length:numDays},(_,i) => -dayOutTotal(i)) });
    outCats.forEach(c => rows.push({ label: catName(c), section: 'despesa', isHeader: false, overdueValue: -(overdueOut.get(c)||0), dailyValues: Array.from({length:numDays},(_,i) => -dayCatOut(i,c)) }));

    rows.push({ label: 'RESULTADO', section: 'resultado', isHeader: true, overdueValue: oInT-oOutT, dailyValues: Array.from({length:numDays},(_,i) => dayInTotal(i)-dayOutTotal(i)) });
    rows.push({ label: 'RESULTADO ACUMULADO', section: 'acumulado', isHeader: true, overdueValue: 0, dailyValues: Array.from({length:numDays},(_,i) => balArr[i]+dayInTotal(i)-dayOutTotal(i)) });
    rows.push({ label: 'LIMITE DISPONÍVEL', section: 'limite', isHeader: true, overdueValue: 0, dailyValues: Array.from({length:numDays},(_,i) => balArr[i]+dayInTotal(i)-dayOutTotal(i)) });

    return rows;
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

  setMode(mode: 'WEEKLY'|'MONTHLY') { this.viewMode.set(mode); }

  previousPeriod() {
    if (this.viewMode() === 'MONTHLY') {
      if (this.currentMonth() === 0) { this.currentMonth.set(11); this.currentYear.update(y=>y-1); }
      else this.currentMonth.update(m=>m-1);
    } else {
      const s = new Date(this.currentWeekStart()); s.setDate(s.getDate()-7); this.currentWeekStart.set(s);
    }
  }

  nextPeriod() {
    if (this.viewMode() === 'MONTHLY') {
      if (this.currentMonth() === 11) { this.currentMonth.set(0); this.currentYear.update(y=>y+1); }
      else this.currentMonth.update(m=>m+1);
    } else {
      const s = new Date(this.currentWeekStart()); s.setDate(s.getDate()+7); this.currentWeekStart.set(s);
    }
  }

  toggleDay(idx: number) {
    const s = new Set(this.expandedDays());
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    this.expandedDays.set(s);
  }

  isDayExpanded(idx: number) { return this.expandedDays().has(idx); }

  private getMonday(d: Date): Date {
    const dt = new Date(d); dt.setHours(0,0,0,0);
    const day = dt.getDay(); const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff); return dt;
  }

  exportExcel(): void {
    const cols = this.dayColumns();
    const rows = this.flowRows();
    const totalCols = cols.length + 2; // Categoria, Atrasados, dias
    
    const aoa: (string | number)[][] = [];
    
    const titleRow: (string | number)[] = [`FLUXO DE CAIXA - ${this.periodLabel()}`];
    for (let i = 1; i < totalCols; i++) titleRow.push('');
    aoa.push(titleRow);
    
    const headerRow: (string | number)[] = ['Categoria', 'Atrasados Hoje'];
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
    for (let i = 0; i < cols.length; i++) colWidths.push({ wch: 14 });
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
