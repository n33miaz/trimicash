import { Injectable, inject } from '@angular/core';
import { RECEIVABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import type { ReceivableAccount } from '../domain/entities/receivable-account.entity';
import type { ReceivableFilter } from '../domain/ports/receivable.repository';

@Injectable({ providedIn: 'root' })
export class ListReceivablesUseCase {
  private readonly repository = inject(RECEIVABLE_REPOSITORY);

  async execute(filter?: ReceivableFilter): Promise<ReceivableAccount[]> {
    return await this.repository.list(filter);
  }
}
