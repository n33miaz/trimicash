import { Injectable, inject } from '@angular/core';
import { PAYABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';

@Injectable({
  providedIn: 'root'
})
export class CancelPayableUseCase {
  private readonly repository = inject(PAYABLE_REPOSITORY);

  async execute(id: string): Promise<void> {
    await this.repository.update(id, { status: 'CANCELADA' });
  }
}
