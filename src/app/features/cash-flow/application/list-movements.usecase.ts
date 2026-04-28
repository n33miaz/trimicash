import { Injectable, inject } from '@angular/core';
import { MOVEMENT_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { Movement } from '../domain/entities/movement.entity';
import { Period } from '../../../shared/types/period.type';

@Injectable({
  providedIn: 'root'
})
export class ListMovementsUseCase {
  private readonly repository = inject(MOVEMENT_REPOSITORY);

  async execute(period?: Period): Promise<Movement[]> {
    return await this.repository.list(period);
  }
}
