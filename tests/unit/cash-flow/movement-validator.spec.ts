import { describe, it, expect } from 'vitest';
import { validateMovementInput } from '../../../src/app/features/cash-flow/domain/services/movement-validator';
import { DomainError } from '../../../src/app/features/cash-flow/domain/errors/domain-error';
import { addDays } from 'date-fns';

describe('MovementValidator', () => {
  it('não deve lançar erro para uma entrada válida', () => {
    expect(() => validateMovementInput({
      type: 'ENTRADA',
      amount: 100,
      description: 'Teste',
      categoryId: 'c1',
      date: new Date()
    })).not.toThrow();
  });

  it('deve lançar DomainError se valor <= 0', () => {
    expect(() => validateMovementInput({
      type: 'ENTRADA', amount: 0, description: 'T', categoryId: 'c1', date: new Date()
    })).toThrowError(DomainError);
    
    expect(() => validateMovementInput({
      type: 'ENTRADA', amount: -10, description: 'T', categoryId: 'c1', date: new Date()
    })).toThrowError(/maior que zero/);
  });

  it('deve lançar DomainError para data no futuro', () => {
    const tomorrow = addDays(new Date(), 1);
    expect(() => validateMovementInput({
      type: 'SAIDA', amount: 50, description: 'T', categoryId: 'c1', date: tomorrow
    })).toThrowError(DomainError);
    expect(() => validateMovementInput({
      type: 'SAIDA', amount: 50, description: 'T', categoryId: 'c1', date: tomorrow
    })).toThrowError(/futuro/);
  });
});
