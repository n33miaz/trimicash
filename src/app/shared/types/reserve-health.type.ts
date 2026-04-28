/**
 * ReserveHealth — TrimiCash
 * Estado de saúde da reserva financeira (RN-007).
 *
 * HEALTHY   → Saldo cobre a reserva com margem
 * ATTENTION → Saldo cobre a reserva, mas com pouca folga (≤ 20% acima)
 * DEFICIT   → Saldo menor que a reserva recomendada
 */
export type ReserveHealth = 'HEALTHY' | 'ATTENTION' | 'DEFICIT';
