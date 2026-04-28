import { Injectable, inject } from '@angular/core';
import { MOVEMENT_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { Movement } from '../domain/entities/movement.entity';

@Injectable({
  providedIn: 'root'
})
export class CreateMovementUseCase {
  private readonly repository = inject(MOVEMENT_REPOSITORY);

  async execute(input: Omit<Movement, 'id'>): Promise<Movement> {
    return await this.repository.create(input);
  }
}
