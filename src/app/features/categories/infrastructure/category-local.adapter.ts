import { Injectable } from '@angular/core';
import type { CategoryRepository, Category } from '../domain/category.repository';

const STORAGE_KEY = 'trimicash:categories';

@Injectable({
  providedIn: 'root'
})
export class CategoryLocalAdapter implements CategoryRepository {
  async list(): Promise<Category[]> {
    await this.delay();
    return this.readStorage();
  }

  async create(input: Omit<Category, 'id'>): Promise<Category> {
    await this.delay();
    const categories = this.readStorage();
    
    const newCategory: Category = {
      ...input,
      id: crypto.randomUUID(),
    };
    
    categories.push(newCategory);
    this.writeStorage(categories);
    
    return newCategory;
  }

  async update(id: string, patch: Partial<Category>): Promise<Category> {
    await this.delay();
    const categories = this.readStorage();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    const updatedCategory = { ...categories[index], ...patch };
    categories[index] = updatedCategory;
    this.writeStorage(categories);
    
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    await this.delay();
    let categories = this.readStorage();
    categories = categories.filter(c => c.id !== id);
    this.writeStorage(categories);
  }

  private readStorage(): Category[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private writeStorage(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }

  private delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
