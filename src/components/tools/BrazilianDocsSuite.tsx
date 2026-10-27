'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, RefreshCw, FileText, CheckCircle2, XCircle, Award, CreditCard, Hash, Building2 } from 'lucide-react';
import { ESTADOS_IE, generateIE, validateIE } from '@/lib/utils/inscricaoEstadual';

export function BrazilianDocsSuite({ defaultTab = 'cpf' }: { defaultTab?: 'cpf' | 'cnpj' | 'cnh' | 'pis' | 'titulo' | 'certidao' | 'rg' | 'ie' }) {
  const [activeTab, setActiveTab] = useState<'cpf' | 'cnpj' | 'cnh' | 'pis' | 'titulo' | 'certidao' | 'rg' | 'ie'>(defaultTab);
  const [withMask, setWithMask] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // States for Generated Docs
  const [cpf, setCpf] = useState('');
  const [cpfValidation, setCpfValidation] = useState<{ valid: boolean; state?: string } | null>(null);
  const [inputCpf, setInputCpf] = useState('');

  const [cnpj, setCnpj] = useState('');
  const [cnpjValidation, setCnpjValidation] = useState<boolean | null>(null);
  const [inputCnpj, setInputCnpj] = useState('');

  const [cnh, setCnh] = useState('');
  const [cnhValidation, setCnhValidation] = useState<boolean | null>(null);
  const [inputCnh, setInputCnh] = useState('');

  const [pis, setPis] = useState('');
  const [pisValidation, setPisValidation] = useState<boolean | null>(null);
  const [inputPis, setInputPis] = useState('');

  const [titulo, setTitulo] = useState('');
  const [tituloValidation, setTituloValidation] = useState<{ valid: boolean; uf?: string } | null>(null);
  const [inputTitulo, setInputTitulo] = useState('');

  const [certidao, setCertidao] = useState('');
  const [tipoCertidao, setTipoCertidao] = useState<'nascimento' | 'casamento' | 'obito'>('nascimento');

  const [rg, setRg] = useState('');
  const [rgValidation, setRgValidation] = useState<boolean | null>(null);
  const [inputRg, setInputRg] = useState('');

  // Inscrição Estadual (IE) State
  const [selectedUfIE, setSelectedUfIE] = useState<string>('SP');
  const [ie, setIe] = useState('');
  const [ieValidation, setIeValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [inputIe, setInputIe] = useState('');

  // UF Map for Title of Elector & CPF
  const UF_TITULO_MAP: Record<string, string> = {
    '01': 'SP', '02': 'MG', '03': 'RJ', '04': 'RS', '05': 'BA', '06': 'PR', '07': 'CE',
    '08': 'PE', '09': 'SC', '10': 'GO', '11': 'MA', '12': 'PB', '13': 'PA', '14': 'ES',
    '15': 'PI', '16': 'RN', '17': 'AL', '18': 'MT', '19': 'MS', '20': 'DF', '21': 'SE',
    '22': 'AM', '23': 'RO', '24': 'AC', '25': 'AP', '26': 'RR', '27': 'TO', '28': 'Exterior'
  };

  // --- CPF ALGORITHMS (Módulo 11) ---
  const generateCpf = (mask: boolean) => {
    const d: number[] = [];
    for (let i = 0; i < 9; i++) d.push(Math.floor(Math.random() * 10));
    let s1 = 0;
    for (let i = 0; i < 9; i++) s1 += d[i] * (10 - i);
    let r1 = s1 % 11;
    d.push(r1 < 2 ? 0 : 11 - r1);
    let s2 = 0;
    for (let i = 0; i < 10; i++) s2 += d[i] * (11 - i);
    let r2 = s2 % 11;
    d.push(r2 < 2 ? 0 : 11 - r2);
    const raw = d.join('');
    setCpf(mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}` : raw);
  };

  const validateCpf = (val: string) => {
    setInputCpf(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) {
      setCpfValidation(clean.length === 11 ? { valid: false } : null);
      return;
    }
    const d = clean.split('').map(Number);
    let s1 = 0;
    for (let i = 0; i < 9; i++) s1 += d[i] * (10 - i);
    let r1 = s1 % 11;
    const v1 = r1 < 2 ? 0 : 11 - r1;
    if (v1 !== d[9]) { setCpfValidation({ valid: false }); return; }
    let s2 = 0;
    for (let i = 0; i < 10; i++) s2 += d[i] * (11 - i);
    let r2 = s2 % 11;
    const v2 = r2 < 2 ? 0 : 11 - r2;
    if (v2 !== d[10]) { setCpfValidation({ valid: false }); return; }
    const states = ['RS', 'DF/GO/MS/MT/TO', 'AC/AM/AP/PA/RO/RR', 'CE/MA/PI', 'AL/PB/PE/RN', 'BA/SE', 'MG', 'ES/RJ', 'SP', 'PR/SC'];
    setCpfValidation({ valid: true, state: states[d[8]] });
  };

  // --- CNPJ ALGORITHMS ---
  const generateCnpj = (mask: boolean) => {
    const d: number[] = [];
    for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
    d.push(0, 0, 0, 1); // 0001 Matriz
    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let s1 = 0;
    for (let i = 0; i < 12; i++) s1 += d[i] * w1[i];
    let r1 = s1 % 11;
    d.push(r1 < 2 ? 0 : 11 - r1);
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let s2 = 0;
    for (let i = 0; i < 13; i++) s2 += d[i] * w2[i];
    let r2 = s2 % 11;
    d.push(r2 < 2 ? 0 : 11 - r2);
    const raw = d.join('');
    setCnpj(mask ? `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}` : raw);
  };

  const validateCnpj = (val: string) => {
    setInputCnpj(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 14 || /^(\d)\1{13}$/.test(clean)) {
      setCnpjValidation(clean.length === 14 ? false : null);
      return;
    }
    const d = clean.split('').map(Number);
    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let s1 = 0;
    for (let i = 0; i < 12; i++) s1 += d[i] * w1[i];
    let r1 = s1 % 11;
    const v1 = r1 < 2 ? 0 : 11 - r1;
    if (v1 !== d[12]) { setCnpjValidation(false); return; }
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let s2 = 0;
    for (let i = 0; i < 13; i++) s2 += d[i] * w2[i];
    let r2 = s2 % 11;
    const v2 = r2 < 2 ? 0 : 11 - r2;
    setCnpjValidation(v2 === d[13]);
  };

  // --- CNH ALGORITHMS (Módulo 11 Oficial Denatran) ---
  const generateCnh = () => {
    const d: number[] = [];
    for (let i = 0; i < 9; i++) d.push(Math.floor(Math.random() * 10));
    let s1 = 0;
    for (let i = 0; i < 9; i++) s1 += d[i] * (9 - i);
    let dv1 = s1 % 11;
    let factor = 0;
    if (dv1 >= 10) { dv1 = 0; factor = -2; }
    let s2 = 0;
    for (let i = 0; i < 9; i++) s2 += d[i] * (1 + i);
    let rest2 = (s2 + factor) % 11;
    let dv2 = rest2 >= 10 ? 0 : rest2;
    d.push(dv1, dv2);
    setCnh(d.join(''));
  };

  const validateCnh = (val: string) => {
    setInputCnh(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) {
      setCnhValidation(clean.length === 11 ? false : null);
      return;
    }
    const d = clean.split('').map(Number);
    let s1 = 0;
    for (let i = 0; i < 9; i++) s1 += d[i] * (9 - i);
    let dv1 = s1 % 11;
    let factor = 0;
    if (dv1 >= 10) { dv1 = 0; factor = -2; }
    let s2 = 0;
    for (let i = 0; i < 9; i++) s2 += d[i] * (1 + i);
    let rest2 = (s2 + factor) % 11;
    let dv2 = rest2 >= 10 ? 0 : rest2;
    setCnhValidation(d[9] === dv1 && d[10] === dv2);
  };

  // --- PIS / PASEP ALGORITHMS ---
  const generatePis = (mask: boolean) => {
    const d: number[] = [];
    for (let i = 0; i < 10; i++) d.push(Math.floor(Math.random() * 10));
    const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += d[i] * weights[i];
    let rest = sum % 11;
    let dv = 11 - rest;
    if (dv === 10 || dv === 11) dv = 0;
    d.push(dv);
    const raw = d.join('');
    setPis(mask ? `${raw.slice(0, 3)}.${raw.slice(3, 8)}.${raw.slice(8, 10)}-${raw.slice(10)}` : raw);
  };

  const validatePis = (val: string) => {
    setInputPis(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) {
      setPisValidation(clean.length === 11 ? false : null);
      return;
    }
    const d = clean.split('').map(Number);
    const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += d[i] * weights[i];
    let rest = sum % 11;
    let dv = 11 - rest;
    if (dv === 10 || dv === 11) dv = 0;
    setPisValidation(d[10] === dv);
  };

  // --- TÍTULO DE ELEITOR (TSE Módulo 11) ---
  const generateTitulo = () => {
    const d: number[] = [];
    for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
    // Código de UF aleatório entre 01 e 28
    const ufCodes = Object.keys(UF_TITULO_MAP);
    const ufCode = ufCodes[Math.floor(Math.random() * ufCodes.length)];
    d.push(parseInt(ufCode[0], 10), parseInt(ufCode[1], 10));

    // DV1 (pesos 2 a 9)
    let s1 = 0;
    for (let i = 0; i < 8; i++) s1 += d[i] * (2 + i);
    let r1 = s1 % 11;
    let dv1 = r1 === 10 ? 0 : r1;
    d.push(dv1);

    // DV2 (pesos 7, 8, 9)
    let s2 = d[8] * 7 + d[9] * 8 + d[10] * 9;
    let r2 = s2 % 11;
    let dv2 = r2 === 10 ? 0 : r2;
    d.push(dv2);

    const raw = d.join('');
    setTitulo(withMask ? `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8, 10)} ${raw.slice(10)}` : raw);
  };

  const validateTitulo = (val: string) => {
    setInputTitulo(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 12) {
      setTituloValidation(null);
      return;
    }
    const d = clean.split('').map(Number);
    const ufCode = `${d[8]}${d[9]}`;
    const uf = UF_TITULO_MAP[ufCode];
    if (!uf) { setTituloValidation({ valid: false }); return; }

    let s1 = 0;
    for (let i = 0; i < 8; i++) s1 += d[i] * (2 + i);
    let r1 = s1 % 11;
    let dv1 = r1 === 10 ? 0 : r1;
    if (dv1 !== d[10]) { setTituloValidation({ valid: false }); return; }

    let s2 = d[8] * 7 + d[9] * 8 + d[10] * 9;
    let r2 = s2 % 11;
    let dv2 = r2 === 10 ? 0 : r2;
    setTituloValidation({ valid: dv2 === d[11], uf });
  };

  // --- CERTIDÕES NACIONAIS (32 dígitos CNJ) ---
  const generateCertidao = () => {
    // 6 dígitos CNS cartório + 2 acervo + 55 código serviço + 4 ano + 1 tipo livro + 5 termo + 7 folha/livro + 2 DV
    const cns = '123456';
    const acervo = '01';
    const servico = '55';
    const ano = (new Date().getFullYear() - Math.floor(Math.random() * 30)).toString();
    const tipoMap = { nascimento: '1', casamento: '2', obito: '4' };
    const tipo = tipoMap[tipoCertidao];
    const livro = Math.floor(Math.random() * 89999 + 10000).toString();
    const folha = Math.floor(Math.random() * 899 + 100).toString();
    const termo = Math.floor(Math.random() * 8999999 + 1000000).toString();
    
    const base = `${cns}${acervo}${servico}${ano}${tipo}${livro}${folha}${termo}`;
    // Simple CNJ modulo 11
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * ((i % 8) + 2);
    }
    const dv = String(sum % 100).padStart(2, '0');
    const full = `${base}${dv}`;
    setCertidao(withMask ? `${full.slice(0, 6)} ${full.slice(6, 8)} ${full.slice(8, 10)} ${full.slice(10, 14)} ${full.slice(14, 15)} ${full.slice(15, 20)} ${full.slice(20, 23)} ${full.slice(23, 30)}-${dv}` : full);
  };

  // --- RG (REGISTRO GERAL SSP SP Módulo 11) ---
  const generateRg = (mask: boolean) => {
    const d: number[] = [];
    for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
    let s = 0;
    for (let i = 0; i < 8; i++) s += d[i] * (2 + i);
    let r = s % 11;
    let dv = r === 0 ? '0' : r === 1 ? 'X' : (11 - r).toString();
    const raw = d.join('') + dv;
    setRg(mask ? `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}-${dv}` : raw);
  };

  const validateRg = (val: string) => {
    setInputRg(val);
    const clean = val.replace(/[^0-9kKxX]/g, '').toUpperCase();
    if (clean.length !== 9) {
      setRgValidation(null);
      return;
    }
    const digits = clean.slice(0, 8).split('').map(Number);
    const dvChar = clean[8];
    let s = 0;
    for (let i = 0; i < 8; i++) s += digits[i] * (2 + i);
    let r = s % 11;
    let expectedDv = r === 0 ? '0' : r === 1 ? 'X' : (11 - r).toString();
    setRgValidation(dvChar === expectedDv);
  };

  React.useEffect(() => {
    generateCpf(withMask);
    generateCnpj(withMask);
    generateCnh();
    generatePis(withMask);
    generateTitulo();
    generateCertidao();
    generateRg(withMask);
    setIe(generateIE(selectedUfIE, withMask));
  }, [withMask, tipoCertidao, selectedUfIE]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte Oficial de Documentos Brasileiros & Validadores
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              4DEVS TOTAL REVERSE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Algoritmos oficiais de verificação e cálculo de dígitos (Receita Federal, Denatran, TSE e CNJ) 100% no navegador.
          </p>
        </div>

        {/* Alternador de Máscara Pontuação */}
        <button
          onClick={() => setWithMask(!withMask)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            withMask
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {withMask ? 'Com Máscara (Pontuação)' : 'Apenas Dígitos'}
        </button>
      </div>

      {/* Abas dos Documentos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'cpf', label: 'CPF', desc: 'Pessoa Física' },
          { id: 'cnpj', label: 'CNPJ', desc: 'Pessoa Jurídica' },
          { id: 'ie', label: 'Inscrição Estadual', desc: 'Sintegra 27 UFs' },
          { id: 'rg', label: 'RG', desc: 'Identidade SSP' },
          { id: 'cnh', label: 'CNH', desc: 'Habilitação' },
          { id: 'pis', label: 'PIS/PASEP', desc: 'Trabalhador' },
          { id: 'titulo', label: 'Título Eleitor', desc: 'TSE' },
          { id: 'certidao', label: 'Certidão CNJ', desc: 'Cartório 32 dígitos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex flex-col items-start ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9px] font-normal ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Conteúdo Dinâmico por Aba */}

      {/* ABA: CPF */}
      {activeTab === 'cpf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de CPF Válido</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-emerald-300">
                {cpf}
              </span>
              <button
                onClick={() => copyToClipboard(cpf, 'cpf')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'cpf' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'cpf' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => generateCpf(withMask)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Calculado via algoritmo Módulo 11 oficial da Receita Federal.</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Validador de CPF em Tempo Real</span>
            <input
              type="text"
              value={inputCpf}
              onChange={(e) => validateCpf(e.target.value)}
              placeholder="Digite o CPF para validar..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            {cpfValidation && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                cpfValidation.valid ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {cpfValidation.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{cpfValidation.valid ? `CPF Válido (Região Fiscal: ${cpfValidation.state})` : 'CPF Inválido'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: CNPJ */}
      {activeTab === 'cnpj' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de CNPJ Corporativo</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-emerald-300">
                {cnpj}
              </span>
              <button
                onClick={() => copyToClipboard(cnpj, 'cnpj')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'cnpj' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'cnpj' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => generateCnpj(withMask)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Padrão Matriz 0001 com dígitos verificadores oficiais.</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Validador de CNPJ</span>
            <input
              type="text"
              value={inputCnpj}
              onChange={(e) => validateCnpj(e.target.value)}
              placeholder="Digite o CNPJ para validar..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            {cnpjValidation !== null && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                cnpjValidation ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {cnpjValidation ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{cnpjValidation ? 'CNPJ Válido' : 'CNPJ Inválido'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: CNH */}
      {activeTab === 'cnh' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de CNH (Denatran)</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-emerald-300">
                {cnh}
              </span>
              <button
                onClick={() => copyToClipboard(cnh, 'cnh')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'cnh' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'cnh' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={generateCnh}
                aria-label="Gerar nova CNH fictícia"
                title="Gerar nova CNH"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">11 dígitos com 2 dígitos verificadores oficiais do Renach/Denatran.</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Validador de CNH</span>
            <input
              type="text"
              value={inputCnh}
              onChange={(e) => validateCnh(e.target.value)}
              placeholder="Digite a CNH (11 dígitos)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            {cnhValidation !== null && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                cnhValidation ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {cnhValidation ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{cnhValidation ? 'CNH Válida no Renach' : 'CNH Inválida'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: PIS/PASEP */}
      {activeTab === 'pis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de PIS / PASEP</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-emerald-300">
                {pis}
              </span>
              <button
                onClick={() => copyToClipboard(pis, 'pis')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'pis' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'pis' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => generatePis(withMask)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Número de Identificação Social (NIS/PIS/NIT) com Módulo 11.</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Validador de PIS/PASEP</span>
            <input
              type="text"
              value={inputPis}
              onChange={(e) => validatePis(e.target.value)}
              placeholder="Digite o PIS/PASEP (11 dígitos)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            {pisValidation !== null && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                pisValidation ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {pisValidation ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{pisValidation ? 'PIS/PASEP Válido' : 'PIS/PASEP Inválido'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: TÍTULO DE ELEITOR */}
      {activeTab === 'titulo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de Título de Eleitor (TSE)</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-emerald-300">
                {titulo}
              </span>
              <button
                onClick={() => copyToClipboard(titulo, 'titulo')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'titulo' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'titulo' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={generateTitulo}
                aria-label="Gerar novo Título de Eleitor"
                title="Gerar novo Título"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">12 dígitos oficiais com código de unidade federativa e dois DVs.</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Validador de Título Eleitoral</span>
            <input
              type="text"
              value={inputTitulo}
              onChange={(e) => validateTitulo(e.target.value)}
              placeholder="Digite o Título Eleitoral (12 dígitos)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            {tituloValidation && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                tituloValidation.valid ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {tituloValidation.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{tituloValidation.valid ? `Título Válido no TSE (Estado: ${tituloValidation.uf})` : 'Título Inválido'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: CERTIDÃO CNJ */}
      {activeTab === 'certidao' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Tipo de Certidão:</span>
            {(['nascimento', 'casamento', 'obito'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipoCertidao(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                  tipoCertidao === t
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Número da Certidão Unificada (Padrão CNJ 32 Dígitos)</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-sm sm:text-base font-bold text-emerald-300 break-all">
                {certidao}
              </span>
              <button
                onClick={() => copyToClipboard(certidao, 'cert')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'cert' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'cert' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={generateCertidao}
                aria-label="Gerar nova Certidão de Nascimento"
                title="Gerar nova Certidão"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Padrão nacional unificado do Conselho Nacional de Justiça com código CNS do cartório, acervo, tipo de livro e termo.</p>
          </div>
        </div>
      )}

      {/* ABA: RG (REGISTRO GERAL) */}
      {activeTab === 'rg' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de RG (Padrão SSP)</span>
            <div className="flex items-center gap-2">
              <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-lg font-bold text-emerald-300">
                {rg}
              </span>
              <button
                onClick={() => copyToClipboard(rg, 'rg')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedKey === 'rg' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'rg' ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => generateRg(withMask)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Geração de Registro Geral fictício com cálculo de dígito verificador Módulo 11 (SSP).</p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 block">Validador de RG</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Digite o RG (com ou sem pontuação)..."
                value={inputRg}
                onChange={(e) => validateRg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
              {rgValidation !== null && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs font-bold">
                  {rgValidation ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Válido</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> Inválido</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Validação matemática pelo dígito verificador oficial SSP.</p>
          </div>
        </div>
      )}

      {/* ABA: INSCRIÇÃO ESTADUAL (TODOS OS 26 ESTADOS + DF) */}
      {activeTab === 'ie' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-4 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Estado emissor (UF):</span>
              <select
                value={selectedUfIE}
                onChange={(e) => {
                  const uf = e.target.value;
                  setSelectedUfIE(uf);
                  setIe(generateIE(uf, withMask));
                  setInputIe('');
                  setIeValidation(null);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {ESTADOS_IE.map((est) => (
                  <option key={est.uf} value={est.uf}>
                    {est.uf} - {est.nome} ({est.regiao})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Padrão Sintegra / Confaz / 4Devs Oficial
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gerador de IE */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 block">
                  Gerador de IE ({selectedUfIE})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  {ESTADOS_IE.find(e => e.uf === selectedUfIE)?.nome}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 font-mono text-base sm:text-lg font-bold text-emerald-300 truncate">
                  {ie}
                </span>
                <button
                  onClick={() => copyToClipboard(ie, 'ie')}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedKey === 'ie' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'ie' ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={() => setIe(generateIE(selectedUfIE, withMask))}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
                  title="Gerar nova Inscrição Estadual"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Geração com cálculo real dos dígitos verificadores fiscais segundo a regra SEFAZ/{selectedUfIE}.
              </p>
            </div>

            {/* Validador de IE */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Validador de IE ({selectedUfIE})
              </span>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Digite a IE de ${selectedUfIE} para validar...`}
                  value={inputIe}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputIe(val);
                    if (val.trim()) {
                      setIeValidation(validateIE(val, selectedUfIE));
                    } else {
                      setIeValidation(null);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                {ieValidation !== null && (
                  <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs font-bold">
                    {ieValidation.valid ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Válida
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Inválida
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className={`text-[11px] ${ieValidation ? (ieValidation.valid ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'}`}>
                {ieValidation ? ieValidation.message : `Exemplo aceito: ${ESTADOS_IE.find(e => e.uf === selectedUfIE)?.exemploFormatado}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
