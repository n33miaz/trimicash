import { Injectable, inject } from '@angular/core';
import { MOVEMENT_REPOSITORY } from '../../../core/tokens/injection-tokens';

@Injectable({
  providedIn: 'root'
})
export class DeleteMovementUseCase {
  private readonly repository = inject(MOVEMENT_REPOSITORY);

  async execute(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
