import { Injectable, inject } from '@angular/core';
import { RECEIVABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import type { ReceivableAccount } from '../domain/entities/receivable-account.entity';

@Injectable({ providedIn: 'root' })
export class UpdateReceivableUseCase {
  private readonly repository = inject(RECEIVABLE_REPOSITORY);

  async execute(id: string, patch: Partial<ReceivableAccount>): Promise<ReceivableAccount> {
    return await this.repository.update(id, patch);
  }
}
