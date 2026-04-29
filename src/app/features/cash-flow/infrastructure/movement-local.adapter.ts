import { Injectable } from '@angular/core';
import type { MovementRepository } from '../domain/ports/movement.repository';
import type { Movement } from '../domain/entities/movement.entity';
import type { Period } from '../../../shared/types/period.type';

const STORAGE_KEY = 'trimicash:movements';

type StoredMovement = Omit<Movement, 'date'> & { date: string };

@Injectable({
  providedIn: 'root'
})
export class MovementLocalAdapter implements MovementRepository {
  async list(period?: Period): Promise<Movement[]> {
    await this.delay();
    const movements = this.readStorage();
    
    if (period) {
      return movements.filter(m => m.date >= period.start && m.date <= period.end);
    }
    
    return movements;
  }

  async getById(id: string): Promise<Movement | null> {
    await this.delay();
    const movements = this.readStorage();
    return movements.find(m => m.id === id) || null;
  }

  async create(input: Omit<Movement, 'id'>): Promise<Movement> {
    await this.delay();
    const movements = this.readStorage();
    
    const newMovement: Movement = {
      ...input,
      id: crypto.randomUUID(),
    };
    
    movements.push(newMovement);
    this.writeStorage(movements);
    
    return newMovement;
  }

  async update(id: string, patch: Partial<Movement>): Promise<Movement> {
    await this.delay();
    const movements = this.readStorage();
    const index = movements.findIndex(m => m.id === id);
    
    if (index === -1) {
      throw new Error(`Movement with id ${id} not found`);
    }
    
    const updatedMovement = { ...movements[index], ...patch };
    movements[index] = updatedMovement;
    this.writeStorage(movements);
    
    return updatedMovement;
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    let movements = this.readStorage();
    movements = movements.filter(m => m.id !== id);
    this.writeStorage(movements);
  }

  private readStorage(): Movement[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data) as StoredMovement[];
      return parsed.map((item) => ({
        ...item,
        date: new Date(item.date)
      }));
    } catch {
      return [];
    }
  }

  private writeStorage(movements: Movement[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
  }

  private delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
