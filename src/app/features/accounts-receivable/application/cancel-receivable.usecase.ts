import { Injectable, inject } from '@angular/core';
import { RECEIVABLE_REPOSITORY } from '../../../core/tokens/injection-tokens';

@Injectable({ providedIn: 'root' })
export class CancelReceivableUseCase {
  private readonly repository = inject(RECEIVABLE_REPOSITORY);

  async execute(id: string): Promise<void> {
    await this.repository.update(id, { status: 'CANCELADA' });
  }
}
