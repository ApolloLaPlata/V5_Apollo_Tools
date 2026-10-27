/**
 * Utilitário Soberano de Sanitização de SVG Client-Side (Holding V5 Apollo)
 * Neutraliza scripts maliciosos, foreignObjects, iframes e atributos inline de eventos (XSS).
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') return '';
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}
