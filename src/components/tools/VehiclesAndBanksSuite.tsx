'use client';

import React, { useState } from 'react';
import { Car, Landmark, Building2, Copy, Check, RefreshCw, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export function VehiclesAndBanksSuite({ defaultTab = 'veiculos' }: { defaultTab?: 'veiculos' | 'bancos' | 'empresas' }) {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'bancos' | 'empresas'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // --- VEÍCULOS STATE ---
  const [placaType, setPlacaType] = useState<'mercosul' | 'antiga'>('mercosul');
  const [placa, setPlaca] = useState('');
  const [renavam, setRenavam] = useState('');
  const [renavamValid, setRenavamValid] = useState<boolean | null>(null);
  const [inputRenavam, setInputRenavam] = useState('');

  // --- BANCOS STATE ---
  const [selectedBank, setSelectedBank] = useState<'bb' | 'bradesco' | 'itau' | 'caixa' | 'santander' | 'nubank'>('bb');
  const [bankData, setBankData] = useState<{ banco: string; agencia: string; conta: string; operacao?: string } | null>(null);

  // --- EMPRESAS STATE ---
  const [empresa, setEmpresa] = useState<{
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    ie: string;
    endereco: string;
    telefone: string;
    cidadeUf: string;
    cep: string;
  } | null>(null);

  // --- VEÍCULOS LOGIC ---
  const generatePlaca = (type: 'mercosul' | 'antiga') => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const l1 = letters[Math.floor(Math.random() * 26)];
    const l2 = letters[Math.floor(Math.random() * 26)];
    const l3 = letters[Math.floor(Math.random() * 26)];
    const n1 = Math.floor(Math.random() * 10);
    const n2 = Math.floor(Math.random() * 10);
    const n3 = Math.floor(Math.random() * 10);

    if (type === 'mercosul') {
      const l4 = letters[Math.floor(Math.random() * 26)];
      setPlaca(`${l1}${l2}${l3}${n1}${l4}${n2}${n3}`);
    } else {
      const n4 = Math.floor(Math.random() * 10);
      setPlaca(`${l1}${l2}${l3}-${n1}${n2}${n3}${n4}`);
    }
  };

  const generateRenavam = () => {
    const d: number[] = [];
    for (let i = 0; i < 10; i++) d.push(Math.floor(Math.random() * 10));
    // Official Renavam modulo 11
    const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += d[i] * weights[i];
    let rest = (sum * 10) % 11;
    let dv = rest === 10 ? 0 : rest;
    d.push(dv);
    setRenavam(d.join(''));
  };

  const validateRenavam = (val: string) => {
    setInputRenavam(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length !== 11) {
      setRenavamValid(null);
      return;
    }
    const d = clean.split('').map(Number);
    const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += d[i] * weights[i];
    let rest = (sum * 10) % 11;
    let dv = rest === 10 ? 0 : rest;
    setRenavamValid(d[10] === dv);
  };

  // --- BANCOS LOGIC ---
  const generateBankData = (bank: string) => {
    const calcDv = (digits: number[]) => {
      let sum = 0;
      for (let i = 0; i < digits.length; i++) sum += digits[i] * (digits.length + 1 - i);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    if (bank === 'bb') {
      const ag = Math.floor(Math.random() * 8999 + 1000).toString();
      const agDv = calcDv(ag.split('').map(Number));
      const cc = Math.floor(Math.random() * 89999999 + 10000000).toString();
      const ccDv = calcDv(cc.split('').map(Number));
      setBankData({ banco: '001 - Banco do Brasil S.A.', agencia: `${ag}-${agDv}`, conta: `${cc}-${ccDv}` });
    } else if (bank === 'bradesco') {
      const ag = Math.floor(Math.random() * 8999 + 1000).toString();
      const agDv = calcDv(ag.split('').map(Number));
      const cc = Math.floor(Math.random() * 8999999 + 1000000).toString();
      const ccDv = calcDv(cc.split('').map(Number));
      setBankData({ banco: '237 - Banco Bradesco S.A.', agencia: `${ag}-${agDv}`, conta: `${cc}-${ccDv}` });
    } else if (bank === 'itau') {
      const ag = Math.floor(Math.random() * 8999 + 1000).toString();
      const cc = Math.floor(Math.random() * 89999 + 10000).toString();
      const ccDv = calcDv((ag + cc).split('').map(Number));
      setBankData({ banco: '341 - Itaú Unibanco S.A.', agencia: ag, conta: `${cc}-${ccDv}` });
    } else if (bank === 'caixa') {
      const ag = Math.floor(Math.random() * 8999 + 1000).toString();
      const op = '013'; // Poupança
      const cc = Math.floor(Math.random() * 89999999 + 10000000).toString();
      const ccDv = calcDv((ag + op + cc).split('').map(Number));
      setBankData({ banco: '104 - Caixa Econômica Federal', agencia: ag, conta: `${cc}-${ccDv}`, operacao: op });
    } else if (bank === 'santander') {
      const ag = Math.floor(Math.random() * 8999 + 1000).toString();
      const cc = Math.floor(Math.random() * 89999999 + 10000000).toString();
      const ccDv = calcDv(cc.split('').map(Number));
      setBankData({ banco: '033 - Banco Santander (Brasil) S.A.', agencia: ag, conta: `${cc}-${ccDv}` });
    } else if (bank === 'nubank') {
      const cc = Math.floor(Math.random() * 8999999 + 1000000).toString();
      const ccDv = Math.floor(Math.random() * 9);
      setBankData({ banco: '260 - Nu Pagamentos S.A. (Nubank)', agencia: '0001', conta: `${cc}-${ccDv}` });
    }
  };

  // --- EMPRESAS LOGIC ---
  const generateEmpresa = () => {
    const prefixes = ['Apollo', 'Brasil', 'Nacional', 'Global', 'Prime', 'Inova', 'Alpha', 'Vektor', 'Nexus', 'Horizon'];
    const suffixes = ['Tecnologia', 'Comércio e Serviços', 'Logística', 'Distribuidora', 'Consultoria', 'Soluções Digitais'];
    const types = ['LTDA', 'S.A.', 'ME', 'EPP'];

    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    const t = types[Math.floor(Math.random() * types.length)];
    const razaoSocial = `${p} ${s} ${t}`;
    const nomeFantasia = `${p} ${s.split(' ')[0]}`;

    // CNPJ
    const d: number[] = [];
    for (let i = 0; i < 8; i++) d.push(Math.floor(Math.random() * 10));
    d.push(0, 0, 0, 1);
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
    const rawCnpj = d.join('');
    const cnpjFormatted = `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5, 8)}/${rawCnpj.slice(8, 12)}-${rawCnpj.slice(12)}`;

    const ie = `${Math.floor(Math.random() * 899 + 100)}.${Math.floor(Math.random() * 899 + 100)}.${Math.floor(Math.random() * 899 + 100)}.${Math.floor(Math.random() * 899 + 100)}`;
    const cep = `${Math.floor(Math.random() * 89999 + 10000)}-${Math.floor(Math.random() * 899 + 100)}`;
    const tel = `(11) 3${Math.floor(Math.random() * 899 + 100)}-${Math.floor(Math.random() * 8999 + 1000)}`;

    setEmpresa({
      razaoSocial,
      nomeFantasia,
      cnpj: cnpjFormatted,
      ie,
      endereco: 'Avenida das Nações Unidas, 14261 - Bloco B',
      cidadeUf: 'São Paulo/SP',
      cep,
      telefone: tel
    });
  };

  React.useEffect(() => {
    generatePlaca(placaType);
    generateRenavam();
    generateBankData(selectedBank);
    generateEmpresa();
  }, [placaType, selectedBank]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Amber/Cyan Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Veículos, Contas Bancárias & Empresas
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              4DEVS BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gerador de Placas Mercosul, Validador de RENAVAM, Contas Bancárias com DV oficial e Empresas Fictícias para QA.
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('veiculos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'veiculos'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Veículos & RENAVAM
          </button>
          <button
            onClick={() => setActiveTab('bancos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bancos'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Contas Bancárias
          </button>
          <button
            onClick={() => setActiveTab('empresas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'empresas'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Empresas QA
          </button>
        </div>
      </div>

      {/* ABA: VEÍCULOS */}
      {activeTab === 'veiculos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gerador de Placa */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 block">Gerador de Placa Veicular</span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setPlacaType('mercosul')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      placaType === 'mercosul' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Mercosul
                  </button>
                  <button
                    onClick={() => setPlacaType('antiga')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      placaType === 'antiga' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Tradicional
                  </button>
                </div>
              </div>

              {/* Placa Estilizada */}
              <div className="flex items-center justify-center p-4">
                <div className="border-4 border-slate-300 rounded-2xl bg-white text-slate-950 shadow-2xl overflow-hidden w-64 text-center">
                  <div className="bg-blue-700 text-white text-[10px] font-bold tracking-widest py-0.5 uppercase flex items-center justify-between px-3">
                    <span>🇧🇷 BRASIL</span>
                    <span className="text-[9px]">MERCOSUL</span>
                  </div>
                  <div className="py-3 font-mono font-black text-3xl tracking-widest">
                    {placa}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(placa, 'placa')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'placa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'placa' ? 'Placa Copiada!' : 'Copiar Placa'}
                </button>
                <button
                  onClick={() => generatePlaca(placaType)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gerador e Validador de RENAVAM */}
            <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-2">RENAVAM Válido Gerado</span>
                <div className="flex items-center gap-2">
                  <span className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-2 font-mono text-base font-bold text-cyan-300">
                    {renavam}
                  </span>
                  <button
                    onClick={() => copyToClipboard(renavam, 'renavam')}
                    className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    {copiedKey === 'renavam' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={generateRenavam}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400 block">Validar RENAVAM (11 dígitos)</span>
                <input
                  type="text"
                  value={inputRenavam}
                  onChange={(e) => validateRenavam(e.target.value)}
                  placeholder="Cole ou digite o RENAVAM..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                {renavamValid !== null && (
                  <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    renavamValid ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}>
                    {renavamValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>{renavamValid ? 'RENAVAM Válido pelo Algoritmo do Denatran' : 'RENAVAM Inválido'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: BANCOS */}
      {activeTab === 'bancos' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'bb', label: 'Banco do Brasil' },
              { id: 'bradesco', label: 'Bradesco' },
              { id: 'itau', label: 'Itaú' },
              { id: 'caixa', label: 'Caixa Econômica' },
              { id: 'santander', label: 'Santander' },
              { id: 'nubank', label: 'Nubank' }
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBank(b.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  selectedBank === b.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {bankData && (
            <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-cyan-400" /> {bankData.banco}
                </span>
                <button
                  onClick={() => generateBankData(selectedBank)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Gerar Outra Conta
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Agência</span>
                  <span className="text-base font-mono font-bold text-white">{bankData.agencia}</span>
                </div>

                {bankData.operacao && (
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Operação</span>
                    <span className="text-base font-mono font-bold text-amber-300">{bankData.operacao}</span>
                  </div>
                )}

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Conta Corrente</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{bankData.conta}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => copyToClipboard(`Banco: ${bankData.banco}\nAgência: ${bankData.agencia}\nConta: ${bankData.conta}`, 'bank')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'bank' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'bank' ? 'Dados Copiados!' : 'Copiar Dados Bancários'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: EMPRESAS */}
      {activeTab === 'empresas' && empresa && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ficha Empresarial Fictícia para Testes B2B
            </span>
            <button
              onClick={generateEmpresa}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Gerar Nova Empresa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Razão Social</span>
              <span className="text-sm font-semibold text-white">{empresa.razaoSocial}</span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Nome Fantasia</span>
              <span className="text-sm font-semibold text-white">{empresa.nomeFantasia}</span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">CNPJ Válido</span>
                <span className="text-sm font-mono font-bold text-emerald-300">{empresa.cnpj}</span>
              </div>
              <button
                onClick={() => copyToClipboard(empresa.cnpj, 'cnpj-emp')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'cnpj-emp' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Inscrição Estadual</span>
              <span className="text-sm font-mono text-slate-200">{empresa.ie}</span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl md:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Endereço Comercial & Telefone</span>
              <span className="text-xs text-slate-300 block">
                {empresa.endereco} • CEP: {empresa.cep} ({empresa.cidadeUf}) — Tel: {empresa.telefone}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
