import type { Movement } from '../../features/cash-flow/domain/entities/movement.entity';
import type { PayableAccount } from '../../features/accounts-payable/domain/entities/payable-account.entity';
import type { Category } from '../../features/categories/domain/category.repository';
import type { DemoUser } from '../../features/auth/domain/auth.types';

export type SeedScenario = 'healthy' | 'risk' | 'blank';

const CAT_IDS = {
  receitas: 'cat-receitas-001',
  fornecedores: 'cat-fornecedores-002',
  impostos: 'cat-impostos-003',
  salarios: 'cat-salarios-004',
  aluguel: 'cat-aluguel-005',
  energia: 'cat-energia-006',
  marketing: 'cat-marketing-007',
  outros: 'cat-outros-008',
} as const;

const RECURRENCE_GROUP_ALUGUEL = 'rg-aluguel-fixo-001';

export const SEED_CATEGORIES: Category[] = [
  { id: CAT_IDS.receitas, name: 'Receitas', color: '#16A34A' },
  { id: CAT_IDS.fornecedores, name: 'Fornecedores', color: '#2F80ED' },
  { id: CAT_IDS.impostos, name: 'Impostos', color: '#DC2626' },
  { id: CAT_IDS.salarios, name: 'Salarios', color: '#7C3AED' },
  { id: CAT_IDS.aluguel, name: 'Aluguel', color: '#0B2F8F' },
  { id: CAT_IDS.energia, name: 'Energia', color: '#F59E0B' },
  { id: CAT_IDS.marketing, name: 'Marketing', color: '#EC4899' },
  { id: CAT_IDS.outros, name: 'Outros', color: '#6B7280' },
];

export const DEMO_USERS: Record<SeedScenario, DemoUser> = {
  healthy: {
    id: 'demo-user-healthy',
    name: 'Carlos Trimi',
    businessName: 'Padaria Trimi',
  },
  risk: {
    id: 'demo-user-risk',
    name: 'Ana Cash',
    businessName: 'Estudio Cash',
  },
  blank: {
    id: 'demo-user-blank',
    name: 'Empreendedor',
    businessName: 'Minha Empresa',
  },
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

export const HEALTHY_MOVEMENTS: Movement[] = [
  { id: 'mov-h-001', type: 'ENTRADA', amount: 12000, date: daysAgo(25), categoryId: CAT_IDS.receitas, description: 'Vendas - semana 1' },
  { id: 'mov-h-002', type: 'ENTRADA', amount: 9500, date: daysAgo(18), categoryId: CAT_IDS.receitas, description: 'Vendas - semana 2' },
  { id: 'mov-h-003', type: 'ENTRADA', amount: 11200, date: daysAgo(11), categoryId: CAT_IDS.receitas, description: 'Vendas - semana 3' },
  { id: 'mov-h-004', type: 'ENTRADA', amount: 8800, date: daysAgo(4), categoryId: CAT_IDS.receitas, description: 'Vendas - semana 4' },
  { id: 'mov-h-005', type: 'SAIDA', amount: 3200, date: daysAgo(27), categoryId: CAT_IDS.fornecedores, description: 'Farinha e insumos - Fornecedores Trimi' },
  { id: 'mov-h-006', type: 'SAIDA', amount: 1800, date: daysAgo(20), categoryId: CAT_IDS.energia, description: 'Conta de energia - Abril' },
  { id: 'mov-h-007', type: 'SAIDA', amount: 4500, date: daysAgo(15), categoryId: CAT_IDS.salarios, description: 'Salario colaborador - Abril' },
  { id: 'mov-h-008', type: 'SAIDA', amount: 980, date: daysAgo(10), categoryId: CAT_IDS.marketing, description: 'Impulsionamento redes sociais' },
  { id: 'mov-h-009', type: 'SAIDA', amount: 560, date: daysAgo(6), categoryId: CAT_IDS.outros, description: 'Material de limpeza e escritorio' },
  { id: 'mov-h-010', type: 'SAIDA', amount: 1200, date: daysAgo(2), categoryId: CAT_IDS.impostos, description: 'DAS Simples Nacional - Abril' },
];

export const HEALTHY_PAYABLES: PayableAccount[] = [
  {
    id: 'pay-h-001',
    description: 'Aluguel - Maio',
    amount: 2800,
    dueDate: daysFromNow(7),
    categoryId: CAT_IDS.aluguel,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
    recurrenceGroupId: RECURRENCE_GROUP_ALUGUEL,
  },
  {
    id: 'pay-h-002',
    description: 'Fornecedores - Farinha e insumos Maio',
    amount: 3200,
    dueDate: daysFromNow(10),
    categoryId: CAT_IDS.fornecedores,
    status: 'PENDENTE',
    recurrence: 'NONE',
  },
  {
    id: 'pay-h-003',
    description: 'Energia - Maio',
    amount: 1800,
    dueDate: daysFromNow(12),
    categoryId: CAT_IDS.energia,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-h-004',
    description: 'Salario colaborador - Maio',
    amount: 4500,
    dueDate: daysFromNow(5),
    categoryId: CAT_IDS.salarios,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-h-005',
    description: 'DAS Simples Nacional - Maio',
    amount: 1200,
    dueDate: daysFromNow(9),
    categoryId: CAT_IDS.impostos,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-h-006',
    description: 'Assinatura sistema PDV',
    amount: 190,
    dueDate: daysFromNow(15),
    categoryId: CAT_IDS.outros,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-h-007',
    description: 'Marketing digital - Maio',
    amount: 980,
    dueDate: daysFromNow(20),
    categoryId: CAT_IDS.marketing,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
];

export const RISK_MOVEMENTS: Movement[] = [
  { id: 'mov-r-001', type: 'ENTRADA', amount: 6500, date: daysAgo(28), categoryId: CAT_IDS.receitas, description: 'Servicos - semana 1' },
  { id: 'mov-r-002', type: 'ENTRADA', amount: 4800, date: daysAgo(21), categoryId: CAT_IDS.receitas, description: 'Servicos - semana 2' },
  { id: 'mov-r-003', type: 'ENTRADA', amount: 3200, date: daysAgo(14), categoryId: CAT_IDS.receitas, description: 'Servicos - semana 3' },
  { id: 'mov-r-004', type: 'ENTRADA', amount: 1900, date: daysAgo(5), categoryId: CAT_IDS.receitas, description: 'Servicos avulsos' },
  { id: 'mov-r-005', type: 'SAIDA', amount: 2800, date: daysAgo(26), categoryId: CAT_IDS.aluguel, description: 'Aluguel - Abril' },
  { id: 'mov-r-006', type: 'SAIDA', amount: 4500, date: daysAgo(19), categoryId: CAT_IDS.salarios, description: 'Salario colaborador - Abril' },
  { id: 'mov-r-007', type: 'SAIDA', amount: 1800, date: daysAgo(12), categoryId: CAT_IDS.energia, description: 'Conta de energia - Abril' },
  { id: 'mov-r-008', type: 'SAIDA', amount: 1200, date: daysAgo(8), categoryId: CAT_IDS.impostos, description: 'DAS Simples Nacional - Abril' },
  { id: 'mov-r-009', type: 'SAIDA', amount: 980, date: daysAgo(3), categoryId: CAT_IDS.outros, description: 'Material grafico e embalagens' },
  { id: 'mov-r-010', type: 'SAIDA', amount: 720, date: daysAgo(1), categoryId: CAT_IDS.fornecedores, description: 'Insumos emergenciais' },
];

export const RISK_PAYABLES: PayableAccount[] = [
  {
    id: 'pay-r-001',
    description: 'Aluguel - Maio',
    amount: 2800,
    dueDate: daysAgo(3),
    categoryId: CAT_IDS.aluguel,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
    recurrenceGroupId: RECURRENCE_GROUP_ALUGUEL,
  },
  {
    id: 'pay-r-002',
    description: 'Salario colaborador - Maio',
    amount: 4500,
    dueDate: daysFromNow(2),
    categoryId: CAT_IDS.salarios,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-r-003',
    description: 'Energia - Maio',
    amount: 1800,
    dueDate: daysFromNow(6),
    categoryId: CAT_IDS.energia,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-r-004',
    description: 'DAS Simples Nacional - Maio',
    amount: 1200,
    dueDate: daysFromNow(9),
    categoryId: CAT_IDS.impostos,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'pay-r-005',
    description: 'Fornecedores - Insumos Maio',
    amount: 2100,
    dueDate: daysFromNow(14),
    categoryId: CAT_IDS.fornecedores,
    status: 'PENDENTE',
    recurrence: 'NONE',
  },
];

export const BLANK_MOVEMENTS: Movement[] = [];
export const BLANK_PAYABLES: PayableAccount[] = [];
export const BLANK_CATEGORIES: Category[] = [
  { id: 'cat-blank-receitas', name: 'Receitas Gerais', color: '#16A34A' },
  { id: 'cat-blank-despesas', name: 'Despesas Gerais', color: '#DC2626' },
  { id: 'cat-blank-operacional', name: 'Operacional', color: '#2F80ED' },
];

import type { ReceivableAccount } from '../../features/accounts-receivable/domain/entities/receivable-account.entity';

export const HEALTHY_RECEIVABLES: ReceivableAccount[] = [
  {
    id: 'rec-h-001',
    description: 'Projeto Alpha - Sinal',
    amount: 5000,
    dueDate: daysFromNow(5),
    categoryId: CAT_IDS.receitas,
    status: 'PENDENTE',
    recurrence: 'NONE',
  },
  {
    id: 'rec-h-002',
    description: 'Manutenção Mensal - Cliente Y',
    amount: 850,
    dueDate: daysFromNow(12),
    categoryId: CAT_IDS.receitas,
    status: 'PENDENTE',
    recurrence: 'MONTHLY',
  },
  {
    id: 'rec-h-003',
    description: 'Consultoria Especializada',
    amount: 1200,
    dueDate: daysAgo(2),
    categoryId: CAT_IDS.receitas,
    status: 'RECEBIDA',
    receivedAt: daysAgo(1),
    recurrence: 'NONE',
  }
];

export const RISK_RECEIVABLES: ReceivableAccount[] = [
  {
    id: 'rec-r-001',
    description: 'Fatura Vencida - Startup Z',
    amount: 3500,
    dueDate: daysAgo(10),
    categoryId: CAT_IDS.receitas,
    status: 'PENDENTE', // o facade irá interpretar como ATRASADA
    recurrence: 'NONE',
  },
  {
    id: 'rec-r-002',
    description: 'Contrato de Risco',
    amount: 1500,
    dueDate: daysFromNow(20),
    categoryId: CAT_IDS.receitas,
    status: 'PENDENTE',
    recurrence: 'NONE',
  }
];

export const BLANK_RECEIVABLES: ReceivableAccount[] = [];

export interface SeedData {
  user: DemoUser;
  categories: Category[];
  movements: Movement[];
  payables: PayableAccount[];
  receivables: ReceivableAccount[];
}

export const SEEDS: Record<SeedScenario, SeedData> = {
  healthy: {
    user: DEMO_USERS.healthy,
    categories: SEED_CATEGORIES,
    movements: HEALTHY_MOVEMENTS,
    payables: HEALTHY_PAYABLES,
    receivables: HEALTHY_RECEIVABLES,
  },
  risk: {
    user: DEMO_USERS.risk,
    categories: SEED_CATEGORIES,
    movements: RISK_MOVEMENTS,
    payables: RISK_PAYABLES,
    receivables: RISK_RECEIVABLES,
  },
  blank: {
    user: DEMO_USERS.blank,
    categories: BLANK_CATEGORIES,
    movements: BLANK_MOVEMENTS,
    payables: BLANK_PAYABLES,
    receivables: BLANK_RECEIVABLES,
  },
};
