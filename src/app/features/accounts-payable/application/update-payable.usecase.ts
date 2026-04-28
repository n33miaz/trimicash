import { Injectable, inject } from '@angular/core';
import { PAYABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { PayableAccount } from '../domain/entities/payable-account.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdatePayableUseCase {
  private readonly repository = inject(PAYABLE_REPOSITORY);

  async execute(id: string, patch: Partial<PayableAccount>): Promise<PayableAccount> {
    return await this.repository.update(id, patch);
  }
}
