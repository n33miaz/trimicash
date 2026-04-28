/**
 * category.entity.ts — TrimiCash
 * Entidade e porta de categorias (RN-010).
 * TypeScript puro — sem imports Angular.
 */

/**
 * Category — organiza movimentações e contas a pagar por tema.
 *
 * Categorias iniciais sugeridas (RN-010.2):
 * Receitas, Fornecedores, Impostos, Salários, Aluguel, Energia, Marketing, Outros.
 */
export interface Category {
  /** UUID v4 */
  id: string;
  /** Nome legível */
  name: string;
  /** Cor em hex (ex: '#16A34A') para identificação visual */
  color: string;
}

/**
 * CategoryRepository — porta de acesso ao repositório de categorias.
 * Regra: categoria em uso não pode ser excluída sem tratar registros vinculados (RN-010.3).
 */
export interface CategoryRepository {
  list(): Promise<Category[]>;
  create(input: Omit<Category, 'id'>): Promise<Category>;
  update(id: string, patch: Partial<Category>): Promise<Category>;
  remove(id: string): Promise<void>;
}
