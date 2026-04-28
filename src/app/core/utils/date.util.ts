/**
 * date.util.ts — TrimiCash
 * Utilitários de data usando date-fns.
 * TypeScript puro, sem dependências Angular.
 */

import {
  differenceInCalendarDays,
  endOfMonth,
  startOfMonth,
  startOfDay,
  addDays,
  isAfter,
  isBefore,
  isValid,
} from 'date-fns';
import type { Period, PeriodKey } from '../../shared/types/period.type';

/**
 * Retorna a diferença em dias inteiros entre duas datas.
 * Positivo se `b` é posterior a `a`.
 */
export function daysBetween(a: Date, b: Date): number {
  return differenceInCalendarDays(b, a);
}

/**
 * Retorna `true` se a data `date` está antes da data de referência `ref`.
 * Usado para verificar contas atrasadas (RN-002.3).
 * Por padrão, `ref` é hoje.
 */
export function isOverdue(date: Date, ref: Date = new Date()): boolean {
  if (!isValid(date)) return false;
  return isBefore(startOfDay(date), startOfDay(ref));
}

/**
 * Calcula o range concreto de datas para um PeriodKey.
 * @param key — chave do período
 * @param ref — data de referência (default: hoje)
 */
export function getPeriod(key: PeriodKey, ref: Date = new Date()): Period {
  const today = startOfDay(ref);

  switch (key) {
    case 'CURRENT_MONTH':
      return {
        key,
        start: startOfMonth(today),
        end: endOfMonth(today),
      };

    case 'NEXT_7':
      return {
        key,
        start: today,
        end: addDays(today, 7),
      };

    case 'NEXT_15':
      return {
        key,
        start: today,
        end: addDays(today, 15),
      };

    case 'NEXT_30':
      return {
        key,
        start: today,
        end: addDays(today, 30),
      };

    case 'END_OF_MONTH':
      return {
        key,
        start: today,
        end: endOfMonth(today),
      };

    default: {
      const _exhaustive: never = key;
      throw new Error(`PeriodKey desconhecido: ${_exhaustive}`);
    }
  }
}

/**
 * Verifica se uma data está dentro de um Period (inclusive).
 */
export function isWithinPeriod(date: Date, period: Period): boolean {
  const d = startOfDay(date);
  return !isBefore(d, period.start) && !isAfter(d, period.end);
}
