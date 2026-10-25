'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, RefreshCw, CheckCircle2, XCircle, FileCode } from 'lucide-react';

export function CpfCnpjTool() {
  const [tab, setTab] = useState<'cpf' | 'cnpj'>('cpf');
  
  // CPF State
  const [generatedCpf, setGeneratedCpf] = useState('');
  const [cpfWithMask, setCpfWithMask] = useState(true);
  const [cpfStateOrigin, setCpfStateOrigin] = useState('');
  const [validateCpfInput, setValidateCpfInput] = useState('');
  const [cpfValidationResult, setCpfValidationResult] = useState<{ valid: boolean; state?: string } | null>(null);

  // CNPJ State
  const [generatedCnpj, setGeneratedCnpj] = useState('');
  const [cnpjWithMask, setCnpjWithMask] = useState(true);
  const [validateCnpjInput, setValidateCnpjInput] = useState('');
  const [cnpjValidationResult, setCnpjValidationResult] = useState<boolean | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // State origin mapping for CPF (9th digit)
  const STATE_DIGIT_MAP: Record<number, string> = {
    1: 'DF, GO, MS, MT, TO',
    2: 'AC, AM, AP, PA, RO, RR',
    3: 'CE, MA, PI',
    4: 'AL, PB, PE, RN',
    5: 'BA, SE',
    6: 'MG',
    7: 'ES, RJ',
    8: 'SP',
    9: 'PR, SC',
    0: 'RS'
  };

  // CPF Generation Logic (Official Module 11)
  const generateValidCpf = (mask: boolean, forcedStateDigit?: string) => {
    const digits: number[] = [];
    for (let i = 0; i < 8; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }

    if (forcedStateDigit !== undefined && forcedStateDigit !== '') {
      digits.push(parseInt(forcedStateDigit, 10));
    } else {
      digits.push(Math.floor(Math.random() * 10));
    }

    // First Verifier Digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let rest = sum % 11;
    const d1 = rest < 2 ? 0 : 11 - rest;
    digits.push(d1);

    // Second Verifier Digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    rest = sum % 11;
    const d2 = rest < 2 ? 0 : 11 - rest;
    digits.push(d2);

    const raw = digits.join('');
    if (mask) {
      return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
    }
    return raw;
  };

  // CPF Validation Logic
  const validateCpf = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 11) return { valid: false };

    // Check if all digits are equal (e.g. 111.111.111-11 is invalid)
    if (/^(\d)\1{10}$/.test(clean)) return { valid: false };

    const digits = clean.split('').map(Number);

    // Verify 1st digit
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
    let rest = sum % 11;
    const d1 = rest < 2 ? 0 : 11 - rest;
    if (digits[9] !== d1) return { valid: false };

    // Verify 2nd digit
    sum = 0;
    for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
    rest = sum % 11;
    const d2 = rest < 2 ? 0 : 11 - rest;
    if (digits[10] !== d2) return { valid: false };

    const stateDesc = STATE_DIGIT_MAP[digits[8]];
    return { valid: true, state: stateDesc };
  };

  // CNPJ Generation Logic
  const generateValidCnpj = (mask: boolean) => {
    const digits: number[] = [];
    for (let i = 0; i < 8; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    // Default matrix unit 0001
    digits.push(0, 0, 0, 1);

    // 1st Verifier
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += digits[i] * weights1[i];
    let rest = sum % 11;
    const d1 = rest < 2 ? 0 : 11 - rest;
    digits.push(d1);

    // 2nd Verifier
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) sum += digits[i] * weights2[i];
    rest = sum % 11;
    const d2 = rest < 2 ? 0 : 11 - rest;
    digits.push(d2);

    const raw = digits.join('');
    if (mask) {
      return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12, 14)}`;
    }
    return raw;
  };

  // CNPJ Validation Logic
  const validateCnpj = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(clean)) return false;

    const digits = clean.split('').map(Number);
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += digits[i] * weights1[i];
    let rest = sum % 11;
    const d1 = rest < 2 ? 0 : 11 - rest;
    if (digits[12] !== d1) return false;

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) sum += digits[i] * weights2[i];
    rest = sum % 11;
    const d2 = rest < 2 ? 0 : 11 - rest;
    if (digits[13] !== d2) return false;

    return true;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Gerador & Validador de CPF / CNPJ
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Padrão 4Devs
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cálculo oficial de dígitos verificadores (Módulo 11) para testes de QA e desenvolvimento.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setTab('cpf')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'cpf'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pessoa Física (CPF)
          </button>
          <button
            onClick={() => setTab('cnpj')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'cnpj'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pessoa Jurídica (CNPJ)
          </button>
        </div>
      </div>

      {tab === 'cpf' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Gerador de CPF */}
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> 1. Gerar CPF Válido
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={cpfWithMask}
                  onChange={(e) => setCpfWithMask(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                Pontuação (. e -)
              </label>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Estado de Origem (Opcional):
              </label>
              <select
                value={cpfStateOrigin}
                onChange={(e) => setCpfStateOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Aleatório (Qualquer Estado)</option>
                <option value="8">São Paulo (SP)</option>
                <option value="7">Rio de Janeiro / Espírito Santo (RJ/ES)</option>
                <option value="6">Minas Gerais (MG)</option>
                <option value="9">Paraná / Santa Catarina (PR/SC)</option>
                <option value="0">Rio Grande do Sul (RS)</option>
                <option value="1">DF, GO, MS, MT, TO</option>
                <option value="4">Pernambuco, Alagoas, Paraíba, RN</option>
                <option value="5">Bahia / Sergipe</option>
                <option value="3">Ceará, Maranhão, Piauí</option>
                <option value="2">Amazonas, Pará, RO, RR, AC, AP</option>
              </select>
            </div>

            <button
              onClick={() => setGeneratedCpf(generateValidCpf(cpfWithMask, cpfStateOrigin))}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Gerar Novo CPF
            </button>

            {generatedCpf && (
              <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="font-mono text-base font-bold text-emerald-400">
                  {generatedCpf}
                </span>
                <button
                  onClick={() => handleCopy(generatedCpf, 'gen-cpf')}
                  className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedField === 'gen-cpf' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Validador de CPF */}
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800/60">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 2. Validar CPF
            </span>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Insira o CPF (com ou sem máscara):
              </label>
              <input
                type="text"
                placeholder="Ex: 123.456.789-00 ou 12345678900"
                value={validateCpfInput}
                onChange={(e) => {
                  setValidateCpfInput(e.target.value);
                  if (e.target.value.replace(/\D/g, '').length === 11) {
                    setCpfValidationResult(validateCpf(e.target.value));
                  } else {
                    setCpfValidationResult(null);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => setCpfValidationResult(validateCpf(validateCpfInput))}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Verificar Validade
            </button>

            {cpfValidationResult !== null && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  cpfValidationResult.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {cpfValidationResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <p className="font-bold">
                    {cpfValidationResult.valid
                      ? 'CPF Válido perante o algoritmo oficial!'
                      : 'CPF Inválido! Falha no cálculo de dígitos verificadores.'}
                  </p>
                  {cpfValidationResult.valid && cpfValidationResult.state && (
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Região Fiscal de Emissão: <span className="text-emerald-300 font-bold">{cpfValidationResult.state}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Gerador de CNPJ */}
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> 1. Gerar CNPJ Válido
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={cnpjWithMask}
                  onChange={(e) => setCnpjWithMask(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                Pontuação (., / e -)
              </label>
            </div>

            <p className="text-[11px] text-slate-400">
              Gera número de CNPJ corporativo no formato matriz <code>0001</code> com dígitos calculados matematicamente.
            </p>

            <button
              onClick={() => setGeneratedCnpj(generateValidCnpj(cnpjWithMask))}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Gerar Novo CNPJ
            </button>

            {generatedCnpj && (
              <div className="p-3 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <span className="font-mono text-base font-bold text-emerald-400">
                  {generatedCnpj}
                </span>
                <button
                  onClick={() => handleCopy(generatedCnpj, 'gen-cnpj')}
                  className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedField === 'gen-cnpj' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Validador de CNPJ */}
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800/60">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 2. Validar CNPJ
            </span>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Insira o CNPJ (com ou sem máscara):
              </label>
              <input
                type="text"
                placeholder="Ex: 12.345.678/0001-90 ou 12345678000190"
                value={validateCnpjInput}
                onChange={(e) => {
                  setValidateCnpjInput(e.target.value);
                  if (e.target.value.replace(/\D/g, '').length === 14) {
                    setCnpjValidationResult(validateCnpj(e.target.value));
                  } else {
                    setCnpjValidationResult(null);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => setCnpjValidationResult(validateCnpj(validateCnpjInput))}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Verificar Validade
            </button>

            {cnpjValidationResult !== null && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  cnpjValidationResult
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {cnpjValidationResult ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <p className="font-bold">
                    {cnpjValidationResult
                      ? 'CNPJ Válido perante o algoritmo oficial!'
                      : 'CNPJ Inválido! Falha na checagem dos dígitos verificadores.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>⚠️ Dados gerados exclusivamente para fins de testes de software e validação de código.</span>
        <span className="text-slate-400 font-bold">100% Client-Side · Zero Telemetria</span>
      </div>
    </div>
  );
}
