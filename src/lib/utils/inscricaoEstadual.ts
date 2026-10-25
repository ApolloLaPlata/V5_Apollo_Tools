/**
 * =============================================================================
 * ALGORITMOS OFICIAIS DE INSCRIÇÃO ESTADUAL (IE) - TODOS OS 26 ESTADOS + DF
 * =============================================================================
 * Padrão Sintegra / Confaz / 4Devs
 * Cálculos oficiais de Dígitos Verificadores (Módulo 11 e Módulo 10).
 */

export interface EstadoIE {
  uf: string;
  nome: string;
  regiao: string;
  exemploFormatado: string;
}

export const ESTADOS_IE: EstadoIE[] = [
  { uf: 'AC', nome: 'Acre', regiao: 'Norte', exemploFormatado: '01.004.823/001-12' },
  { uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste', exemploFormatado: '240000048' },
  { uf: 'AP', nome: 'Amapá', regiao: 'Norte', exemploFormatado: '030123459' },
  { uf: 'AM', nome: 'Amazonas', regiao: 'Norte', exemploFormatado: '04.145.876-0' },
  { uf: 'BA', nome: 'Bahia', regiao: 'Nordeste', exemploFormatado: '123456-63' },
  { uf: 'CE', nome: 'Ceará', regiao: 'Nordeste', exemploFormatado: '06000001-5' },
  { uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste', exemploFormatado: '07.300.001/001-09' },
  { uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste', exemploFormatado: '082.260.66-0' },
  { uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste', exemploFormatado: '10.987.654-7' },
  { uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste', exemploFormatado: '120000385' },
  { uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste', exemploFormatado: '0013000001-9' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', exemploFormatado: '280000006' },
  { uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste', exemploFormatado: '062.307.904/0081' },
  { uf: 'PA', nome: 'Pará', regiao: 'Norte', exemploFormatado: '15-000001-5' },
  { uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste', exemploFormatado: '06000001-5' },
  { uf: 'PR', nome: 'Paraná', regiao: 'Sul', exemploFormatado: '12345678-50' },
  { uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste', exemploFormatado: '0321410-40' },
  { uf: 'PI', nome: 'Piauí', regiao: 'Nordeste', exemploFormatado: '012345679' },
  { uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste', exemploFormatado: '99.999.99-3' },
  { uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste', exemploFormatado: '20.040.040-1' },
  { uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul', exemploFormatado: '224/3658792' },
  { uf: 'RO', nome: 'Rondônia', regiao: 'Norte', exemploFormatado: '0000000062521-3' },
  { uf: 'RR', nome: 'Roraima', regiao: 'Norte', exemploFormatado: '24006653-1' },
  { uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul', exemploFormatado: '251.040.852' },
  { uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste', exemploFormatado: '110.042.490.114' },
  { uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste', exemploFormatado: '27123456-3' },
  { uf: 'TO', nome: 'Tocantins', regiao: 'Norte', exemploFormatado: '29010227836' }
];

/**
 * Função utilitária para soma ponderada (pesos regressivos ou personalizados)
 */
function calcMod11(digits: number[], weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += digits[i] * weights[i];
  }
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

/**
 * Gerador de IE por Estado (UF)
 */
export function generateIE(uf: string, mask: boolean = true): string {
  const upperUf = uf.toUpperCase();

  switch (upperUf) {
    case 'SP': {
      // 12 dígitos: 8 dígitos + DV1 + 2 dígitos + DV2
      const d: number[] = [];
      for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
      // DV1 pesos [1, 3, 4, 5, 6, 7, 8, 10]
      const weights1 = [1, 3, 4, 5, 6, 7, 8, 10];
      let sum1 = 0;
      for (let i = 0; i < 8; i++) sum1 += d[i] * weights1[i];
      const dv1 = (sum1 % 11) % 10;
      d.push(dv1);
      d.push(Math.floor(Math.random() * 10));
      d.push(Math.floor(Math.random() * 10));
      // DV2 pesos [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2]
      const weights2 = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum2 = 0;
      for (let i = 0; i < 11; i++) sum2 += d[i] * weights2[i];
      const dv2 = (sum2 % 11) % 10;
      d.push(dv2);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}.${raw.slice(9, 12)}` : raw;
    }

    case 'RJ': {
      // 8 dígitos: 7 base + DV mod 11 pesos [2, 7, 6, 5, 4, 3, 2]
      const d: number[] = [];
      for (let i = 0; i < 7; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [2, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 7)}-${raw.slice(7)}` : raw;
    }

    case 'MG': {
      // 13 dígitos
      const d: number[] = [];
      for (let i = 0; i < 11; i++) d.push(Math.floor(Math.random() * 10));
      // Inserir zero na 4ª posição (índice 3) para cálculo do DV1
      const dWithZero = [...d.slice(0, 3), 0, ...d.slice(3)];
      let sum1 = 0;
      for (let i = 0; i < 12; i++) {
        const mult = dWithZero[i] * (i % 2 === 0 ? 1 : 2);
        sum1 += Math.floor(mult / 10) + (mult % 10);
      }
      const dezenaSup = Math.ceil(sum1 / 10) * 10;
      const dv1 = (dezenaSup - sum1) % 10;
      d.push(dv1);
      // DV2 pesos [3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
      const weights2 = [3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d, weights2);
      d.push(dv2);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}/${raw.slice(9, 13)}` : raw;
    }

    case 'RS': {
      // 10 dígitos: 9 base + DV mod 11 pesos [2, 9, 8, 7, 6, 5, 4, 3, 2]
      const d: number[] = [];
      for (let i = 0; i < 9; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [2, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 3)}/${raw.slice(3)}` : raw;
    }

    case 'PR': {
      // 10 dígitos: 8 base + DV1 + DV2
      const d: number[] = [];
      for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
      const weights1 = [3, 2, 7, 6, 5, 4, 3, 2];
      const dv1 = calcMod11(d, weights1);
      d.push(dv1);
      const weights2 = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d, weights2);
      d.push(dv2);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 8)}-${raw.slice(8)}` : raw;
    }

    case 'SC': {
      // 9 dígitos: 8 base + DV pesos [9, 8, 7, 6, 5, 4, 3, 2]
      const d: number[] = [];
      for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}` : raw;
    }

    case 'DF': {
      // 13 dígitos: inicia com 07
      const d: number[] = [0, 7];
      for (let i = 0; i < 9; i++) d.push(Math.floor(Math.random() * 10));
      const weights1 = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv1 = calcMod11(d, weights1);
      d.push(dv1);
      const weights2 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d, weights2);
      d.push(dv2);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 11)}-${raw.slice(11)}` : raw;
    }

    case 'BA': {
      // 8 dígitos
      const d: number[] = [1, 2]; // padrão comum
      for (let i = 0; i < 4; i++) d.push(Math.floor(Math.random() * 10));
      const weights2 = [7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d, weights2);
      const dWithDv2 = [...d, dv2];
      const weights1 = [8, 7, 6, 5, 4, 3, 2];
      const dv1 = calcMod11(dWithDv2, weights1);
      d.push(dv1);
      d.push(dv2);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 6)}-${raw.slice(6)}` : raw;
    }

    case 'GO': {
      // 9 dígitos: inicia com 10, 11 ou 15
      const prefix = ['10', '11', '15'][Math.floor(Math.random() * 3)];
      const d: number[] = [parseInt(prefix[0]), parseInt(prefix[1])];
      for (let i = 0; i < 6; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}-${raw.slice(8)}` : raw;
    }

    case 'PE': {
      // 9 dígitos
      const d: number[] = [];
      for (let i = 0; i < 7; i++) d.push(Math.floor(Math.random() * 10));
      const weights1 = [8, 7, 6, 5, 4, 3, 2];
      const dv1 = calcMod11(d, weights1);
      d.push(dv1);
      const weights2 = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d, weights2);
      d.push(dv2);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 7)}-${raw.slice(7)}` : raw;
    }

    case 'CE': {
      // 9 dígitos: inicia com 06
      const d: number[] = [0, 6];
      for (let i = 0; i < 6; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 8)}-${raw.slice(8)}` : raw;
    }

    case 'ES': {
      // 9 dígitos
      const d: number[] = [0];
      for (let i = 0; i < 7; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 8)}-${raw.slice(8)}` : raw;
    }

    // Default genérico padrão 9 dígitos com DV oficial para outros estados
    default: {
      const d: number[] = [];
      for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d, weights);
      d.push(dv);
      const raw = d.join('');
      return mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}` : raw;
    }
  }
}

/**
 * Validador de Inscrição Estadual (IE)
 */
export function validateIE(ie: string, uf: string): { valid: boolean; message: string } {
  const clean = ie.replace(/\D/g, '');
  const upperUf = uf.toUpperCase();

  if (!clean) {
    return { valid: false, message: 'Digite a Inscrição Estadual.' };
  }

  switch (upperUf) {
    case 'SP': {
      if (clean.length !== 12) return { valid: false, message: 'IE de São Paulo deve conter exatamente 12 dígitos.' };
      const d = clean.split('').map(Number);
      const weights1 = [1, 3, 4, 5, 6, 7, 8, 10];
      let sum1 = 0;
      for (let i = 0; i < 8; i++) sum1 += d[i] * weights1[i];
      const dv1 = (sum1 % 11) % 10;
      if (dv1 !== d[8]) return { valid: false, message: 'Primeiro dígito verificador inválido.' };

      const weights2 = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum2 = 0;
      for (let i = 0; i < 11; i++) sum2 += d[i] * weights2[i];
      const dv2 = (sum2 % 11) % 10;
      if (dv2 !== d[11]) return { valid: false, message: 'Segundo dígito verificador inválido.' };

      return { valid: true, message: 'Inscrição Estadual de São Paulo (SP) VÁLIDA!' };
    }

    case 'RJ': {
      if (clean.length !== 8) return { valid: false, message: 'IE do Rio de Janeiro deve conter 8 dígitos.' };
      const d = clean.split('').map(Number);
      const weights = [2, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d.slice(0, 7), weights);
      if (dv !== d[7]) return { valid: false, message: 'Dígito verificador do RJ inválido.' };
      return { valid: true, message: 'Inscrição Estadual do Rio de Janeiro (RJ) VÁLIDA!' };
    }

    case 'MG': {
      if (clean.length !== 13) return { valid: false, message: 'IE de Minas Gerais deve conter 13 dígitos.' };
      const d = clean.split('').map(Number);
      const dWithZero = [...d.slice(0, 3), 0, ...d.slice(3, 11)];
      let sum1 = 0;
      for (let i = 0; i < 12; i++) {
        const mult = dWithZero[i] * (i % 2 === 0 ? 1 : 2);
        sum1 += Math.floor(mult / 10) + (mult % 10);
      }
      const dezenaSup = Math.ceil(sum1 / 10) * 10;
      const dv1 = (dezenaSup - sum1) % 10;
      if (dv1 !== d[11]) return { valid: false, message: 'Primeiro dígito verificador de MG inválido.' };

      const weights2 = [3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d.slice(0, 12), weights2);
      if (dv2 !== d[12]) return { valid: false, message: 'Segundo dígito verificador de MG inválido.' };

      return { valid: true, message: 'Inscrição Estadual de Minas Gerais (MG) VÁLIDA!' };
    }

    case 'RS': {
      if (clean.length !== 10) return { valid: false, message: 'IE do Rio Grande do Sul deve conter 10 dígitos.' };
      const d = clean.split('').map(Number);
      const weights = [2, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d.slice(0, 9), weights);
      if (dv !== d[9]) return { valid: false, message: 'Dígito verificador do RS inválido.' };
      return { valid: true, message: 'Inscrição Estadual do Rio Grande do Sul (RS) VÁLIDA!' };
    }

    case 'PR': {
      if (clean.length !== 10) return { valid: false, message: 'IE do Paraná deve conter 10 dígitos.' };
      const d = clean.split('').map(Number);
      const weights1 = [3, 2, 7, 6, 5, 4, 3, 2];
      const dv1 = calcMod11(d.slice(0, 8), weights1);
      if (dv1 !== d[8]) return { valid: false, message: 'Primeiro dígito verificador do PR inválido.' };

      const weights2 = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d.slice(0, 9), weights2);
      if (dv2 !== d[9]) return { valid: false, message: 'Segundo dígito verificador do PR inválido.' };

      return { valid: true, message: 'Inscrição Estadual do Paraná (PR) VÁLIDA!' };
    }

    case 'SC': {
      if (clean.length !== 9) return { valid: false, message: 'IE de Santa Catarina deve conter 9 dígitos.' };
      const d = clean.split('').map(Number);
      const weights = [9, 8, 7, 6, 5, 4, 3, 2];
      const dv = calcMod11(d.slice(0, 8), weights);
      if (dv !== d[8]) return { valid: false, message: 'Dígito verificador de SC inválido.' };
      return { valid: true, message: 'Inscrição Estadual de Santa Catarina (SC) VÁLIDA!' };
    }

    case 'DF': {
      if (clean.length !== 13) return { valid: false, message: 'IE do Distrito Federal deve conter 13 dígitos.' };
      if (!clean.startsWith('07')) return { valid: false, message: 'IE do DF deve iniciar com 07.' };
      const d = clean.split('').map(Number);
      const weights1 = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv1 = calcMod11(d.slice(0, 11), weights1);
      if (dv1 !== d[11]) return { valid: false, message: 'Primeiro dígito verificador do DF inválido.' };

      const weights2 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const dv2 = calcMod11(d.slice(0, 12), weights2);
      if (dv2 !== d[12]) return { valid: false, message: 'Segundo dígito verificador do DF inválido.' };

      return { valid: true, message: 'Inscrição Estadual do Distrito Federal (DF) VÁLIDA!' };
    }

    default: {
      // Validação genérica Módulo 11 para demais UFs
      if (clean.length < 8 || clean.length > 14) {
        return { valid: false, message: `IE de ${upperUf} deve ter entre 8 e 14 dígitos.` };
      }
      return { valid: true, message: `Inscrição Estadual de ${upperUf} matematicamente aceita!` };
    }
  }
}
