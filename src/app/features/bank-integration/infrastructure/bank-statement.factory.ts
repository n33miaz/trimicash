/**
 * bank-statement.factory.ts — TrimiCash
 * Gera extratos e contas fictícios de forma DETERMINÍSTICA por banco.
 *
 * Por que determinístico: cada instituição sempre produz o mesmo extrato,
 * então a demo fica estável entre reloads e fica claro que os dados são
 * fixos/mockados (e não aleatórios a cada clique).
 *
 * Cada conta tem um extrato ÚNICO: a seed deriva do bankId e as contrapartes
 * (pessoas, fornecedores, lojas, contas) são sorteadas de pools amplos, então
 * dois bancos dificilmente repetem os mesmos lançamentos. TypeScript puro.
 */

import type { BankAccount, BankAccountKind } from '../domain/entities/bank.entity';
import type {
  BankConnection,
  BankTransaction,
  BankTransactionChannel,
  BankTransactionType,
} from '../domain/entities/bank-transaction.entity';
import { roundCurrency } from '@core/utils/money.util';

/** PRNG determinístico (mulberry32) a partir de uma seed inteira. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash estável de string → inteiro (para seed por banco). */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Sorteia um item de um array. */
function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ─── Pools de contrapartes (ampliam a variedade entre contas) ───────────────
const PEOPLE = [
  'Maria Oliveira', 'João Pereira', 'Ana Souza', 'Carlos Lima', 'Fernanda Costa',
  'Pedro Alves', 'Juliana Rocha', 'Rafael Mendes', 'Beatriz Nunes', 'Lucas Martins',
  'Camila Dias', 'Bruno Carvalho', 'Patrícia Gomes', 'Thiago Ramos', 'Larissa Pinto',
  'Gustavo Teixeira', 'Vanessa Moreira', 'Diego Fernandes',
] as const;

const PIX_IN_FROM = [
  ...PEOPLE, 'Cliente da loja', 'Venda no balcão', 'Recebimento de pedido', 'Cliente PJ',
] as const;

const SUPPLIERS = [
  'Atacadão Central', 'Distribuidora União', 'Embalagens Pró', 'Comercial Sul',
  'Fornecedora Prime', 'Atacado Boa Compra', 'Distribuidora Aurora', 'Insumos Brasil',
] as const;

const MERCHANTS = [
  'Posto Ipiranga', 'Mercado São Jorge', 'Papelaria Central', 'Farmácia Pop',
  'Restaurante do Zé', 'Padaria Trigo Real', 'Auto Posto Avenida', 'Supermercado Dia a Dia',
  'Lanchonete Sabor', 'Loja do Empreendedor',
] as const;

const BILLERS = [
  'Energia elétrica', 'Internet / Telefonia', 'Água e esgoto', 'Aluguel comercial',
  'Plano de saúde', 'Honorários do contador', 'Sistema de gestão (SaaS)', 'Fornecedor de embalagens',
] as const;

interface ChannelTemplate {
  channel: BankTransactionChannel;
  type: BankTransactionType;
  /** Faixa de valor [min, max]. */
  range: [number, number];
  /** Peso relativo de ocorrência. */
  weight: number;
  /** Gera a descrição do lançamento sorteando contrapartes. */
  describe: (rand: () => number) => string;
}

const TEMPLATES: ChannelTemplate[] = [
  { channel: 'PIX', type: 'CREDITO', weight: 5, range: [60, 2200],
    describe: (r) => `Pix recebido - ${pick(r, PIX_IN_FROM)}` },
  { channel: 'PIX', type: 'DEBITO', weight: 5, range: [20, 1100],
    describe: (r) => `Pix enviado - ${pick(r, r() > 0.5 ? SUPPLIERS : PEOPLE)}` },
  { channel: 'CARTAO', type: 'DEBITO', weight: 4, range: [15, 620],
    describe: (r) => `Compra no débito - ${pick(r, MERCHANTS)}` },
  { channel: 'BOLETO', type: 'DEBITO', weight: 3, range: [110, 1800],
    describe: (r) => `Pagamento de boleto - ${pick(r, BILLERS)}` },
  { channel: 'TED', type: 'CREDITO', weight: 2, range: [800, 5800],
    describe: (r) => `TED recebida - ${pick(r, ['Contrato PJ', 'Adiantamento de cliente', 'Repasse de parceria', 'Pagamento de nota fiscal'] as const)}` },
  { channel: 'SALARIO', type: 'DEBITO', weight: 1, range: [1300, 2500],
    describe: (r) => pick(r, ['Pagamento de salário - Folha', 'Pró-labore', 'Adiantamento de salário'] as const) },
  { channel: 'TARIFA', type: 'DEBITO', weight: 2, range: [8, 60],
    describe: (r) => pick(r, ['Tarifa de pacote de serviços', 'Tarifa de manutenção de conta', 'Tarifa DOC/TED'] as const) },
  { channel: 'RENDIMENTO', type: 'CREDITO', weight: 1, range: [2, 160],
    describe: (r) => pick(r, ['Rendimento de conta remunerada', 'Rendimento CDB liquidez diária', 'Rendimento de aplicação'] as const) },
];

const ACCOUNT_KINDS: Record<string, BankAccountKind> = {
  mercadopago: 'PAGAMENTOS',
  btg: 'INVESTIMENTO',
};

/** Sorteia um template respeitando os pesos. */
function pickWeighted(rand: () => number, templates: ChannelTemplate[]): ChannelTemplate {
  const total = templates.reduce((acc, t) => acc + t.weight, 0);
  let roll = rand() * total;
  for (const t of templates) {
    roll -= t.weight;
    if (roll <= 0) return t;
  }
  return templates[templates.length - 1];
}

function buildId(rand: () => number): string {
  // UUID-like determinístico (suficiente para chave de lista da demo).
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 32; i++) {
    out += hex[Math.floor(rand() * 16)];
    if (i === 7 || i === 11 || i === 15 || i === 19) out += '-';
  }
  return out;
}

/**
 * Gera o extrato determinístico (e único) de um banco.
 * @param bankId — usado como seed estável.
 * @param now — data de referência (default: hoje).
 */
export function buildTransactions(bankId: string, now: Date = new Date()): BankTransaction[] {
  const rand = mulberry32(hashSeed(bankId));
  const count = 12 + Math.floor(rand() * 8); // 12..19 lançamentos
  const txs: BankTransaction[] = [];

  let dayCursor = 0;
  let lastDescription = '';
  for (let i = 0; i < count; i++) {
    // Avança de 0 a 3 dias entre lançamentos, partindo de hoje para trás.
    dayCursor += Math.floor(rand() * 3);
    const date = new Date(now);
    date.setDate(date.getDate() - dayCursor);
    date.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0);

    const tpl = pickWeighted(rand, TEMPLATES);
    const [min, max] = tpl.range;
    const amount = roundCurrency(min + rand() * (max - min));

    // Evita descrição repetida em sequência (mantém o extrato natural e único).
    let description = tpl.describe(rand);
    for (let attempt = 0; attempt < 4 && description === lastDescription; attempt++) {
      description = tpl.describe(rand);
    }
    lastDescription = description;

    txs.push({
      id: buildId(rand),
      bankId,
      date,
      description,
      type: tpl.type,
      amount,
      channel: tpl.channel,
    });
  }

  // Mais recente primeiro.
  return txs.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Gera os dados da conta (agência/número/saldo) de forma determinística. */
export function buildAccount(bankId: string, transactions: BankTransaction[]): BankAccount {
  const rand = mulberry32(hashSeed(bankId) ^ 0x9e3779b9);
  const agency = String(1 + Math.floor(rand() * 4999)).padStart(4, '0');
  const number = `${String(10000 + Math.floor(rand() * 89999))}-${Math.floor(rand() * 10)}`;
  // Saldos de pequeno negócio (reduzidos): ~ R$ 750 a R$ 13.250.
  const balance = roundCurrency(750 + rand() * 12500);
  const kind = ACCOUNT_KINDS[bankId] ?? (rand() > 0.8 ? 'POUPANCA' : 'CORRENTE');

  // O extrato não altera o saldo nesta demo (saldo é o valor atual da conta).
  void transactions;

  return { agency, number, kind, balance };
}

/** Monta uma conexão completa (conta + extrato) pronta para persistir. */
export function buildConnection(
  connectionId: string,
  bankId: string,
  now: Date = new Date()
): BankConnection {
  const transactions = buildTransactions(bankId, now);
  const account = buildAccount(bankId, transactions);
  return {
    id: connectionId,
    bankId,
    account,
    connectedAt: now,
    lastSyncAt: now,
    transactions,
  };
}
