import { Injectable, inject } from '@angular/core';
import { MOVEMENT_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { Movement } from '../domain/entities/movement.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateMovementUseCase {
  private readonly repository = inject(MOVEMENT_REPOSITORY);

  async execute(id: string, patch: Partial<Movement>): Promise<Movement> {
    return await this.repository.update(id, patch);
  }
}
