'use client';

import React, { useState, useEffect } from 'react';
import { User, Copy, Check, RefreshCw, Download, FileSpreadsheet, FileJson, Shield, MapPin, Phone, Mail, Calendar, KeyRound } from 'lucide-react';

interface MockPerson {
  nome: string;
  sexo: 'Masculino' | 'Feminino';
  idade: number;
  dataNascimento: string;
  cpf: string;
  rg: string;
  email: string;
  celular: string;
  cep: string;
  endereco: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  senhaMock: string;
}

const FIRST_NAMES_MALE = [
  'Lucas', 'Gabriel', 'Matheus', 'Felipe', 'Guilherme', 'Gustavo', 'Rafael', 'Bruno', 
  'Thiago', 'Leonardo', 'Rodrigo', 'Vinicius', 'Eduardo', 'Diego', 'Caio', 'Daniel', 
  'Marcelo', 'Alexandre', 'Fernando', 'Henrique', 'Danilo', 'Arthur', 'Bernardo', 'Heitor'
];

const FIRST_NAMES_FEMALE = [
  'Mariana', 'Beatriz', 'Camila', 'Larissa', 'Juliana', 'Amanda', 'Bruna', 'Fernanda', 
  'Leticia', 'Carolina', 'Gabriela', 'Patricia', 'Isabela', 'Helena', 'Alice', 'Sophia', 
  'Manuela', 'Valentina', 'Livia', 'Giovanna', 'Rafaela', 'Luana', 'Renata', 'Vanessa'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 
  'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 
  'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos'
];

const STATES_DATA: Record<string, { uf: string; cidades: string[]; ddds: string[]; digitCpf: number }> = {
  SP: { uf: 'SP', cidades: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'São José dos Campos'], ddds: ['11', '19', '13', '16', '15', '12'], digitCpf: 8 },
  RJ: { uf: 'RJ', cidades: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Cabo Frio', 'Duque de Caxias', 'Nova Iguaçu'], ddds: ['21', '22', '24'], digitCpf: 7 },
  MG: { uf: 'MG', cidades: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Ouro Preto', 'Montes Claros'], ddds: ['31', '34', '32', '38'], digitCpf: 6 },
  RS: { uf: 'RS', cidades: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria', 'Passo Fundo'], ddds: ['51', '54', '53', '55'], digitCpf: 0 },
  PR: { uf: 'PR', cidades: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu', 'Cascavel'], ddds: ['41', '43', '44', '45'], digitCpf: 9 },
  BA: { uf: 'BA', cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Ilhéus', 'Porto Seguro'], ddds: ['71', '75', '77', '73'], digitCpf: 5 },
  CE: { uf: 'CE', cidades: ['Fortaleza', 'Sobral', 'Juazeiro do Norte', 'Caucaia'], ddds: ['85', '88'], digitCpf: 3 },
  PE: { uf: 'PE', cidades: ['Recife', 'Olinda', 'Caruaru', 'Petrolina', 'Jaboatão dos Guararapes'], ddds: ['81', '87'], digitCpf: 4 },
  DF: { uf: 'DF', cidades: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras'], ddds: ['61'], digitCpf: 1 }
};

const LOGRADOUROS = [
  'Rua das Flores', 'Avenida Paulista', 'Rua XV de Novembro', 'Rua São Bento', 'Avenida Brasil', 
  'Rua Tiradentes', 'Avenida Sete de Setembro', 'Rua Rui Barbosa', 'Rua dos Andradas', 
  'Avenida Independência', 'Rua Bela Vista', 'Rua das Palmeiras', 'Rua Amazonas', 'Rua Bahia'
];

const BAIRROS = [
  'Centro', 'Jardins', 'Bela Vista', 'Copacabana', 'Moema', 'Boa Viagem', 'Moinhos de Vento', 
  'Savassi', 'Meireles', 'Vila Mariana', 'Pinheiros', 'Botafogo', 'Barra da Tijuca', 'Pituba'
];

export function FakePersonGenerator() {
  const [genderFilter, setGenderFilter] = useState<'any' | 'M' | 'F'>('any');
  const [stateFilter, setStateFilter] = useState<string>('any');
  const [withMask, setWithMask] = useState(true);
  const [person, setPerson] = useState<MockPerson | null>(null);
  const [batchSize, setBatchSize] = useState<number>(5);
  const [batchList, setBatchList] = useState<MockPerson[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const calculateCpf = (mask: boolean, forcedDigit?: number) => {
    const digits: number[] = [];
    for (let i = 0; i < 8; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    digits.push(forcedDigit !== undefined ? forcedDigit : Math.floor(Math.random() * 10));

    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += digits[i] * (10 - i);
    }
    let rest1 = sum1 % 11;
    const d1 = rest1 < 2 ? 0 : 11 - rest1;
    digits.push(d1);

    let sum2 = 0;
    for (let i = 0; i < 10; i++) {
      sum2 += digits[i] * (11 - i);
    }
    let rest2 = sum2 % 11;
    const d2 = rest2 < 2 ? 0 : 11 - rest2;
    digits.push(d2);

    const raw = digits.join('');
    return mask ? `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}` : raw;
  };

  const createSinglePerson = (gender: 'any' | 'M' | 'F', ufChoice: string, mask: boolean): MockPerson => {
    const isMale = gender === 'any' ? Math.random() > 0.5 : gender === 'M';
    const sexo: 'Masculino' | 'Feminino' = isMale ? 'Masculino' : 'Feminino';
    
    const firstName = isMale 
      ? FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]
      : FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
    
    const lastName1 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const lastName2 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const nome = `${firstName} ${lastName1} ${lastName2}`;

    const idade = Math.floor(Math.random() * 55) + 18;
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - idade;
    const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const dataNascimento = `${birthDay}/${birthMonth}/${birthYear}`;

    const ufs = Object.keys(STATES_DATA);
    const selectedUf = ufChoice !== 'any' && STATES_DATA[ufChoice] ? ufChoice : ufs[Math.floor(Math.random() * ufs.length)];
    const stateObj = STATES_DATA[selectedUf];

    const cpf = calculateCpf(mask, stateObj.digitCpf);
    const rgNum = Math.floor(Math.random() * 89999999 + 10000000).toString();
    const rg = mask ? `${rgNum.slice(0, 2)}.${rgNum.slice(2, 5)}.${rgNum.slice(5, 8)}-${Math.floor(Math.random() * 9)}` : `${rgNum}${Math.floor(Math.random() * 9)}`;

    const cidade = stateObj.cidades[Math.floor(Math.random() * stateObj.cidades.length)];
    const ddd = stateObj.ddds[Math.floor(Math.random() * stateObj.ddds.length)];
    const telRaw = `9${Math.floor(Math.random() * 8999 + 1000)}${Math.floor(Math.random() * 8999 + 1000)}`;
    const celular = mask ? `(${ddd}) ${telRaw.slice(0, 5)}-${telRaw.slice(5)}` : `${ddd}${telRaw}`;

    const cleanName = `${firstName.toLowerCase()}.${lastName1.toLowerCase()}`;
    const mailDomains = ['teste.com', 'qa-mail.com', 'empresa-exemplo.com.br', 'inboxmock.com'];
    const email = `${cleanName}${Math.floor(Math.random() * 99)}@${mailDomains[Math.floor(Math.random() * mailDomains.length)]}`;

    const cepPrefix = Math.floor(Math.random() * 89999 + 10000).toString();
    const cepSuffix = Math.floor(Math.random() * 899 + 100).toString();
    const cep = mask ? `${cepPrefix.slice(0, 5)}-${cepSuffix}` : `${cepPrefix}${cepSuffix}`;

    const endereco = LOGRADOUROS[Math.floor(Math.random() * LOGRADOUROS.length)];
    const numero = Math.floor(Math.random() * 1500) + 12;
    const bairro = BAIRROS[Math.floor(Math.random() * BAIRROS.length)];

    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let senhaMock = '';
    for (let i = 0; i < 10; i++) {
      senhaMock += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return {
      nome,
      sexo,
      idade,
      dataNascimento,
      cpf,
      rg,
      email,
      celular,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      estado: selectedUf,
      senhaMock
    };
  };

  const handleGenerate = () => {
    if (activeTab === 'single') {
      setPerson(createSinglePerson(genderFilter, stateFilter, withMask));
    } else {
      const list: MockPerson[] = [];
      for (let i = 0; i < batchSize; i++) {
        list.push(createSinglePerson(genderFilter, stateFilter, withMask));
      }
      setBatchList(list);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [activeTab]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllPerson = () => {
    if (!person) return;
    const fullText = `Nome: ${person.nome}
Sexo: ${person.sexo}
Idade: ${person.idade} anos (${person.dataNascimento})
CPF: ${person.cpf}
RG: ${person.rg}
E-mail: ${person.email}
Celular: ${person.celular}
Endereço: ${person.endereco}, nº ${person.numero} - ${person.bairro}
Cidade/UF: ${person.cidade}/${person.estado}
CEP: ${person.cep}
Senha Sugerida: ${person.senhaMock}`;
    copyToClipboard(fullText, 'all');
  };

  const downloadJson = () => {
    const data = activeTab === 'single' ? person : batchList;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_pessoas_${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadCsv = () => {
    const list = activeTab === 'single' && person ? [person] : batchList;
    if (list.length === 0) return;
    const headers = ['Nome', 'Sexo', 'Idade', 'Nascimento', 'CPF', 'RG', 'Email', 'Celular', 'CEP', 'Endereco', 'Numero', 'Bairro', 'Cidade', 'Estado', 'Senha'];
    const rows = list.map(p => [
      `"${p.nome}"`, p.sexo, p.idade, p.dataNascimento, `"${p.cpf}"`, `"${p.rg}"`, p.email, `"${p.celular}"`, `"${p.cep}"`, `"${p.endereco}"`, p.numero, `"${p.bairro}"`, `"${p.cidade}"`, p.estado, `"${p.senhaMock}"`
    ].join(';'));
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_pessoas_${Date.now()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Decorativo Emerald */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gerador de Pessoas & Massa de Testes (QA)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              4DEVS BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gera dados fictícios completos e matematicamente válidos para testes de software, cadastros e QA.
          </p>
        </div>

        {/* Abas: Individual vs Lote */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pessoa Única
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Geração em Lote
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Controles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl mb-6">
        {/* Sexo */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gênero</label>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="any">Aleatório (50/50)</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>

        {/* Estado UF */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estado de Origem</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="any">Qualquer Estado</option>
            <option value="SP">São Paulo (SP)</option>
            <option value="RJ">Rio de Janeiro (RJ)</option>
            <option value="MG">Minas Gerais (MG)</option>
            <option value="RS">Rio Grande do Sul (RS)</option>
            <option value="PR">Paraná (PR)</option>
            <option value="BA">Bahia (BA)</option>
            <option value="CE">Ceará (CE)</option>
            <option value="PE">Pernambuco (PE)</option>
            <option value="DF">Distrito Federal (DF)</option>
          </select>
        </div>

        {/* Máscara Pontuação */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pontuação / Máscaras</label>
          <button
            onClick={() => setWithMask(!withMask)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              withMask
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {withMask ? 'Com Pontuação' : 'Apenas Números'}
          </button>
        </div>

        {/* Quantidade em Lote (se na aba lote) */}
        {activeTab === 'batch' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Quantidade</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value={5}>5 pessoas</option>
              <option value={10}>10 pessoas</option>
              <option value={20}>20 pessoas</option>
              <option value={50}>50 pessoas</option>
            </select>
          </div>
        )}

        {/* Botão de Gerar */}
        <div className={`col-span-2 sm:col-span-1 ${activeTab !== 'batch' ? 'lg:col-span-2' : ''} flex items-end`}>
          <button
            onClick={handleGenerate}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Gerar {activeTab === 'single' ? 'Nova Pessoa' : `${batchSize} Pessoas`}
          </button>
        </div>
      </div>

      {/* Conteúdo: Pessoa Única */}
      {activeTab === 'single' && person && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ficha Cadastral Fictícia
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyAllPerson}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedKey === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'all' ? 'Copiado!' : 'Copiar Tudo'}
              </button>
              <button
                onClick={downloadJson}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Nome */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Nome Completo</span>
                <span className="text-sm font-semibold text-white">{person.nome}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.nome, 'nome')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'nome' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* CPF */}
            <div className="p-3.5 bg-slate-950/70 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> CPF Válido
                </span>
                <span className="text-sm font-mono font-bold text-emerald-300">{person.cpf}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.cpf, 'cpf')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'cpf' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* RG */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">RG</span>
                <span className="text-sm font-mono text-slate-200">{person.rg}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.rg, 'rg')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'rg' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Idade / Nascimento */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Idade / Nascimento
                </span>
                <span className="text-sm text-slate-200">
                  {person.idade} anos <span className="text-xs text-slate-400">({person.dataNascimento})</span>
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(person.dataNascimento, 'nasc')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'nasc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* E-mail */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> E-mail Mock
                </span>
                <span className="text-sm text-slate-200 truncate block">{person.email}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.email, 'email')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
              >
                {copiedKey === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Celular */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Celular (WhatsApp)
                </span>
                <span className="text-sm font-mono text-slate-200">{person.celular}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.celular, 'tel')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'tel' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* CEP */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> CEP
                </span>
                <span className="text-sm font-mono text-cyan-300">{person.cep}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.cep, 'cep')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'cep' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Endereço */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between md:col-span-2">
              <div className="truncate mr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Endereço & Número</span>
                <span className="text-sm text-slate-200 truncate block">
                  {person.endereco}, {person.numero} • {person.bairro} ({person.cidade} - {person.estado})
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(`${person.endereco}, ${person.numero} - ${person.bairro}, ${person.cidade}/${person.estado}`, 'end')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
              >
                {copiedKey === 'end' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Senha Mock */}
            <div className="p-3.5 bg-slate-950/70 border border-amber-500/20 rounded-2xl flex items-center justify-between md:col-span-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Senha Segura Sugerida para Cadastro
                </span>
                <span className="text-sm font-mono text-amber-300 font-bold">{person.senhaMock}</span>
              </div>
              <button
                onClick={() => copyToClipboard(person.senhaMock, 'senha')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedKey === 'senha' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo: Geração em Lote */}
      {activeTab === 'batch' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {batchList.length} Registros Fictícios Gerados
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadJson}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" />
                Exportar JSON
              </button>
              <button
                onClick={downloadCsv}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">CPF</th>
                  <th className="py-2.5 px-3">Celular</th>
                  <th className="py-2.5 px-3">Cidade/UF</th>
                  <th className="py-2.5 px-3">CEP</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {batchList.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition">
                    <td className="py-2 px-3 font-sans font-medium text-white">{p.nome}</td>
                    <td className="py-2 px-3 text-emerald-400">{p.cpf}</td>
                    <td className="py-2 px-3 text-slate-300">{p.celular}</td>
                    <td className="py-2 px-3 font-sans">{p.cidade}/{p.estado}</td>
                    <td className="py-2 px-3 text-cyan-300">{p.cep}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(p), `row-${idx}`)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Copiar JSON desta linha"
                      >
                        {copiedKey === `row-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
