/**
 * Utilitário Soberano de Sanitização de SVG Client-Side (Holding V5 Apollo)
 * Neutraliza scripts maliciosos, foreignObjects, iframes, atributos inline de eventos (XSS)
 * e links javascript: com proteção linear contra ReDoS e payload bounding.
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') return '';
  // Limite seguro de 2MB para prevenir esgotamento de memória por SVG malicioso
  if (svg.length > 2 * 1024 * 1024) return '';

  return svg
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/\b(?:href|xlink:href)\s*=\s*(?:'[^']*javascript:[^']*'|"[^"]*javascript:[^"]*"|javascript:[^\s>]+)/gi, '')
    .replace(/\bstyle\s*=\s*(?:'[^']*expression\([^']*'|"[^"]*expression\([^"]*")/gi, '');
}
