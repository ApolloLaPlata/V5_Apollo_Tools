/**
 * Utilitário Soberano de Manipulação e Normalização de Strings (Holding V5 Apollo)
 * Converte para minúsculas e remove diacríticos (acentos, cedilhas, tis) via NFD.
 */
export function normalizeStr(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
