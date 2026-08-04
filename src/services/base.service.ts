import { MOCK_DELAY } from "@/constants";
import type { Paginated } from "@/types";

/**
 * Camada de acesso a dados.
 *
 * Hoje: mocks em memória com latência simulada.
 * Amanhã: basta trocar o corpo de cada método por uma query do Supabase —
 * as assinaturas (input/output) permanecem idênticas, então hooks,
 * componentes e páginas não mudam.
 */
export const delay = <T>(data: T, ms: number = MOCK_DELAY): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

export const paginate = <T>(items: T[], page = 1, perPage = 12): Paginated<T> => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    data: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    perPage,
    total,
    totalPages,
  };
};

export class NotFoundError extends Error {
  constructor(resource: string, identifier: string) {
    super(`${resource} não encontrado: ${identifier}`);
    this.name = "NotFoundError";
  }
}
