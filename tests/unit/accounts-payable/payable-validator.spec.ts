import { describe, it, expect } from 'vitest';
import { validatePayableInput } from '../../../src/app/features/accounts-payable/domain/services/payable-validator';
import { DomainError } from '../../../src/app/features/accounts-payable/domain/errors/domain-error';

describe('PayableValidator', () => {
  it('não deve lançar erro para input válido', () => {
    expect(() => validatePayableInput({
      description: 'Conta de Luz',
      amount: 150.50,
      dueDate: new Date(),
      recurrence: 'MONTHLY'
    })).not.toThrow();
  });

  it('deve lançar erro para descrição vazia', () => {
    expect(() => validatePayableInput({
      description: '   ',
      amount: 150.50,
      dueDate: new Date(),
      recurrence: 'NONE'
    })).toThrowError(DomainError);
  });

  it('deve lançar erro para valor <= 0', () => {
    expect(() => validatePayableInput({
      description: 'Conta',
      amount: 0,
      dueDate: new Date(),
      recurrence: 'NONE'
    })).toThrowError(DomainError);

    expect(() => validatePayableInput({
      description: 'Conta',
      amount: -10,
      dueDate: new Date(),
      recurrence: 'NONE'
    })).toThrowError(DomainError);
  });

  it('deve lançar erro para data inválida', () => {
    expect(() => validatePayableInput({
      description: 'Conta',
      amount: 100,
      dueDate: new Date('invalid'),
      recurrence: 'NONE'
    })).toThrowError(DomainError);
  });

  it('deve lançar erro para recorrência inválida', () => {
    expect(() => validatePayableInput({
      description: 'Conta',
      amount: 100,
      dueDate: new Date(),
      recurrence: 'DAILY' as any
    })).toThrowError(DomainError);
  });
});
