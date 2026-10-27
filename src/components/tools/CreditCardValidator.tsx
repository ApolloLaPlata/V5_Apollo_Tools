'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, ShieldAlert, Copy, Check, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface GeneratedCard {
  brand: string;
  number: string;
  formattedNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holder: string;
}

export function CreditCardValidator() {
  const [tab, setTab] = useState<'validate' | 'generate'>('generate');

  // Validate state
  const [inputNumber, setInputNumber] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    brand: string;
    length: number;
  } | null>(null);

  // Generate state
  const [selectedBrand, setSelectedBrand] = useState<'visa' | 'mastercard' | 'elo' | 'amex'>('visa');
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Detect Brand
  const detectBrand = (cleaned: string): string => {
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) return 'Mastercard';
    if (/^(401178|401179|438935|457631|504175|506699|5067|5090|627780|636297|636368)/.test(cleaned)) return 'Elo';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^606282/.test(cleaned)) return 'Hipercard';
    if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'Diners Club';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Desconhecida';
  };

  // Luhn Algorithm (Official Module 10)
  const checkLuhn = (numStr: string): boolean => {
    if (numStr.length < 13 || numStr.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;

    for (let i = numStr.length - 1; i >= 0; i--) {
      let digit = parseInt(numStr.charAt(i), 10);
      if (isNaN(digit)) return false;

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  const handleValidate = (val: string) => {
    setInputNumber(val);
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      setValidationResult(null);
      return;
    }

    const isValid = checkLuhn(cleaned);
    const brand = detectBrand(cleaned);
    setValidationResult({
      valid: isValid,
      brand,
      length: cleaned.length
    });
  };

  // Luhn Number Generator
  const generateCardNumber = (brand: 'visa' | 'mastercard' | 'elo' | 'amex'): string => {
    let prefix = '4';
    let targetLength = 16;

    if (brand === 'visa') {
      prefix = '4';
      targetLength = 16;
    } else if (brand === 'mastercard') {
      const mcPrefixes = ['51', '52', '53', '54', '55'];
      prefix = mcPrefixes[Math.floor(Math.random() * mcPrefixes.length)];
      targetLength = 16;
    } else if (brand === 'elo') {
      const eloPrefixes = ['5067', '457631', '504175', '401178'];
      prefix = eloPrefixes[Math.floor(Math.random() * eloPrefixes.length)];
      targetLength = 16;
    } else if (brand === 'amex') {
      prefix = Math.random() > 0.5 ? '34' : '37';
      targetLength = 15;
    }

    const digits: number[] = prefix.split('').map(Number);
    while (digits.length < targetLength - 1) {
      digits.push(Math.floor(Math.random() * 10));
    }

    // Calculate Luhn check digit
    let sum = 0;
    let shouldDouble = true; // since check digit is appended at end
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    digits.push(checkDigit);
    return digits.join('');
  };

  const handleGenerate = () => {
    const rawNumber = generateCardNumber(selectedBrand);
    let formatted = '';
    if (selectedBrand === 'amex') {
      formatted = `${rawNumber.slice(0, 4)} ${rawNumber.slice(4, 10)} ${rawNumber.slice(10)}`;
    } else {
      formatted = rawNumber.replace(/(\d{4})/g, '$1 ').trim();
    }

    const currentYear = new Date().getFullYear();
    const expiryYear = (currentYear + Math.floor(Math.random() * 5) + 1).toString();
    const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const cvvLength = selectedBrand === 'amex' ? 4 : 3;
    const cvv = Math.floor(Math.random() * (Math.pow(10, cvvLength) - Math.pow(10, cvvLength - 1)) + Math.pow(10, cvvLength - 1)).toString();

    const brandNames = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      elo: 'Elo',
      amex: 'American Express'
    };

    setGeneratedCard({
      brand: brandNames[selectedBrand],
      number: rawNumber,
      formattedNumber: formatted,
      expiryMonth,
      expiryYear,
      cvv,
      holder: 'USUARIO TESTE QA'
    });
  };

  React.useEffect(() => {
    handleGenerate();
  }, [selectedBrand]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllCardData = () => {
    if (!generatedCard) return;
    const all = `Bandeira: ${generatedCard.brand}
Número: ${generatedCard.number}
Validade: ${generatedCard.expiryMonth}/${generatedCard.expiryYear}
CVV: ${generatedCard.cvv}
Titular: ${generatedCard.holder}`;
    copyToClipboard(all, 'all');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Amber Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Cartão de Crédito: Validador & Gerador QA
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              4DEVS BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Algoritmo oficial de Luhn (Módulo 10). Geração e validação de números matematicamente válidos para testes de checkout e e-commerce.
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setTab('generate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'generate'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gerador de Testes
          </button>
          <button
            onClick={() => setTab('validate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'validate'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Validador de Luhn
          </button>
        </div>
      </div>

      {/* TAB 1: GERADOR DE TESTES */}
      {tab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controles de Geração (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Selecione a Bandeira Desejada
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['visa', 'mastercard', 'elo', 'amex'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                      selectedBrand === b
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b === 'amex' ? 'American Express' : b}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar Novos Dados Fictícios
            </button>

            {/* Aviso de QA */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-amber-300">Nota para Desenvolvedores:</strong> Os números gerados passam na validação matemática do algoritmo de Luhn dos gateways (Stripe, PagSeguro, Mercado Pago em modo sandbox), mas são fictícios e não cobram valores reais.
              </p>
            </div>
          </div>

          {/* Cartão Visual 3D + Dados Copiáveis (7 colunas) */}
          <div className="lg:col-span-7 space-y-4">
            {generatedCard && (
              <>
                {/* Cartão de Crédito Visual */}
                <div className="w-full max-w-md mx-auto aspect-[1.58/1] rounded-3xl p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                  {/* Linhas decorativas do chip */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-yellow-600 border border-yellow-200/40 shadow-inner flex items-center justify-center">
                      <div className="w-6 h-5 border border-yellow-900/40 rounded-sm" />
                    </div>
                    <span className="font-mono text-sm font-black uppercase text-amber-300 tracking-wider">
                      {generatedCard.brand}
                    </span>
                  </div>

                  {/* Número */}
                  <div className="my-auto">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">Número do Cartão</span>
                    <span className="text-lg sm:text-xl font-mono font-bold tracking-widest text-white">
                      {generatedCard.formattedNumber}
                    </span>
                  </div>

                  {/* Rodapé do Cartão */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block">Titular</span>
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        {generatedCard.holder}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Validade</span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {generatedCard.expiryMonth}/{generatedCard.expiryYear.slice(-2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">CVV</span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {generatedCard.cvv}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de Cópia Rápida */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(generatedCard.number, 'num')}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Número</span>
                    <span className="text-xs font-mono text-white flex items-center justify-between">
                      Copiar {copiedKey === 'num' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(`${generatedCard.expiryMonth}/${generatedCard.expiryYear}`, 'val')}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Validade</span>
                    <span className="text-xs font-mono text-white flex items-center justify-between">
                      {generatedCard.expiryMonth}/{generatedCard.expiryYear.slice(-2)} {copiedKey === 'val' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(generatedCard.cvv, 'cvv')}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer"
                  >
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">CVV</span>
                    <span className="text-xs font-mono text-amber-300 flex items-center justify-between">
                      {generatedCard.cvv} {copiedKey === 'cvv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </span>
                  </button>

                  <button
                    onClick={copyAllCardData}
                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-left transition cursor-pointer"
                  >
                    <span className="text-[10px] text-amber-400 uppercase block font-bold">Todos os Dados</span>
                    <span className="text-xs font-semibold text-amber-200 flex items-center justify-between">
                      {copiedKey === 'all' ? 'Copiado!' : 'Copiar Tudo'} {copiedKey === 'all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VALIDADOR DE LUHN */}
      {tab === 'validate' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Digite o número do cartão para validar
            </label>
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => handleValidate(e.target.value)}
              placeholder="Ex: 4532 0123 4567 8910"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Suporta números de 13 a 19 dígitos com ou sem espaços.
            </span>
          </div>

          {validationResult && (
            <div className={`p-5 rounded-2xl border transition-all ${
              validationResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {validationResult.valid ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {validationResult.valid ? 'Número Válido pelo Algoritmo de Luhn' : 'Número Inválido'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {validationResult.valid
                      ? 'O dígito verificador confere com o cálculo de Módulo 10 internacional.'
                      : 'O dígito verificador não confere com a soma de verificação.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bandeira Identificada</span>
                  <span className="font-semibold text-white">{validationResult.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total de Dígitos</span>
                  <span className="font-mono text-white">{validationResult.length} dígitos</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
