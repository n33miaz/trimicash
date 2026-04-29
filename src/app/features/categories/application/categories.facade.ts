import { Injectable, inject, signal } from '@angular/core';
import { CATEGORY_REPOSITORY } from '../../../core/tokens/injection-tokens';
import { Category } from '../domain/category.repository';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesFacade {
  private readonly repository = inject(CATEGORY_REPOSITORY);

  // State
  private _categories = signal<Category[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public API
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const data = await this.repository.list();
      this._categories.set(data);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao carregar categorias'));
    } finally {
      this._loading.set(false);
    }
  }

  async create(input: Omit<Category, 'id'>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const created = await this.repository.create(input);
      this._categories.update(c => [...c, created]);
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao criar categoria'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: string, patch: Partial<Category>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const updated = await this.repository.update(id, patch);
      this._categories.update(c => c.map(item => item.id === id ? updated : item));
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao atualizar categoria'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.repository.remove(id);
      this._categories.update(c => c.filter(item => item.id !== id));
    } catch (err: unknown) {
      this._error.set(errorMessage(err, 'Erro ao excluir categoria'));
      throw err;
    } finally {
      this._loading.set(false);
    }
  }
}
