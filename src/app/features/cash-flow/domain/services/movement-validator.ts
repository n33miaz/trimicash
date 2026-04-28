/**
 * movement-validator.ts — TrimiCash
 * Validador de domínio para criação e edição de movimentações.
 */

import { Movement } from '../entities/movement.entity';
import { DomainError } from '../errors/domain-error';
import { isAfter, startOfDay } from 'date-fns';

export function validateMovementInput(input: Partial<Movement>): void {
  if (input.amount == null || input.amount <= 0) {
    throw new DomainError('INVALID_AMOUNT', 'O valor da movimentação deve ser maior que zero.');
  }

  if (input.type !== 'ENTRADA' && input.type !== 'SAIDA') {
    throw new DomainError('INVALID_TYPE', 'O tipo da movimentação deve ser ENTRADA ou SAIDA.');
  }

  if (!input.description || input.description.trim() === '') {
    throw new DomainError('INVALID_DESCRIPTION', 'A descrição da movimentação é obrigatória.');
  }

  if (!input.categoryId || input.categoryId.trim() === '') {
    throw new DomainError('INVALID_CATEGORY', 'A categoria da movimentação é obrigatória.');
  }

  if (!input.date || isNaN(new Date(input.date).getTime())) {
    throw new DomainError('INVALID_DATE', 'Data da movimentação inválida.');
  }

  // RN-001.4: movimentação é algo que já aconteceu
  const today = startOfDay(new Date());
  const movementDate = startOfDay(new Date(input.date));
  if (isAfter(movementDate, today)) {
    throw new DomainError('FUTURE_DATE', 'A data da movimentação não pode estar no futuro.');
  }
}
