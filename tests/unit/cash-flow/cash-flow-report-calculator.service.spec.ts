import { describe, expect, it } from 'vitest';
import {
  CashFlowReportCalculatorService,
  DayColumn,
} from '../../../src/app/features/cash-flow/application/cash-flow-report-calculator.service';
import { Category } from '../../../src/app/features/categories/domain/category.repository';
import { Movement } from '../../../src/app/features/cash-flow/domain/entities/movement.entity';
import { PayableAccount } from '../../../src/app/features/accounts-payable/domain/entities/payable-account.entity';
import { ReceivableAccount } from '../../../src/app/features/accounts-receivable/domain/entities/receivable-account.entity';

describe('CashFlowReportCalculatorService', () => {
  const service = new CashFlowReportCalculatorService();
  const day = new Date(2026, 4, 11, 12);
  const columns: DayColumn[] = [{ date: day, label: 'Seg, 11/05' }];
  const categories: Category[] = [
    { id: 'sales', name: 'Receitas', color: '#16A34A' },
    { id: 'suppliers', name: 'Fornecedores', color: '#2F80ED' },
  ];

  it('separa movimentações realizadas da linha projetada', () => {
    const movements: Movement[] = [
      { id: 'opening', type: 'ENTRADA', amount: 1000, date: new Date(2026, 4, 10, 12), categoryId: 'sales', description: 'Saldo anterior' },
      { id: 'sale', type: 'ENTRADA', amount: 200, date: day, categoryId: 'sales', description: 'Venda do dia' },
      { id: 'expense', type: 'SAIDA', amount: 50, date: day, categoryId: 'suppliers', description: 'Compra do dia' },
    ];
    const receivables: ReceivableAccount[] = [
      { id: 'rec', description: 'Recebimento previsto', amount: 300, dueDate: day, categoryId: 'sales', status: 'PENDENTE', recurrence: 'NONE' },
    ];
    const payables: PayableAccount[] = [
      { id: 'pay', description: 'Pagamento previsto', amount: 120, dueDate: day, categoryId: 'suppliers', status: 'PENDENTE', recurrence: 'NONE' },
    ];

    const snapshot = service.build({ columns, movements, payables, receivables, categories });
    const receita = snapshot.rows.find(row => row.label === 'RECEITAS');
    const despesa = snapshot.rows.find(row => row.label === 'DESPESAS');
    const projetado = snapshot.rows.find(row => row.label === 'PROJETADO');
    const resultado = snapshot.rows.find(row => row.label === 'RESULTADO');
    const acumulado = snapshot.rows.find(row => row.label === 'RESULTADO ACUMULADO');
    const limite = snapshot.rows.find(row => row.label === 'LIMITE DISPONÍVEL');

    expect(receita?.dailyValues[0]).toBe(200);
    expect(despesa?.dailyValues[0]).toBe(-50);
    expect(projetado?.dailyValues[0]).toBe(180);
    expect(resultado?.dailyValues[0]).toBe(150);
    expect(acumulado?.dailyValues[0]).toBe(1150);
    expect(limite?.dailyValues[0]).toBe(1330);
    expect(snapshot.dailySummary.movementCount).toBe(2);
    expect(snapshot.dailySummary.projectedCount).toBe(2);
  });

  it('mantém pendências anteriores apenas na linha projetada', () => {
    const yesterday = new Date(2026, 4, 10, 12);
    const receivables: ReceivableAccount[] = [
      { id: 'late-rec', description: 'Receita atrasada', amount: 30, dueDate: yesterday, categoryId: 'sales', status: 'ATRASADA', recurrence: 'NONE' },
    ];
    const payables: PayableAccount[] = [
      { id: 'late-pay', description: 'Conta atrasada', amount: 80, dueDate: yesterday, categoryId: 'suppliers', status: 'ATRASADA', recurrence: 'NONE' },
    ];

    const snapshot = service.build({
      columns,
      movements: [],
      payables,
      receivables,
      categories,
    });

    expect(snapshot.rows.find(row => row.label === 'RECEITAS')?.overdueValue).toBe(0);
    expect(snapshot.rows.find(row => row.label === 'DESPESAS')?.overdueValue).toBe(0);
    expect(snapshot.rows.find(row => row.label === 'PROJETADO')?.overdueValue).toBe(-50);
    expect(snapshot.dailySummary.overdueProjectedResult).toBe(-50);
  });
});
