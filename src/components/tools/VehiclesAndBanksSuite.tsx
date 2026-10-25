'use client';

import React, { useState } from 'react';
import { Car, Landmark, Building2, Copy, Check, RefreshCw, CheckCircle2, XCircle, ShieldCheck, FileText, Sparkles, CheckCheck } from 'lucide-react';

const MARCAS_MODELOS: Record<string, string[]> = {
  'Chevrolet': ['Onix 1.0 Turbo', 'Tracker Premier 1.2', 'Cruze LTZ', 'S10 High Country', 'Spin Premier', 'Montana RS'],
  'Volkswagen': ['Polo TSI', 'T-Cross Highline', 'Nivus Comfortline', 'Virtus Exclusive', 'Amarok V6 Extreme', 'Taos Highline'],
  'Fiat': ['Strada Volcano', 'Pulse Audace', 'Fastback Limited', 'Toro Ranch Diesel', 'Argo Trekking', 'Mobi Like'],
  'Toyota': ['Corolla Altis Hybrid', 'Corolla Cross XRX', 'Hilux SRX 4x4', 'Yaris XLS Sedan', 'SW4 Diamond'],
  'Hyundai': ['HB20 Platinum Plus', 'Creta Ultimate 2.0', 'Tucson GLS', 'Santa Fe V6'],
  'Honda': ['Civic Touring', 'HR-V Advance', 'City Touring Sedan', 'ZR-V Touring'],
  'Jeep': ['Renegade Longitude T270', 'Compass Limited Diesel', 'Commander Overland 4x4']
};

export function VehiclesAndBanksSuite({ 
  defaultTab = 'veiculos' 
}: { 
  defaultTab?: 'veiculos' | 'veiculo-mock' | 'bancos' | 'validador-banco' | 'empresas' 
}) {
  const [activeTab, setActiveTab] = useState<'veiculos' | 'veiculo-mock' | 'bancos' | 'validador-banco' | 'empresas'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // --- PLACAS & RENAVAM STATE ---
  const [placaType, setPlacaType] = useState<'mercosul' | 'antiga'>('mercosul');
  const [placa, setPlaca] = useState('');
  const [renavam, setRenavam] = useState('');
  const [renavamValid, setRenavamValid] = useState<boolean | null>(null);
  const [inputRenavam, setInputRenavam] = useState('');

  // --- GERADOR DE VEÍCULOS COMPLETO (QA MOCK) ---
  const [vehicleMock, setVehicleMock] = useState<{
    marca: string;
    modelo: string;
    ano: string;
    cor: string;
    combustivel: string;
    valorFipe: string;
    placa: string;
    renavam: string;
    chassi: string;
  } | null>(null);

  // --- BANCOS STATE ---
  const [selectedBank, setSelectedBank] = useState<'bb' | 'bradesco' | 'itau' | 'caixa' | 'santander' | 'nubank'>('bb');
  const [bankData, setBankData] = useState<{ banco: string; agencia: string; conta: string; operacao?: string } | null>(null);

  // --- VALIDADOR DE CONTAS BANCÁRIAS STATE ---
  const [valBank, setValBank] = useState<'bb' | 'bradesco' | 'itau' | 'caixa' | 'santander' | 'nubank'>('bb');
  const [inputAgencia, setInputAgencia] = useState('');
  const [inputOperacao, setInputOperacao] = useState('013');
  const [inputConta, setInputConta] = useState('');
  const [bankValidationResult, setBankValidationResult] = useState<{ valid: boolean; message: string } | null>(null);

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

  // --- PLACA GENERATOR ---
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

  // --- RENAVAM GENERATOR & VALIDATOR ---
  const generateRenavam = () => {
    const d: number[] = [];
    for (let i = 0; i < 10; i++) d.push(Math.floor(Math.random() * 10));
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

  // --- GERADOR DE VEÍCULO COMPLETO (QA MOCK) ---
  const generateVehicleMock = () => {
    const marcas = Object.keys(MARCAS_MODELOS);
    const marca = marcas[Math.floor(Math.random() * marcas.length)];
    const modelos = MARCAS_MODELOS[marca];
    const modelo = modelos[Math.floor(Math.random() * modelos.length)];
    const anoFab = 2018 + Math.floor(Math.random() * 8);
    const anoMod = anoFab + (Math.random() > 0.5 ? 1 : 0);
    const cores = ['Branco Cristal', 'Preto Vulcano', 'Prata Bari', 'Cinza Silverstone', 'Vermelho Montecarlo', 'Azul Marinho', 'Verde Floresta'];
    const cor = cores[Math.floor(Math.random() * cores.length)];
    const combustiveis = ['Flex (Gasolina/Etanol)', 'Gasolina Aditivada', 'Diesel S10', 'Híbrido Leve', '100% Elétrico'];
    const combustivel = combustiveis[Math.floor(Math.random() * combustiveis.length)];
    const preco = (48000 + Math.floor(Math.random() * 155000)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Placa Mercosul
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const l1 = letters[Math.floor(Math.random() * 26)];
    const l2 = letters[Math.floor(Math.random() * 26)];
    const l3 = letters[Math.floor(Math.random() * 26)];
    const n1 = Math.floor(Math.random() * 10);
    const l4 = letters[Math.floor(Math.random() * 26)];
    const n2 = Math.floor(Math.random() * 10);
    const n3 = Math.floor(Math.random() * 10);
    const placaM = `${l1}${l2}${l3}${n1}${l4}${n2}${n3}`;

    // RENAVAM válido
    const d: number[] = [];
    for (let i = 0; i < 10; i++) d.push(Math.floor(Math.random() * 10));
    const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += d[i] * weights[i];
    let rest = (sum * 10) % 11;
    d.push(rest === 10 ? 0 : rest);
    const renavamVal = d.join('');

    // Chassi VIN (17 dígitos)
    const wmiList = ['9BW', '9BG', '9BD', '9BR', '9BH', '93H', '98R'];
    const wmi = wmiList[Math.floor(Math.random() * wmiList.length)];
    const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ';
    let vds = '';
    for (let i = 0; i < 6; i++) vds += chars[Math.floor(Math.random() * chars.length)];
    let vis = '';
    for (let i = 0; i < 8; i++) vis += chars[Math.floor(Math.random() * chars.length)];
    const chassi = `${wmi}${vds}${vis}`;

    setVehicleMock({
      marca,
      modelo,
      ano: `${anoFab}/${anoMod}`,
      cor,
      combustivel,
      valorFipe: preco,
      placa: placaM,
      renavam: renavamVal,
      chassi
    });
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

  // --- VALIDADOR DE CONTA BANCÁRIA ---
  const handleValidateBank = () => {
    const cleanAg = inputAgencia.replace(/\D/g, '');
    const cleanConta = inputConta.replace(/[^0-9kKxXpP]/g, '').toUpperCase();

    if (!cleanConta) {
      setBankValidationResult({ valid: false, message: 'Informe a conta corrente com o dígito verificador.' });
      return;
    }

    if (valBank === 'bb') {
      const contaDigits = cleanConta.slice(0, -1).split('').map(Number);
      const dvChar = cleanConta.slice(-1);
      let sum = 0;
      for (let i = 0; i < contaDigits.length; i++) sum += contaDigits[i] * (contaDigits.length + 1 - i);
      const rest = sum % 11;
      const expectedDv = rest === 10 ? 'X' : rest < 2 ? '0' : (11 - rest).toString();
      const valid = dvChar === expectedDv;
      setBankValidationResult({
        valid,
        message: valid ? 'Conta do Banco do Brasil VÁLIDA!' : `Dígito verificador do BB inválido (Esperado: ${expectedDv}).`
      });
      return;
    }

    if (valBank === 'bradesco') {
      const contaDigits = cleanConta.slice(0, -1).split('').map(Number);
      const dvChar = cleanConta.slice(-1);
      const weights = [2, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < contaDigits.length; i++) sum += contaDigits[i] * (weights[i % weights.length] || 2);
      const rest = sum % 11;
      const expectedDv = rest === 0 ? '0' : rest === 1 ? 'P' : (11 - rest).toString();
      const valid = dvChar === expectedDv;
      setBankValidationResult({
        valid,
        message: valid ? 'Conta do Bradesco VÁLIDA!' : `Dígito verificador do Bradesco inválido (Esperado: ${expectedDv}).`
      });
      return;
    }

    if (valBank === 'itau') {
      const ag4 = cleanAg.padStart(4, '0');
      const cc5 = cleanConta.slice(0, -1).padStart(5, '0');
      const dvChar = cleanConta.slice(-1);
      const full = (ag4 + cc5).split('').map(Number);
      let sum = 0;
      for (let i = 0; i < full.length; i++) {
        const mult = full[i] * (i % 2 === 0 ? 2 : 1);
        sum += Math.floor(mult / 10) + (mult % 10);
      }
      const rest = sum % 10;
      const expectedDv = rest === 0 ? '0' : (10 - rest).toString();
      const valid = dvChar === expectedDv;
      setBankValidationResult({
        valid,
        message: valid ? 'Conta do Itaú Unibanco VÁLIDA!' : `Dígito verificador do Itaú inválido (Esperado: ${expectedDv}).`
      });
      return;
    }

    if (valBank === 'caixa') {
      const ag4 = cleanAg.padStart(4, '0');
      const op3 = (inputOperacao || '013').padStart(3, '0');
      const cc8 = cleanConta.slice(0, -1).padStart(8, '0');
      const dvChar = cleanConta.slice(-1);
      const full = (ag4 + op3 + cc8).split('').map(Number);
      const weights = [8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < full.length; i++) sum += full[i] * weights[i];
      const rest = (sum * 10) % 11;
      const expectedDv = rest === 10 ? '0' : rest.toString();
      const valid = dvChar === expectedDv;
      setBankValidationResult({
        valid,
        message: valid ? 'Conta da Caixa Econômica Federal VÁLIDA!' : `Dígito verificador da Caixa inválido (Esperado: ${expectedDv}).`
      });
      return;
    }

    // Default Santander / Nubank
    const contaDigits = cleanConta.slice(0, -1).split('').map(Number);
    const dvChar = cleanConta.slice(-1);
    let sum = 0;
    for (let i = 0; i < contaDigits.length; i++) sum += contaDigits[i] * (contaDigits.length + 1 - i);
    const rest = sum % 11;
    const expectedDv = rest < 2 ? '0' : (11 - rest).toString();
    const valid = dvChar === expectedDv;
    setBankValidationResult({
      valid,
      message: valid ? 'Conta Bancária VÁLIDA!' : `Dígito verificador inválido (Esperado: ${expectedDv}).`
    });
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
    const cnpjRaw = d.join('');
    const cnpjFormatted = `${cnpjRaw.slice(0, 2)}.${cnpjRaw.slice(2, 5)}.${cnpjRaw.slice(5, 8)}/${cnpjRaw.slice(8, 12)}-${cnpjRaw.slice(12)}`;

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
    generateVehicleMock();
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
            Gerador de Placas & Veículos QA, Validador e Gerador de Contas Bancárias com DV oficial e Empresas B2B.
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1.5 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveTab('veiculos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'veiculos'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Placa & RENAVAM
          </button>
          <button
            onClick={() => setActiveTab('veiculo-mock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'veiculo-mock'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Veículo QA Completo
          </button>
          <button
            onClick={() => setActiveTab('bancos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bancos'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Gerar Conta
          </button>
          <button
            onClick={() => setActiveTab('validador-banco')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'validador-banco'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Validar Conta
          </button>
          <button
            onClick={() => setActiveTab('empresas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'empresas'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Empresas B2B
          </button>
        </div>
      </div>

      {/* ABA: PLACA & RENAVAM */}
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
                    <span className="text-[9px]">{placaType === 'mercosul' ? 'MERCOSUL' : 'CINZA'}</span>
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
                  title="Gerar nova placa"
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

      {/* ABA: VEÍCULO COMPLETO (QA MOCK) */}
      {activeTab === 'veiculo-mock' && vehicleMock && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Ficha Cadastral do Veículo (QA Testes)</span>
                <h3 className="text-lg font-bold text-white">{vehicleMock.marca} {vehicleMock.modelo}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(vehicleMock, null, 2), 'mock-json')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'mock-json' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>Copiar JSON</span>
                </button>
                <button
                  onClick={generateVehicleMock}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gerar Outro Veículo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Marca / Modelo</span>
                <span className="font-semibold text-slate-200 text-sm">{vehicleMock.marca} {vehicleMock.modelo}</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Ano Fab / Mod</span>
                <span className="font-semibold text-slate-200 text-sm">{vehicleMock.ano}</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cor do Veículo</span>
                <span className="font-semibold text-slate-200 text-sm">{vehicleMock.cor}</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Combustível</span>
                <span className="font-semibold text-slate-200 text-sm">{vehicleMock.combustivel}</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Placa Mercosul</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{vehicleMock.placa}</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">RENAVAM Válido</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{vehicleMock.renavam}</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl lg:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Número do Chassi (VIN 17 Dígitos)</span>
                <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-wider">{vehicleMock.chassi}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: GERADOR DE CONTAS BANCÁRIAS */}
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
                <span className="text-xs uppercase font-bold text-slate-400">Dados da Conta Gerada</span>
                <button
                  onClick={() => generateBankData(selectedBank)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Gerar Outra Conta
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Instituição Financeira</span>
                  <p className="text-sm font-bold text-slate-200">{bankData.banco}</p>
                </div>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Agência</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-bold text-cyan-300">{bankData.agencia}</p>
                    <button onClick={() => copyToClipboard(bankData.agencia, 'ag')} className="text-slate-400 hover:text-white">
                      {copiedKey === 'ag' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Conta Corrente</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-bold text-cyan-300">{bankData.conta}</p>
                    <button onClick={() => copyToClipboard(bankData.conta, 'cc')} className="text-slate-400 hover:text-white">
                      {copiedKey === 'cc' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: VALIDADOR DE CONTAS BANCÁRIAS */}
      {activeTab === 'validador-banco' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Verificação de Dígitos Verificadores Oficiais</span>
              <h3 className="text-base font-bold text-white">Validador de Agência & Conta Bancária</h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400">Selecione o Banco:</span>
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
                  onClick={() => {
                    setValBank(b.id as any);
                    setBankValidationResult(null);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    valBank === b.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Agência:</label>
                <input
                  type="text"
                  placeholder="Ex: 1234 ou 1234-5"
                  value={inputAgencia}
                  onChange={(e) => setInputAgencia(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {valBank === 'caixa' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Operação:</label>
                  <input
                    type="text"
                    placeholder="Ex: 013 (Poupança) ou 001"
                    value={inputOperacao}
                    onChange={(e) => setInputOperacao(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className={valBank === 'caixa' ? '' : 'md:col-span-2'}>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Conta Corrente (com DV):</label>
                <input
                  type="text"
                  placeholder="Ex: 12345678-9 ou 12345-6"
                  value={inputConta}
                  onChange={(e) => setInputConta(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleValidateBank}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" /> Validar Conta Bancária
              </button>
            </div>

            {bankValidationResult && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                bankValidationResult.valid
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                {bankValidationResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{bankValidationResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: EMPRESAS B2B */}
      {activeTab === 'empresas' && empresa && (
        <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Massa de Dados B2B</span>
              <h3 className="text-base font-bold text-white">{empresa.razaoSocial}</h3>
            </div>
            <button
              onClick={generateEmpresa}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Gerar Nova Empresa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Nome Fantasia</span>
              <p className="text-xs font-bold text-slate-200">{empresa.nomeFantasia}</p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">CNPJ Válido</span>
              <p className="text-xs font-mono font-bold text-cyan-300">{empresa.cnpj}</p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Inscrição Estadual</span>
              <p className="text-xs font-mono font-bold text-cyan-300">{empresa.ie}</p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Telefone</span>
              <p className="text-xs font-mono text-slate-300">{empresa.telefone}</p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 md:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Endereço</span>
              <p className="text-xs text-slate-300">{empresa.endereco}</p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Cidade / UF</span>
              <p className="text-xs text-slate-300">{empresa.cidadeUf}</p>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">CEP</span>
              <p className="text-xs font-mono text-slate-300">{empresa.cep}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
