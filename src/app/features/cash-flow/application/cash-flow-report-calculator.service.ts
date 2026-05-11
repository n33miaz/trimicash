import type { Category } from '../../categories/domain/category.repository';
import type { PayableAccount } from '../../accounts-payable/domain/entities/payable-account.entity';
import type { ReceivableAccount } from '../../accounts-receivable/domain/entities/receivable-account.entity';
import type { Movement } from '../domain/entities/movement.entity';

export type CashFlowReportViewMode = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type FlowSection =
  | 'saldo'
  | 'receita'
  | 'despesa'
  | 'projetado'
  | 'resultado'
  | 'acumulado'
  | 'limite';

export interface DayColumn {
  date: Date;
  label: string;
}

export interface FlowRow {
  label: string;
  section: FlowSection;
  isHeader: boolean;
  overdueValue: number;
  dailyValues: number[];
}

export interface DailyReportItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  direction: 'in' | 'out';
  source: 'movement' | 'projected';
  status?: string;
}

export interface DailySummary {
  date: Date;
  dateLabel: string;
  openingBalance: number;
  realizedInflow: number;
  realizedOutflow: number;
  realizedResult: number;
  projectedInflow: number;
  projectedOutflow: number;
  projectedResult: number;
  closingBalance: number;
  projectedClosingBalance: number;
  overdueInflow: number;
  overdueOutflow: number;
  overdueProjectedResult: number;
  movementCount: number;
  projectedCount: number;
  movementItems: DailyReportItem[];
  projectedItems: DailyReportItem[];
}

export interface CashFlowReportSnapshot {
  rows: FlowRow[];
  dailySummary: DailySummary;
}

interface BuildReportInput {
  columns: DayColumn[];
  movements: Movement[];
  payables: PayableAccount[];
  receivables: ReceivableAccount[];
  categories: Category[];
}

interface DayBuckets {
  realizedIn: Map<string, number>;
  realizedOut: Map<string, number>;
  projectedIn: Map<string, number>;
  projectedOut: Map<string, number>;
  movementItems: DailyReportItem[];
  projectedItems: DailyReportItem[];
}

export class CashFlowReportCalculatorService {
  build(input: BuildReportInput): CashFlowReportSnapshot {
    const columns = input.columns;
    const emptySummary = this.emptyDailySummary(columns[0]?.date ?? new Date());

    if (!columns.length) {
      return { rows: [], dailySummary: emptySummary };
    }

    const startDate = this.startOfDay(columns[0].date);
    const numDays = columns.length;
    const cats = input.categories;
    const catName = (id: string) => cats.find(c => c.id === id)?.name ?? 'Sem Categoria';
    const buckets = Array.from({ length: numDays }, () => this.createDayBuckets());
    const overdueIn = new Map<string, number>();
    const overdueOut = new Map<string, number>();

    const dayIndex = (date: Date) => {
      const diff = this.dayKey(date) - this.dayKey(startDate);
      return diff >= 0 && diff < numDays ? diff : -1;
    };

    input.movements.forEach(movement => {
      const idx = dayIndex(movement.date);
      if (idx < 0) return;

      const bucket = buckets[idx];
      const target = movement.type === 'ENTRADA' ? bucket.realizedIn : bucket.realizedOut;
      target.set(movement.categoryId, (target.get(movement.categoryId) ?? 0) + movement.amount);
      bucket.movementItems.push({
        id: movement.id,
        description: movement.description,
        category: catName(movement.categoryId),
        amount: movement.amount,
        direction: movement.type === 'ENTRADA' ? 'in' : 'out',
        source: 'movement',
      });
    });

    input.receivables
      .filter(receivable => receivable.status === 'PENDENTE' || receivable.status === 'ATRASADA')
      .forEach(receivable => {
        if (this.dayKey(receivable.dueDate) < this.dayKey(startDate)) {
          if (receivable.status === 'ATRASADA') {
            overdueIn.set(receivable.categoryId, (overdueIn.get(receivable.categoryId) ?? 0) + receivable.amount);
          }
          return;
        }

        const idx = dayIndex(receivable.dueDate);
        if (idx < 0) return;

        const bucket = buckets[idx];
        bucket.projectedIn.set(
          receivable.categoryId,
          (bucket.projectedIn.get(receivable.categoryId) ?? 0) + receivable.amount
        );
        bucket.projectedItems.push({
          id: receivable.id,
          description: receivable.description,
          category: catName(receivable.categoryId),
          amount: receivable.amount,
          direction: 'in',
          source: 'projected',
          status: receivable.status,
        });
      });

    input.payables
      .filter(payable => payable.status === 'PENDENTE' || payable.status === 'ATRASADA')
      .forEach(payable => {
        if (this.dayKey(payable.dueDate) < this.dayKey(startDate)) {
          if (payable.status === 'ATRASADA') {
            overdueOut.set(payable.categoryId, (overdueOut.get(payable.categoryId) ?? 0) + payable.amount);
          }
          return;
        }

        const idx = dayIndex(payable.dueDate);
        if (idx < 0) return;

        const bucket = buckets[idx];
        bucket.projectedOut.set(
          payable.categoryId,
          (bucket.projectedOut.get(payable.categoryId) ?? 0) + payable.amount
        );
        bucket.projectedItems.push({
          id: payable.id,
          description: payable.description,
          category: catName(payable.categoryId),
          amount: payable.amount,
          direction: 'out',
          source: 'projected',
          status: payable.status,
        });
      });

    const realizedInTotal = (i: number) => this.sumMap(buckets[i].realizedIn);
    const realizedOutTotal = (i: number) => this.sumMap(buckets[i].realizedOut);
    const projectedInTotal = (i: number) => this.sumMap(buckets[i].projectedIn);
    const projectedOutTotal = (i: number) => this.sumMap(buckets[i].projectedOut);
    const projectedNet = (i: number) => projectedInTotal(i) - projectedOutTotal(i);
    const realizedNet = (i: number) => realizedInTotal(i) - realizedOutTotal(i);

    const opening = input.movements
      .filter(movement => this.dayKey(movement.date) < this.dayKey(startDate))
      .reduce((acc, movement) => acc + (movement.type === 'ENTRADA' ? movement.amount : -movement.amount), 0);

    const openingBalances: number[] = [];
    const realizedClosingBalances: number[] = [];
    const projectedClosingBalances: number[] = [];
    let realizedBalance = opening;
    let projectedBalance = opening;

    for (let i = 0; i < numDays; i++) {
      openingBalances.push(realizedBalance);
      realizedBalance += realizedNet(i);
      projectedBalance += realizedNet(i) + projectedNet(i);
      realizedClosingBalances.push(realizedBalance);
      projectedClosingBalances.push(projectedBalance);
    }

    const inCats = new Set<string>();
    const outCats = new Set<string>();
    buckets.forEach(bucket => {
      bucket.realizedIn.forEach((_, categoryId) => inCats.add(categoryId));
      bucket.realizedOut.forEach((_, categoryId) => outCats.add(categoryId));
    });

    const rows: FlowRow[] = [
      {
        label: 'SALDO INICIAL',
        section: 'saldo',
        isHeader: true,
        overdueValue: 0,
        dailyValues: openingBalances,
      },
      {
        label: 'RECEITAS',
        section: 'receita',
        isHeader: true,
        overdueValue: 0,
        dailyValues: Array.from({ length: numDays }, (_, i) => realizedInTotal(i)),
      },
    ];

    inCats.forEach(categoryId => rows.push({
      label: catName(categoryId),
      section: 'receita',
      isHeader: false,
      overdueValue: 0,
      dailyValues: Array.from({ length: numDays }, (_, i) => buckets[i].realizedIn.get(categoryId) ?? 0),
    }));

    rows.push({
      label: 'DESPESAS',
      section: 'despesa',
      isHeader: true,
      overdueValue: 0,
      dailyValues: Array.from({ length: numDays }, (_, i) => -realizedOutTotal(i)),
    });

    outCats.forEach(categoryId => rows.push({
      label: catName(categoryId),
      section: 'despesa',
      isHeader: false,
      overdueValue: 0,
      dailyValues: Array.from({ length: numDays }, (_, i) => -(buckets[i].realizedOut.get(categoryId) ?? 0)),
    }));

    const overdueProjectedResult = this.sumMap(overdueIn) - this.sumMap(overdueOut);
    rows.push({
      label: 'PROJETADO',
      section: 'projetado',
      isHeader: true,
      overdueValue: overdueProjectedResult,
      dailyValues: Array.from({ length: numDays }, (_, i) => projectedNet(i)),
    });
    rows.push({
      label: 'RESULTADO',
      section: 'resultado',
      isHeader: true,
      overdueValue: 0,
      dailyValues: Array.from({ length: numDays }, (_, i) => realizedNet(i)),
    });
    rows.push({
      label: 'RESULTADO ACUMULADO',
      section: 'acumulado',
      isHeader: true,
      overdueValue: 0,
      dailyValues: realizedClosingBalances,
    });
    rows.push({
      label: 'LIMITE DISPONÍVEL',
      section: 'limite',
      isHeader: true,
      overdueValue: overdueProjectedResult,
      dailyValues: projectedClosingBalances,
    });

    return {
      rows,
      dailySummary: this.buildDailySummary({
        date: columns[0].date,
        openingBalance: openingBalances[0] ?? 0,
        realizedInflow: realizedInTotal(0),
        realizedOutflow: realizedOutTotal(0),
        projectedInflow: projectedInTotal(0),
        projectedOutflow: projectedOutTotal(0),
        closingBalance: realizedClosingBalances[0] ?? opening,
        projectedClosingBalance: projectedClosingBalances[0] ?? opening,
        overdueInflow: this.sumMap(overdueIn),
        overdueOutflow: this.sumMap(overdueOut),
        overdueProjectedResult,
        movementItems: this.sortItems(buckets[0].movementItems),
        projectedItems: this.sortItems(buckets[0].projectedItems),
      }),
    };
  }

  private buildDailySummary(input: {
    date: Date;
    openingBalance: number;
    realizedInflow: number;
    realizedOutflow: number;
    projectedInflow: number;
    projectedOutflow: number;
    closingBalance: number;
    projectedClosingBalance: number;
    overdueInflow: number;
    overdueOutflow: number;
    overdueProjectedResult: number;
    movementItems: DailyReportItem[];
    projectedItems: DailyReportItem[];
  }): DailySummary {
    const realizedResult = input.realizedInflow - input.realizedOutflow;
    const projectedResult = input.projectedInflow - input.projectedOutflow;

    return {
      date: input.date,
      dateLabel: this.formatDailyLabel(input.date),
      openingBalance: input.openingBalance,
      realizedInflow: input.realizedInflow,
      realizedOutflow: input.realizedOutflow,
      realizedResult,
      projectedInflow: input.projectedInflow,
      projectedOutflow: input.projectedOutflow,
      projectedResult,
      closingBalance: input.closingBalance,
      projectedClosingBalance: input.projectedClosingBalance,
      overdueInflow: input.overdueInflow,
      overdueOutflow: input.overdueOutflow,
      overdueProjectedResult: input.overdueProjectedResult,
      movementCount: input.movementItems.length,
      projectedCount: input.projectedItems.length,
      movementItems: input.movementItems,
      projectedItems: input.projectedItems,
    };
  }

  private emptyDailySummary(date: Date): DailySummary {
    return this.buildDailySummary({
      date,
      openingBalance: 0,
      realizedInflow: 0,
      realizedOutflow: 0,
      projectedInflow: 0,
      projectedOutflow: 0,
      closingBalance: 0,
      projectedClosingBalance: 0,
      overdueInflow: 0,
      overdueOutflow: 0,
      overdueProjectedResult: 0,
      movementItems: [],
      projectedItems: [],
    });
  }

  private createDayBuckets(): DayBuckets {
    return {
      realizedIn: new Map<string, number>(),
      realizedOut: new Map<string, number>(),
      projectedIn: new Map<string, number>(),
      projectedOut: new Map<string, number>(),
      movementItems: [],
      projectedItems: [],
    };
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private dayKey(date: Date): number {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  }

  private sumMap(map: Map<string, number>): number {
    let total = 0;
    map.forEach(value => { total += value; });
    return total;
  }

  private sortItems(items: DailyReportItem[]): DailyReportItem[] {
    return [...items].sort((a, b) => {
      if (a.direction !== b.direction) return a.direction === 'out' ? -1 : 1;
      return b.amount - a.amount;
    });
  }

  private formatDailyLabel(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
