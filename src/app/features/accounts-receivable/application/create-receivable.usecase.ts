import { Injectable, inject } from '@angular/core';
import { RECEIVABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import type { ReceivableAccount } from '../domain/entities/receivable-account.entity';

@Injectable({ providedIn: 'root' })
export class CreateReceivableUseCase {
  private readonly repository = inject(RECEIVABLE_REPOSITORY);

  async execute(input: Omit<ReceivableAccount, 'id'>): Promise<ReceivableAccount> {
    return await this.repository.create(input);
  }
}
