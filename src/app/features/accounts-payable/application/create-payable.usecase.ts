import { Injectable, inject } from '@angular/core';
import { PAYABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { PayableAccount } from '../domain/entities/payable-account.entity';

@Injectable({
  providedIn: 'root'
})
export class CreatePayableUseCase {
  private readonly repository = inject(PAYABLE_REPOSITORY);

  async execute(input: Omit<PayableAccount, 'id'>): Promise<PayableAccount> {
    return await this.repository.create(input);
  }
}
