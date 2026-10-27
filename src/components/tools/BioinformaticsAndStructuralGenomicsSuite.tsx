'use client';

import React, { useState, useMemo } from 'react';
import {
  Dna,
  Binary,
  FileText,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Info,
  Sliders,
  Eye,
  Activity,
  Scissors,
  Layers,
  Search,
  BarChart2,
  Maximize2
} from 'lucide-react';

export function BioinformaticsAndStructuralGenomicsSuite({
  defaultTab = 'needleman-wunsch-smith-waterman-aligner'
}: {
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    'aligner' | 'translator' | 'protein-properties' | 'pdb-parser' | 'restriction-enzymes'
  >(() => {
    if (defaultTab === 'dna-rna-transcription-codon-translator' || defaultTab === 'translator') return 'translator';
    if (defaultTab === 'protein-physicochemical-property-calc' || defaultTab === 'protein-properties') return 'protein-properties';
    if (defaultTab === 'pdb-structural-protein-parser' || defaultTab === 'pdb-parser') return 'pdb-parser';
    if (defaultTab === 'restriction-enzyme-cleavage-finder' || defaultTab === 'restriction-enzymes') return 'restriction-enzymes';
    return 'aligner';
  });

  const [copied, setCopied] = useState(false);
  const copyToClipboard = (text: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 1: ALINHADOR NEEDLEMAN-WUNSCH & SMITH-WATERMAN                  */
  /* -------------------------------------------------------------------------- */
  const [alignerMode, setAlignerMode] = useState<'global' | 'local'>('global');
  const [seqA, setSeqA] = useState<string>('GATTACA');
  const [seqB, setSeqB] = useState<string>('GCATGCU');
  const [matchScore, setMatchScore] = useState<number>(2);
  const [mismatchPenalty, setMismatchPenalty] = useState<number>(-1);
  const [gapPenalty, setGapPenalty] = useState<number>(-2);

  const alignmentResult = useMemo(() => {
    const s1 = seqA.toUpperCase().replace(/[^A-Z]/g, '') || 'A';
    const s2 = seqB.toUpperCase().replace(/[^A-Z]/g, '') || 'A';
    const n = s1.length;
    const m = s2.length;

    // Matriz de Programação Dinâmica (n+1) x (m+1)
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    if (alignerMode === 'global') {
      // Needleman-Wunsch: Inicialização com penalidades de gap
      for (let i = 0; i <= n; i++) dp[i][0] = i * gapPenalty;
      for (let j = 0; j <= m; j++) dp[0][j] = j * gapPenalty;
    }

    let maxVal = 0;
    let maxI = 0;
    let maxJ = 0;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const scoreMatch = s1[i - 1] === s2[j - 1] ? matchScore : mismatchPenalty;
        const diagonal = dp[i - 1][j - 1] + scoreMatch;
        const up = dp[i - 1][j] + gapPenalty;
        const left = dp[i][j - 1] + gapPenalty;

        if (alignerMode === 'global') {
          dp[i][j] = Math.max(diagonal, up, left);
        } else {
          // Smith-Waterman: Local alinhamento não admite scores negativos
          const val = Math.max(0, diagonal, up, left);
          dp[i][j] = val;
          if (val > maxVal) {
            maxVal = val;
            maxI = i;
            maxJ = j;
          }
        }
      }
    }

    // Traceback
    let alignedA = '';
    let alignedB = '';
    let matchLine = '';
    let i = alignerMode === 'global' ? n : maxI;
    let j = alignerMode === 'global' ? m : maxJ;

    while (i > 0 || j > 0) {
      if (alignerMode === 'local' && (i === 0 || j === 0 || dp[i][j] === 0)) {
        break;
      }

      if (i > 0 && j > 0) {
        const scoreMatch = s1[i - 1] === s2[j - 1] ? matchScore : mismatchPenalty;
        if (dp[i][j] === dp[i - 1][j - 1] + scoreMatch) {
          alignedA = s1[i - 1] + alignedA;
          alignedB = s2[j - 1] + alignedB;
          matchLine = (s1[i - 1] === s2[j - 1] ? '|' : ':') + matchLine;
          i--;
          j--;
          continue;
        }
      }

      if (i > 0 && dp[i][j] === dp[i - 1][j] + gapPenalty) {
        alignedA = s1[i - 1] + alignedA;
        alignedB = '-' + alignedB;
        matchLine = ' ' + matchLine;
        i--;
      } else if (j > 0) {
        alignedA = '-' + alignedA;
        alignedB = s2[j - 1] + alignedB;
        matchLine = ' ' + matchLine;
        j--;
      } else {
        break;
      }
    }

    // Contagem de identidades e similaridades
    let identities = 0;
    for (let k = 0; k < alignedA.length; k++) {
      if (alignedA[k] === alignedB[k] && alignedA[k] !== '-') {
        identities++;
      }
    }
    const totalLen = Math.max(1, alignedA.length);
    const identityPct = ((identities / totalLen) * 100).toFixed(1);
    const finalScore = alignerMode === 'global' ? dp[n][m] : maxVal;

    return {
      s1,
      s2,
      dp,
      alignedA,
      alignedB,
      matchLine,
      finalScore,
      identities,
      totalLen,
      identityPct
    };
  }, [alignerMode, seqA, seqB, matchScore, mismatchPenalty, gapPenalty]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 2: TRANSCRITOR E TRADUTOR GENÉTICO (DNA -> RNA -> PROTEÍNA)    */
  /* -------------------------------------------------------------------------- */
  const CODON_TABLE: { [key: string]: { aa: string; name: string; isStop?: boolean } } = {
    AUG: { aa: 'M', name: 'Metionina (Início)' },
    UUU: { aa: 'F', name: 'Fenilalanina' }, UUC: { aa: 'F', name: 'Fenilalanina' },
    UUA: { aa: 'L', name: 'Leucina' }, UUG: { aa: 'L', name: 'Leucina' },
    UCU: { aa: 'S', name: 'Serina' }, UCC: { aa: 'S', name: 'Serina' }, UCA: { aa: 'S', name: 'Serina' }, UCG: { aa: 'S', name: 'Serina' },
    UAU: { aa: 'Y', name: 'Tirosina' }, UAC: { aa: 'Y', name: 'Tirosina' },
    UAA: { aa: '*', name: 'Stop (Ochre)', isStop: true }, UAG: { aa: '*', name: 'Stop (Amber)', isStop: true },
    UGU: { aa: 'C', name: 'Cisteína' }, UGC: { aa: 'C', name: 'Cisteína' },
    UGA: { aa: '*', name: 'Stop (Opal)', isStop: true }, UGG: { aa: 'W', name: 'Triptofano' },
    CUU: { aa: 'L', name: 'Leucina' }, CUC: { aa: 'L', name: 'Leucina' }, CUA: { aa: 'L', name: 'Leucina' }, CUG: { aa: 'L', name: 'Leucina' },
    CCU: { aa: 'P', name: 'Prolina' }, CCC: { aa: 'P', name: 'Prolina' }, CCA: { aa: 'P', name: 'Prolina' }, CCG: { aa: 'P', name: 'Prolina' },
    CAU: { aa: 'H', name: 'Histidina' }, CAC: { aa: 'H', name: 'Histidina' },
    CAA: { aa: 'Q', name: 'Glutamina' }, CAG: { aa: 'Q', name: 'Glutamina' },
    CGU: { aa: 'R', name: 'Arginina' }, CGC: { aa: 'R', name: 'Arginina' }, CGA: { aa: 'R', name: 'Arginina' }, CGG: { aa: 'R', name: 'Arginina' },
    AUU: { aa: 'I', name: 'Isoleucina' }, AUC: { aa: 'I', name: 'Isoleucina' }, AUA: { aa: 'I', name: 'Isoleucina' },
    ACU: { aa: 'T', name: 'Treonina' }, ACC: { aa: 'T', name: 'Treonina' }, ACA: { aa: 'T', name: 'Treonina' }, ACG: { aa: 'T', name: 'Treonina' },
    AAU: { aa: 'N', name: 'Asparagina' }, AAC: { aa: 'N', name: 'Asparagina' },
    AAA: { aa: 'K', name: 'Lisina' }, AAG: { aa: 'K', name: 'Lisina' },
    AGU: { aa: 'S', name: 'Serina' }, AGC: { aa: 'S', name: 'Serina' },
    AGA: { aa: 'R', name: 'Arginina' }, AGG: { aa: 'R', name: 'Arginina' },
    GUU: { aa: 'V', name: 'Valina' }, GUC: { aa: 'V', name: 'Valina' }, GUA: { aa: 'V', name: 'Valina' }, GUG: { aa: 'V', name: 'Valina' },
    GCU: { aa: 'A', name: 'Alanina' }, GCC: { aa: 'A', name: 'Alanina' }, GCA: { aa: 'A', name: 'Alanina' }, GCG: { aa: 'A', name: 'Alanina' },
    GAU: { aa: 'D', name: 'Aspartato' }, GAC: { aa: 'D', name: 'Aspartato' },
    GAA: { aa: 'E', name: 'Glutamato' }, GAG: { aa: 'E', name: 'Glutamato' },
    GGU: { aa: 'G', name: 'Glicina' }, GGC: { aa: 'G', name: 'Glicina' }, GGA: { aa: 'G', name: 'Glicina' }, GGG: { aa: 'G', name: 'Glicina' }
  };

  const [dnaInput, setDnaInput] = useState<string>(
    'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG'
  ); // Insulina Humana (Preproinsulin)

  const translationResults = useMemo(() => {
    const raw = dnaInput.toUpperCase().replace(/[^ATCG]/g, '');
    // Transcrição para mRNA (T -> U)
    const mrna = raw.replace(/T/g, 'U');

    // Tradução de códons
    let protein = '';
    const codonList: { codon: string; aa: string; name: string }[] = [];
    let startFound = false;
    let stopFound = false;

    for (let i = 0; i + 3 <= mrna.length; i += 3) {
      const codon = mrna.slice(i, i + 3);
      const info = CODON_TABLE[codon] || { aa: '?', name: 'Desconhecido' };

      if (info.aa === 'M') startFound = true;
      if (info.isStop) stopFound = true;

      codonList.push({ codon, aa: info.aa, name: info.name });
      protein += info.aa;
    }

    // GC Content
    const gCount = (raw.match(/G/g) || []).length;
    const cCount = (raw.match(/C/g) || []).length;
    const gcContent = raw.length > 0 ? (((gCount + cCount) / raw.length) * 100).toFixed(1) : '0';

    return {
      cleanDna: raw,
      mrna,
      protein,
      codonList,
      totalBp: raw.length,
      totalCodons: codonList.length,
      gcContent,
      hasStart: startFound,
      hasStop: stopFound
    };
  }, [dnaInput]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 3: PROPRIEDADES FISICOQUÍMICAS DE PROTEÍNAS                     */
  /* -------------------------------------------------------------------------- */
  const AA_MASS: { [key: string]: number } = {
    A: 71.08, R: 156.20, N: 114.11, D: 115.09, C: 103.14, E: 129.12,
    Q: 128.13, G: 57.05, H: 137.14, I: 113.17, L: 113.17, K: 128.18,
    M: 131.21, F: 147.18, P: 97.12, S: 87.08, T: 101.11, W: 186.21,
    Y: 163.18, V: 99.13
  };

  const AA_GRAVY: { [key: string]: number } = {
    A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5, E: -3.5, Q: -3.5, G: -0.4,
    H: -3.2, I: 4.5, L: 3.8, K: -3.9, M: 1.9, F: 2.8, P: -1.6, S: -0.8,
    T: -0.7, W: -0.9, Y: -1.3, V: 4.2
  };

  const [proteinSeq, setProteinSeq] = useState<string>(
    'MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN'
  );

  const proteinProperties = useMemo(() => {
    const seq = proteinSeq.toUpperCase().replace(/[^ARNDCEQGHILKMFPSTWYV]/g, '');
    const n = seq.length;
    if (n === 0) return null;

    // Massa Molecular (soma dos monômeros + 18.015 Da de H2O terminal)
    let molecularMass = 18.015;
    let gravySum = 0;
    const counts: { [key: string]: number } = {};

    for (let i = 0; i < n; i++) {
      const aa = seq[i];
      molecularMass += AA_MASS[aa] || 110;
      gravySum += AA_GRAVY[aa] || 0;
      counts[aa] = (counts[aa] || 0) + 1;
    }

    const gravy = (gravySum / n).toFixed(3);
    const massKDa = (molecularMass / 1000).toFixed(2);

    // Coeficiente de Extinção Molar a 280 nm
    const nTrp = counts['W'] || 0;
    const nTyr = counts['Y'] || 0;
    const nCys = counts['C'] || 0;
    const extCoeff = nTrp * 5500 + nTyr * 1490 + Math.floor(nCys / 2) * 125;

    // Ponto Isoelétrico (pI) aproximado por busca binária (equação de Henderson-Hasselbalch)
    const pKa_NTerm = 9.69;
    const pKa_CTerm = 2.34;
    const pKa_Lys = 10.53;
    const pKa_Arg = 12.48;
    const pKa_His = 6.0;
    const pKa_Asp = 3.86;
    const pKa_Glu = 4.25;
    const pKa_Cys = 8.33;
    const pKa_Tyr = 10.07;

    const calcNetCharge = (pH: number): number => {
      let charge = 0;
      // Cátions (+)
      charge += 1 / (1 + Math.pow(10, pH - pKa_NTerm));
      charge += (counts['K'] || 0) / (1 + Math.pow(10, pH - pKa_Lys));
      charge += (counts['R'] || 0) / (1 + Math.pow(10, pH - pKa_Arg));
      charge += (counts['H'] || 0) / (1 + Math.pow(10, pH - pKa_His));
      // Ânions (-)
      charge -= 1 / (1 + Math.pow(10, pKa_CTerm - pH));
      charge -= (counts['D'] || 0) / (1 + Math.pow(10, pKa_Asp - pH));
      charge -= (counts['E'] || 0) / (1 + Math.pow(10, pKa_Glu - pH));
      charge -= (counts['C'] || 0) / (1 + Math.pow(10, pKa_Cys - pH));
      charge -= (counts['Y'] || 0) / (1 + Math.pow(10, pKa_Tyr - pH));
      return charge;
    };

    let low = 0.0;
    let high = 14.0;
    for (let step = 0; step < 40; step++) {
      const mid = (low + high) / 2;
      const chg = calcNetCharge(mid);
      if (chg > 0) low = mid;
      else high = mid;
    }
    const pI = ((low + high) / 2).toFixed(2);
    const chargeAt74 = calcNetCharge(7.4).toFixed(2);

    return {
      length: n,
      massDa: Math.round(molecularMass).toLocaleString('pt-BR'),
      massKDa,
      pI,
      chargeAt74,
      extCoeff,
      gravy,
      isHydrophobic: Number(gravy) > 0
    };
  }, [proteinSeq]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 4: PARSER DE ARQUIVOS PDB & DIAGRAMA DE RAMACHANDRAN            */
  /* -------------------------------------------------------------------------- */
  const PDB_SAMPLE = `ATOM      1  N   MET A   1      27.340  24.430   2.614  1.00  9.67           N  
ATOM      2  CA  MET A   1      26.266  25.413   2.842  1.00 10.38           C  
ATOM      3  C   MET A   1      26.913  26.639   3.531  1.00  9.62           C  
ATOM      4  O   MET A   1      27.885  26.495   4.268  1.00  9.63           O  
ATOM      5  N   ALA A   2      26.355  27.834   3.284  1.00  9.54           N  
ATOM      6  CA  ALA A   2      26.852  29.083   3.864  1.00  9.62           C  
ATOM      7  C   ALA A   2      26.137  29.412   5.167  1.00  9.50           C  
ATOM      8  O   ALA A   2      25.074  28.847   5.441  1.00  9.78           O  
ATOM      9  N   LEU A   3      26.732  30.344   5.952  1.00  9.53           N  
ATOM     10  CA  LEU A   3      26.177  30.778   7.234  1.00  9.88           C  
ATOM     11  C   LEU A   3      26.878  32.062   7.688  1.00  9.82           C  
ATOM     12  O   LEU A   3      28.093  32.186   7.531  1.00  9.75           O  `;

  const [pdbContent, setPdbContent] = useState<string>(PDB_SAMPLE);

  const parsedPdb = useMemo(() => {
    const lines = pdbContent.split('\n');
    const atoms: { serial: number; name: string; resName: string; chain: string; resSeq: number; x: number; y: number; z: number }[] = [];
    const residues: Set<string> = new Set();

    for (const line of lines) {
      if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) {
        const serial = parseInt(line.slice(6, 11).trim(), 10);
        const name = line.slice(12, 16).trim();
        const resName = line.slice(17, 20).trim();
        const chain = line.slice(21, 22).trim();
        const resSeq = parseInt(line.slice(22, 26).trim(), 10);
        const x = parseFloat(line.slice(30, 38).trim());
        const y = parseFloat(line.slice(38, 46).trim());
        const z = parseFloat(line.slice(46, 54).trim());

        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          atoms.push({ serial, name, resName, chain, resSeq, x, y, z });
          residues.add(`${chain}_${resSeq}`);
        }
      }
    }

    const caAtoms = atoms.filter((a) => a.name === 'CA');

    return {
      totalAtoms: atoms.length,
      caCount: caAtoms.length,
      residuesCount: residues.size,
      caAtoms
    };
  }, [pdbContent]);

  /* -------------------------------------------------------------------------- */
  /* FERRAMENTA 5: BUSCADOR DE ENZIMAS DE RESTRIÇÃO & MAPA DE DIGESTÃO VIRTUAL  */
  /* -------------------------------------------------------------------------- */
  const ENZYMES: { [key: string]: { name: string; motif: string; cutOffset: number; type: 'sticky' | 'blunt' } } = {
    ecori: { name: 'EcoRI', motif: 'GAATTC', cutOffset: 1, type: 'sticky' }, // G^AATTC
    bamhi: { name: 'BamHI', motif: 'GGATCC', cutOffset: 1, type: 'sticky' }, // G^GATCC
    hindiii: { name: 'HindIII', motif: 'AAGCTT', cutOffset: 1, type: 'sticky' }, // A^AGCTT
    noti: { name: 'NotI (Corte Raro 8bp)', motif: 'GCGGCCGC', cutOffset: 2, type: 'sticky' }, // GC^GGCCGC
    xhoi: { name: 'XhoI', motif: 'CTCGAG', cutOffset: 1, type: 'sticky' }, // C^TCGAG
    smai: { name: 'SmaI (Corte Cego Blunt)', motif: 'CCCGGG', cutOffset: 3, type: 'blunt' } // CCC^GGG
  };

  const [selectedEnzymeKey, setSelectedEnzymeKey] = useState<string>('ecori');
  const [restrictionDna, setRestrictionDna] = useState<string>(
    'GAATTCAGCTAAGGAATTCGGGATCCAAAGCTTGGAATTCGCGGCCGCAGTCGAATTC'
  );

  const restrictionDigest = useMemo(() => {
    const enz = ENZYMES[selectedEnzymeKey];
    const dna = restrictionDna.toUpperCase().replace(/[^ATCG]/g, '');
    const motif = enz.motif;
    const cutSites: number[] = [];

    let pos = dna.indexOf(motif);
    while (pos !== -1) {
      cutSites.push(pos + enz.cutOffset);
      pos = dna.indexOf(motif, pos + 1);
    }

    // Cálculo do tamanho dos fragmentos
    const fragments: { start: number; end: number; size: number }[] = [];
    let prev = 0;
    for (const site of cutSites) {
      fragments.push({ start: prev, end: site, size: site - prev });
      prev = site;
    }
    fragments.push({ start: prev, end: dna.length, size: dna.length - prev });

    return {
      dnaLength: dna.length,
      motif,
      cutSites,
      fragments,
      fragmentCount: fragments.length
    };
  }, [selectedEnzymeKey, restrictionDna]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* HEADER DA SUÍTE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-inner">
            <Dna className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CAPITANIA #11 · SUÍTE #91
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                465 FERRAMENTAS
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1">
              Bioinformática, Alinhamento & Genômica Estrutural
            </h2>
            <p className="text-sm text-slate-400">
              Alinhador Needleman-Wunsch/Smith-Waterman, Transcritor e Tradutor de Códons, Propriedades Físico-Químicas de Proteínas, Parser PDB e Clivagem Enzimática.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA SUÍTE */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('aligner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'aligner'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>Needleman-Wunsch & Smith-Waterman</span>
        </button>

        <button
          onClick={() => setActiveTab('translator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'translator'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Dna className="w-4 h-4" />
          <span>Transcrição & Tradução de Códons</span>
        </button>

        <button
          onClick={() => setActiveTab('protein-properties')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'protein-properties'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Propriedades de Proteínas (pI & Da)</span>
        </button>

        <button
          onClick={() => setActiveTab('pdb-parser')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pdb-parser'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Parser PDB & C-Alfa</span>
        </button>

        <button
          onClick={() => setActiveTab('restriction-enzymes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'restriction-enzymes'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Enzimas de Restrição & Clivagem</span>
        </button>
      </div>

      {/* ABA 1: ALINHADOR NEEDLEMAN-WUNSCH & SMITH-WATERMAN */}
      {activeTab === 'aligner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Parâmetros de Alinhamento Dinâmico
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O algoritmo Needleman-Wunsch (global) busca o alinhamento de ponta a ponta, enquanto o Smith-Waterman (local) identifica ilhas de alta similaridade com poda de scores negativos.
            </p>

            <div className="flex gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setAlignerMode('global')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  alignerMode === 'global' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Global (Needleman-Wunsch)
              </button>
              <button
                onClick={() => setAlignerMode('local')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  alignerMode === 'local' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Local (Smith-Waterman)
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Sequência 1:</label>
                <input
                  type="text"
                  value={seqA}
                  onChange={(e) => setSeqA(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 mb-1 block">Sequência 2:</label>
                <input
                  type="text"
                  value={seqB}
                  onChange={(e) => setSeqB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Match (+)</label>
                  <input
                    type="number"
                    value={matchScore}
                    onChange={(e) => setMatchScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Mismatch (-)</label>
                  <input
                    type="number"
                    value={mismatchPenalty}
                    onChange={(e) => setMismatchPenalty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Gap (-)</label>
                  <input
                    type="number"
                    value={gapPenalty}
                    onChange={(e) => setGapPenalty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Resultado do Alinhamento Ótimo
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm space-y-1 overflow-x-auto shadow-inner">
              <div className="text-emerald-300 font-bold tracking-widest">{alignmentResult.alignedA}</div>
              <div className="text-slate-500 font-bold tracking-widest">{alignmentResult.matchLine}</div>
              <div className="text-cyan-300 font-bold tracking-widest">{alignmentResult.alignedB}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Score de Alinhamento</div>
                <div className="text-xl font-mono font-bold text-emerald-400">{alignmentResult.finalScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Identidade Sequencial</div>
                <div className="text-xl font-mono font-bold text-cyan-400">{alignmentResult.identityPct}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Matches / Tamanho</div>
                <div className="text-xl font-mono font-bold text-purple-400">{alignmentResult.identities} / {alignmentResult.totalLen}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: TRANSCRITOR E TRADUTOR DE CÓDONS */}
      {activeTab === 'translator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Dna className="w-5 h-5 text-cyan-400" />
              Sequência de DNA Codificante (5' → 3')
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Insira a fita codificante de DNA. O sistema transcreve para mRNA e traduz usando o código genético universal com identificação de códons de início (AUG) e parada (Stop).
            </p>

            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">DNA (A, T, C, G):</label>
              <textarea
                value={dnaInput}
                onChange={(e) => setDnaInput(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-cyan-300 uppercase break-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Pares de Bases:</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">{translationResults.totalBp} bp</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Teor GC (GC%):</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{translationResults.gcContent}%</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Polipeptídeo Traduzido & mRNA
            </h3>

            <div>
              <div className="text-xs text-slate-400 mb-1">Fita Transcrita (mRNA):</div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-24 overflow-y-auto break-all">
                {translationResults.mrna}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Proteína Primária (Código 1 Letra):</span>
                <span className="text-purple-400 font-mono">{translationResults.protein.length} aminoácidos</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 font-mono text-xs text-purple-300 max-h-28 overflow-y-auto break-all">
                {translationResults.protein}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border text-xs text-center ${translationResults.hasStart ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                {translationResults.hasStart ? '✓ Códon AUG (Met) Presente' : 'Sem Códon de Início AUG'}
              </div>
              <div className={`p-3 rounded-xl border text-xs text-center ${translationResults.hasStop ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                {translationResults.hasStop ? '✓ Códon de Parada (Stop) Presente' : 'Sem Códon Stop'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: PROPRIEDADES FÍSICO-QUÍMICAS DE PROTEÍNAS */}
      {activeTab === 'protein-properties' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Sequência Primária da Proteína
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calcula a massa molecular exata em Daltons, o ponto isoelétrico (pI) teórico resolvendo a ionização de Henderson-Hasselbalch e o índice de hidropatia GRAVY.
            </p>

            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Aminoácidos (1 Letra):</label>
              <textarea
                value={proteinSeq}
                onChange={(e) => setProteinSeq(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-indigo-300 uppercase break-all resize-none"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Parâmetros Biofísicos Calculados
            </h3>

            {proteinProperties && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Ponto Isoelétrico (pI)</div>
                  <div className="text-xl font-mono font-bold text-indigo-400">{proteinProperties.pI}</div>
                  <div className="text-[10px] text-slate-500">Carga neutra</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Massa Molecular</div>
                  <div className="text-xl font-mono font-bold text-cyan-400">{proteinProperties.massKDa} kDa</div>
                  <div className="text-[10px] text-slate-500">{proteinProperties.massDa} Da</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Carga Líquida (pH 7.4)</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">{proteinProperties.chargeAt74}</div>
                  <div className="text-[10px] text-slate-500">Fisiológico</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400">GRAVY Hidropatia</div>
                  <div className={`text-xl font-mono font-bold ${proteinProperties.isHydrophobic ? 'text-amber-400' : 'text-sky-400'}`}>
                    {proteinProperties.gravy}
                  </div>
                  <div className="text-[10px] text-slate-500">{proteinProperties.isHydrophobic ? 'Hidrofóbica' : 'Hidrofílica'}</div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-200">Extinção Molar a 280 nm (Abs 0.1%):</div>
              <div className="font-mono text-cyan-400">{proteinProperties?.extCoeff} M⁻¹ cm⁻¹ (Baseado em resíduos de Triptofano, Tirosina e Cisteína).</div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: PARSER DE ARQUIVOS PDB */}
      {activeTab === 'pdb-parser' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Arquivo PDB (Protein Data Bank)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analisa blocos ATOM/HETATM de arquivos PDB, extraindo coordenadas espaciais 3D (X, Y, Z) dos carbonos alfa (Cα) do esqueleto peptídico.
            </p>

            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Conteúdo PDB Textual:</label>
              <textarea
                value={pdbContent}
                onChange={(e) => setPdbContent(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-purple-300 resize-none"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Esqueleto Polipeptídico & Átomos C-Alfa (Cα)
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Total de Átomos</div>
                <div className="text-xl font-mono font-bold text-purple-400">{parsedPdb.totalAtoms}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Resíduos Identificados</div>
                <div className="text-xl font-mono font-bold text-cyan-400">{parsedPdb.residuesCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Carbonos Alfa (Cα)</div>
                <div className="text-xl font-mono font-bold text-emerald-400">{parsedPdb.caCount}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
              {parsedPdb.caAtoms.map((ca, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300 p-1.5 rounded bg-slate-900/50">
                  <span className="text-purple-300 font-bold">{ca.resName} #{ca.resSeq} (Cadeia {ca.chain})</span>
                  <span className="text-slate-400">X={ca.x.toFixed(2)} Y={ca.y.toFixed(2)} Z={ca.z.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: ENZIMAS DE RESTRIÇÃO & CLIVAGEM */}
      {activeTab === 'restriction-enzymes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-5">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              Digestão Virtual por Endonucleases
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mapeia os sítios de corte de enzimas de restrição bacterianas (EcoRI, BamHI, HindIII, NotI) e simula o tamanho dos fragmentos gerados para eletroforese em gel.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Enzima Selecionada:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ENZYMES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEnzymeKey(key)}
                    className={`p-2 rounded-xl text-left text-xs transition border ${
                      selectedEnzymeKey === key
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{val.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{val.motif}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">DNA Plasmídico / Linear:</label>
              <textarea
                value={restrictionDna}
                onChange={(e) => setRestrictionDna(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-amber-300 uppercase resize-none break-all"
              />
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Mapa de Clivagem & Fragmentos Gerados
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Sítios de Clivagem Encontrados</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{restrictionDigest.cutSites.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400">Total de Fragmentos</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{restrictionDigest.fragmentCount}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Tamanho das Bandas de DNA (Pares de Bases - bp):</div>
              <div className="grid grid-cols-3 gap-2">
                {restrictionDigest.fragments.map((frag, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono text-xs">
                    <span className="text-slate-400 block text-[10px]">Banda #{idx + 1}</span>
                    <span className="text-amber-300 font-bold">{frag.size} bp</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BioinformaticsAndStructuralGenomicsSuite;
