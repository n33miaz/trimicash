/**
 * Period types — TrimiCash
 * PeriodKey representa os períodos de filtro disponíveis na UI.
 * Period é o range concreto de datas calculado por `getPeriod()`.
 */

export type PeriodKey =
  | 'CURRENT_MONTH'
  | 'NEXT_7'
  | 'NEXT_15'
  | 'NEXT_30'
  | 'END_OF_MONTH';

export interface Period {
  start: Date;
  end: Date;
  key: PeriodKey;
}
