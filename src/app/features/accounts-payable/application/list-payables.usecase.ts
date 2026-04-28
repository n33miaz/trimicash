import { Injectable, inject } from '@angular/core';
import { PAYABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { PayableAccount } from '../domain/entities/payable-account.entity';
import { Period } from '../../../shared/types/period.type';

@Injectable({
  providedIn: 'root'
})
export class ListPayablesUseCase {
  private readonly repository = inject(PAYABLE_REPOSITORY);

  async execute(period?: Period): Promise<PayableAccount[]> {
    return await this.repository.list({ period });
  }
}
