'use client';

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  UserPlus, 
  Image as ImageIcon, 
  Gamepad2, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles,
  Palette,
  Eye,
  Sliders
} from 'lucide-react';

export type DevAndCvTabType = 'curriculo' | 'nicks' | 'nomes' | 'dummy-img';

interface ExperienciaItem {
  id: string;
  cargo: string;
  empresa: string;
  periodo: string;
  descricao: string;
}

interface EducacaoItem {
  id: string;
  curso: string;
  instituicao: string;
  ano: string;
}

export function DevAndCvSuite({ defaultTab = 'curriculo' }: { defaultTab?: DevAndCvTabType }) {
  const [activeTab, setActiveTab] = useState<DevAndCvTabType>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ==========================================
  // 1. GERADOR DE CURRÍCULO STATE
  // ==========================================
  const [cvNome, setCvNome] = useState('Vinícius Miranda de Oliveira');
  const [cvCargo, setCvCargo] = useState('Engenheiro de Software & Arquiteto de Soluções');
  const [cvEmail, setCvEmail] = useState('v5estudio@hotmail.com');
  const [cvTelefone, setCvTelefone] = useState('(11) 98765-4321');
  const [cvCidade, setCvCidade] = useState('São Paulo, SP');
  const [cvLinkedin, setCvLinkedin] = useState('linkedin.com/in/v5apollo');
  const [cvResumo, setCvResumo] = useState(
    'Profissional com mais de 8 anos de experiência em desenvolvimento full stack, arquitetura de sistemas distribuídos e computação de alta performance. Especialista no ecossistema Next.js, Node.js, automações de IA e infraestrutura cloud resiliente.'
  );

  const [experiencias, setExperiencias] = useState<ExperienciaItem[]>([
    {
      id: '1',
      cargo: 'Tech Lead / Engenheiro Sênior',
      empresa: 'Holding V5 Apollo',
      periodo: '2023 - Presente',
      descricao: 'Liderança técnica na arquitetura de micro-serviços, orquestração de GPU remota via Modal H100 e desenvolvimento de suítes de produtividade client-side com Next.js 14.'
    },
    {
      id: '2',
      cargo: 'Desenvolvedor Full Stack Sênior',
      empresa: 'Digital Solutions Lab',
      periodo: '2020 - 2023',
      descricao: 'Desenvolvimento e escalabilidade de aplicações web corporativas de alto tráfego com TypeScript, React, Tailwind CSS e APIs REST/GraphQL.'
    }
  ]);

  const [educacoes, setEducacoes] = useState<EducacaoItem[]>([
    {
      id: '1',
      curso: 'Bacharelado em Ciência da Computação',
      instituicao: 'Universidade de São Paulo (USP)',
      ano: '2016 - 2020'
    }
  ]);

  const [cvHabilidades, setCvHabilidades] = useState(
    'TypeScript, React, Next.js, Node.js, Python, Tailwind CSS, Docker, PostgreSQL, GraphQL, Git, CI/CD'
  );

  const addExperiencia = () => {
    setExperiencias([
      ...experiencias,
      {
        id: String(Date.now()),
        cargo: 'Cargo / Função',
        empresa: 'Nome da Empresa',
        periodo: '2022 - 2024',
        descricao: 'Principais responsabilidades, projetos entregues e resultados alcançados.'
      }
    ]);
  };

  const removeExperiencia = (id: string) => {
    setExperiencias(experiencias.filter((e) => e.id !== id));
  };

  const updateExperiencia = (id: string, field: keyof ExperienciaItem, value: string) => {
    setExperiencias(experiencias.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addEducacao = () => {
    setEducacoes([
      ...educacoes,
      {
        id: String(Date.now()),
        curso: 'Nome do Curso / Graduação',
        instituicao: 'Nome da Instituição',
        ano: '2021 - 2023'
      }
    ]);
  };

  const removeEducacao = (id: string) => {
    setEducacoes(educacoes.filter((e) => e.id !== id));
  };

  const updateEducacao = (id: string, field: keyof EducacaoItem, value: string) => {
    setEducacoes(educacoes.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handlePrintCv = () => {
    window.print();
  };

  // ==========================================
  // 2. GERADOR DE NICKS STATE
  // ==========================================
  const [baseNick, setBaseNick] = useState('Apollo');

  const generatedNicks = useMemo(() => {
    const raw = baseNick.trim() || 'Player';
    const clean = raw.toLowerCase();

    return [
      { category: 'Cyberpunk & Tático', nick: `⚡ ${raw} ⚡` },
      { category: 'Cyberpunk & Tático', nick: `[V5]_${raw}` },
      { category: 'Cyberpunk & Tático', nick: `xX_${raw}_Xx` },
      { category: 'Cyberpunk & Tático', nick: `✦ ${raw} ✦` },
      { category: 'Cyberpunk & Tático', nick: `彡${raw}彡` },
      { category: 'Leet & Gamer', nick: clean.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0').replace(/t/g, '7') },
      { category: 'Leet & Gamer', nick: `iAm_${raw}` },
      { category: 'Leet & Gamer', nick: `Lord_${raw}` },
      { category: 'Leet & Gamer', nick: `Shadow_${raw}` },
      { category: 'Leet & Gamer', nick: `Ghost_${raw}` },
      { category: 'Aesthetic & Símbolos', nick: `✿ ${raw} ✿` },
      { category: 'Aesthetic & Símbolos', nick: `꧁༒☬${raw}☬༒꧂` },
      { category: 'Aesthetic & Símbolos', nick: `亗 ${raw} 亗` },
      { category: 'Aesthetic & Símbolos', nick: `★ ${raw} ★` },
      { category: 'Aesthetic & Símbolos', nick: `『${raw}』` },
      { category: 'Aesthetic & Símbolos', nick: `ঔৣ☬✞${raw}✞☬ঔৣ` },
      { category: 'Minimalista & Pro', nick: `${raw}.exe` },
      { category: 'Minimalista & Pro', nick: `${raw}Prime` },
      { category: 'Minimalista & Pro', nick: `Neo${raw}` },
      { category: 'Minimalista & Pro', nick: `${raw}_OFFICIAL` }
    ];
  }, [baseNick]);

  // ==========================================
  // 3. GERADOR DE NOMES BRASILEIROS (IBGE)
  // ==========================================
  const [nomesGenero, setNomesGenero] = useState<'misto' | 'masculino' | 'feminino'>('misto');
  const [nomesQtd, setNomesQtd] = useState(10);
  const [qtdSobrenomes, setQtdSobrenomes] = useState<'1' | '2'>('2');
  const [nomesGerados, setNomesGerados] = useState<string[]>([]);

  const NOMES_MASCULINOS = [
    'Miguel', 'Arthur', 'Gael', 'Heitor', 'Théo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'Lucas',
    'Matheus', 'Pedro', 'Guilherme', 'Gustavo', 'Rafael', 'Felipe', 'Enzo', 'Nicolas', 'Henrique', 'Murilo',
    'Vinícius', 'Eduardo', 'Leonardo', 'Cauã', 'Isaac', 'Caio', 'Lucca', 'João Pedro', 'Pedro Henrique', 'Daniel'
  ];

  const NOMES_FEMININOS = [
    'Helena', 'Alice', 'Laura', 'Maria Alice', 'Sophia', 'Manuela', 'Maitê', 'Liz', 'Cecília', 'Isabella',
    'Luísa', 'Eloá', 'Heloísa', 'Júlia', 'Lívia', 'Maria Luísa', 'Lorena', 'Beatriz', 'Lara', 'Mariana',
    'Camila', 'Larissa', 'Gabriela', 'Letícia', 'Rafaela', 'Yasmin', 'Amanda', 'Bruna', 'Vitória', 'Bianca'
  ];

  const SOBRENOMES_IBGE = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
    'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
    'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas',
    'Cardoso', 'Ramos', 'Gonçalves', 'Santana', 'Teixeira', 'Moura', 'Castro', 'Cavalcanti', 'Pinto', 'Monteiro'
  ];

  const handleGerarNomes = () => {
    const list: string[] = [];
    for (let i = 0; i < nomesQtd; i++) {
      let pool = [...NOMES_MASCULINOS, ...NOMES_FEMININOS];
      if (nomesGenero === 'masculino') pool = NOMES_MASCULINOS;
      if (nomesGenero === 'feminino') pool = NOMES_FEMININOS;

      const pNome = pool[Math.floor(Math.random() * pool.length)];
      const s1 = SOBRENOMES_IBGE[Math.floor(Math.random() * SOBRENOMES_IBGE.length)];
      let s2 = '';
      if (qtdSobrenomes === '2') {
        const remaining = SOBRENOMES_IBGE.filter((s) => s !== s1);
        s2 = ' ' + remaining[Math.floor(Math.random() * remaining.length)];
      }
      list.push(`${pNome} ${s1}${s2}`);
    }
    setNomesGerados(list);
  };

  React.useEffect(() => {
    if (nomesGerados.length === 0) {
      handleGerarNomes();
    }
  }, []);

  // ==========================================
  // 4. PLACEHOLDER IMAGE GENERATOR (DUMMY IMAGE)
  // ==========================================
  const [dummyWidth, setDummyWidth] = useState(600);
  const [dummyHeight, setDummyHeight] = useState(400);
  const [dummyBgColor, setDummyBgColor] = useState('#0f172a');
  const [dummyTextColor, setDummyTextColor] = useState('#06b6d4');
  const [dummyCustomText, setDummyCustomText] = useState('');

  const displayDummyText = dummyCustomText.trim() || `${dummyWidth} × ${dummyHeight}`;

  const dummySvgCode = useMemo(() => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${dummyWidth}" height="${dummyHeight}" viewBox="0 0 ${dummyWidth} ${dummyHeight}">
  <rect width="100%" height="100%" fill="${dummyBgColor}"/>
  <line x1="0" y1="0" x2="${dummyWidth}" y2="${dummyHeight}" stroke="${dummyTextColor}" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="6,6"/>
  <line x1="0" y1="${dummyHeight}" x2="${dummyWidth}" y2="0" stroke="${dummyTextColor}" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="6,6"/>
  <circle cx="${dummyWidth / 2}" cy="${dummyHeight / 2}" r="${Math.min(dummyWidth, dummyHeight) * 0.22}" fill="none" stroke="${dummyTextColor}" stroke-width="1" stroke-opacity="0.2"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${Math.max(14, Math.floor(Math.min(dummyWidth, dummyHeight) / 10))}" font-weight="bold" fill="${dummyTextColor}">
    ${displayDummyText}
  </text>
</svg>`;
  }, [dummyWidth, dummyHeight, dummyBgColor, dummyTextColor, displayDummyText]);

  const dummyDataUri = useMemo(() => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(dummySvgCode)}`;
  }, [dummySvgCode]);

  const handleDownloadSvg = () => {
    const blob = new Blob([dummySvgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placeholder-${dummyWidth}x${dummyHeight}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Suíte de Desenvolvimento Pessoal & Utilitários QA
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              4DEVS BENCHMARK COMPLETO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gerador de currículo profissional com impressão nativa, criador de nicks estilizados, massa de nomes IBGE e imagens dummy SVG.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'curriculo', label: 'Gerador de Currículo', icon: Briefcase },
          { id: 'nicks', label: 'Gerador de Nicks', icon: Gamepad2 },
          { id: 'nomes', label: 'Gerador de Nomes (IBGE)', icon: UserPlus },
          { id: 'dummy-img', label: 'Imagem Placeholder (Dummy)', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          ABA 1: GERADOR DE CURRÍCULO
      ========================================== */}
      {activeTab === 'curriculo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna de Edição / Formulário (6 colunas) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase text-amber-400 block border-b border-slate-800 pb-2">
                  1. Dados Pessoais & Contato
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={cvNome}
                      onChange={(e) => setCvNome(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cargo Desejado</label>
                    <input
                      type="text"
                      value={cvCargo}
                      onChange={(e) => setCvCargo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">E-mail</label>
                    <input
                      type="email"
                      value={cvEmail}
                      onChange={(e) => setCvEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={cvTelefone}
                      onChange={(e) => setCvTelefone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cidade / Estado</label>
                    <input
                      type="text"
                      value={cvCidade}
                      onChange={(e) => setCvCidade(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">LinkedIn / Portfólio</label>
                    <input
                      type="text"
                      value={cvLinkedin}
                      onChange={(e) => setCvLinkedin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resumo Profissional</label>
                  <textarea
                    value={cvResumo}
                    onChange={(e) => setCvResumo(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* Experiências Profissionais */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-amber-400">2. Experiências Profissionais</span>
                  <button
                    onClick={addExperiencia}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {experiencias.map((exp) => (
                  <div key={exp.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 relative">
                    <button
                      onClick={() => removeExperiencia(exp.id)}
                      className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400"
                      title="Remover Experiência"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-2 pr-6">
                      <input
                        type="text"
                        value={exp.cargo}
                        onChange={(e) => updateExperiencia(exp.id, 'cargo', e.target.value)}
                        placeholder="Cargo"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={exp.empresa}
                        onChange={(e) => updateExperiencia(exp.id, 'empresa', e.target.value)}
                        placeholder="Empresa"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={exp.periodo}
                      onChange={(e) => updateExperiencia(exp.id, 'periodo', e.target.value)}
                      placeholder="Período (Ex: 2021 - 2023)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    />
                    <textarea
                      value={exp.descricao}
                      onChange={(e) => updateExperiencia(exp.id, 'descricao', e.target.value)}
                      placeholder="Descrição das responsabilidades..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Formação Acadêmica & Habilidades */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-amber-400">3. Formação & Habilidades</span>
                  <button
                    onClick={addEducacao}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Formação
                  </button>
                </div>

                {educacoes.map((edu) => (
                  <div key={edu.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 relative">
                    <button
                      onClick={() => removeEducacao(edu.id)}
                      className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={edu.curso}
                      onChange={(e) => updateEducacao(edu.id, 'curso', e.target.value)}
                      placeholder="Curso / Graduação"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.instituicao}
                        onChange={(e) => updateEducacao(edu.id, 'instituicao', e.target.value)}
                        placeholder="Instituição"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={edu.ano}
                        onChange={(e) => updateEducacao(edu.id, 'ano', e.target.value)}
                        placeholder="Ano de Conclusão"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Competências / Habilidades (Separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={cvHabilidades}
                    onChange={(e) => setCvHabilidades(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Coluna de Visualização / Impressão A4 (6 colunas) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Visualização do Documento (A4)
                </span>
                <button
                  onClick={handlePrintCv}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Salvar PDF
                </button>
              </div>

              {/* Folha A4 Renderizada */}
              <div 
                id="printable-cv"
                className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl font-sans text-xs space-y-5 max-h-[800px] overflow-y-auto border border-slate-200"
              >
                {/* Cabeçalho */}
                <div className="border-b-2 border-slate-900 pb-4">
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">{cvNome || 'Seu Nome'}</h1>
                  <p className="text-sm font-semibold text-amber-600 mt-0.5">{cvCargo || 'Cargo Almejado'}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-2">
                    {cvEmail && <span>✉️ {cvEmail}</span>}
                    {cvTelefone && <span>📞 {cvTelefone}</span>}
                    {cvCidade && <span>📍 {cvCidade}</span>}
                    {cvLinkedin && <span>🔗 {cvLinkedin}</span>}
                  </div>
                </div>

                {/* Resumo */}
                {cvResumo && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                      Resumo Profissional
                    </h2>
                    <p className="text-slate-700 leading-relaxed text-[11px]">{cvResumo}</p>
                  </div>
                )}

                {/* Experiência */}
                {experiencias.length > 0 && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                      Experiência Profissional
                    </h2>
                    <div className="space-y-3">
                      {experiencias.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-950 text-xs">{exp.cargo}</span>
                            <span className="text-[10px] font-mono text-slate-500">{exp.periodo}</span>
                          </div>
                          <span className="text-[11px] text-amber-700 font-semibold block">{exp.empresa}</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{exp.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formação Acadêmica */}
                {educacoes.length > 0 && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                      Formação Acadêmica
                    </h2>
                    <div className="space-y-2">
                      {educacoes.map((edu) => (
                        <div key={edu.id} className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-950 block">{edu.curso}</span>
                            <span className="text-slate-600 text-[11px]">{edu.instituicao}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{edu.ano}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habilidades */}
                {cvHabilidades && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                      Principais Competências
                    </h2>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cvHabilidades.split(',').map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200">
                          {h.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 2: GERADOR DE NICKS ESTILIZADOS
      ========================================== */}
      {activeTab === 'nicks' && (
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Apelido / Nick Base:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={baseNick}
                  onChange={(e) => setBaseNick(e.target.value)}
                  placeholder="Digite seu nick..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const rnd = ['Apollo', 'Vektor', 'Nexus', 'Cypher', 'Krypton', 'Vortex', 'Phantom', 'Titan', 'Zero'];
                    setBaseNick(rnd[Math.floor(Math.random() * rnd.length)]);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition whitespace-nowrap cursor-pointer"
                >
                  Nick Aleatório
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Variações Estilizadas para Jogos & Redes:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {generatedNicks.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between transition group"
                  >
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                        {item.category}
                      </span>
                      <span className="text-sm font-mono font-bold text-white tracking-wide">
                        {item.nick}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.nick, `nick-${idx}`)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-amber-300 hover:bg-slate-700 transition cursor-pointer"
                      title="Copiar Nick"
                    >
                      {copiedKey === `nick-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 3: GERADOR DE NOMES BRASILEIROS (IBGE)
      ========================================== */}
      {activeTab === 'nomes' && (
        <div className="space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Controles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gênero:</label>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  {(['misto', 'masculino', 'feminino'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setNomesGenero(g)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize ${
                        nomesGenero === g ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sobrenomes:</label>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setQtdSobrenomes('1')}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                      qtdSobrenomes === '1' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    1 Sobrenome
                  </button>
                  <button
                    onClick={() => setQtdSobrenomes('2')}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                      qtdSobrenomes === '2' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    2 Sobrenomes
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Quantidade:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={nomesQtd}
                  onChange={(e) => setNomesQtd(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white text-center font-mono focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGerarNomes}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Nova Lista
              </button>
            </div>

            {/* Lista dos Nomes Gerados */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Nomes Brasileiros Gerados ({nomesGerados.length}):
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(nomesGerados.join('\n'), 'nomesList')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Copiar Lista (\n)
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(nomesGerados, null, 2), 'nomesJson')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
                  >
                    Copiar JSON
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {nomesGerados.map((nome, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">{nome}</span>
                    <button
                      onClick={() => copyToClipboard(nome, `nome-${idx}`)}
                      className="p-1 text-slate-500 hover:text-white"
                      title="Copiar Nome"
                    >
                      {copiedKey === `nome-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ABA 4: PLACEHOLDER IMAGE (DUMMY SVG)
      ========================================== */}
      {activeTab === 'dummy-img' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Configurações (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <span className="text-xs font-bold uppercase text-amber-400 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Dimensões & Cores
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Largura (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="3840"
                    value={dummyWidth}
                    onChange={(e) => setDummyWidth(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Altura (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="2160"
                    value={dummyHeight}
                    onChange={(e) => setDummyHeight(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Botões de Dimensões Populares */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { w: 300, h: 250, label: '300x250 (Medium Banner)' },
                  { w: 728, h: 90, label: '728x90 (Leaderboard)' },
                  { w: 800, h: 600, label: '800x600 (Card)' },
                  { w: 1200, h: 630, label: '1200x630 (OG Card)' },
                  { w: 1920, h: 1080, label: '1920x1080 (Full HD)' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setDummyWidth(preset.w);
                      setDummyHeight(preset.h);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white border border-slate-800"
                  >
                    {preset.w}x{preset.h}
                  </button>
                ))}
              </div>

              {/* Cores */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cor de Fundo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={dummyBgColor}
                      onChange={(e) => setDummyBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={dummyBgColor}
                      onChange={(e) => setDummyBgColor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cor do Texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={dummyTextColor}
                      onChange={(e) => setDummyTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={dummyTextColor}
                      onChange={(e) => setDummyTextColor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Texto Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  value={dummyCustomText}
                  onChange={(e) => setDummyCustomText(e.target.value)}
                  placeholder={`Padrão: ${dummyWidth} × ${dummyHeight}`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                />
              </div>
            </div>

            {/* Ações de Download e Cópia */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadSvg}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Baixar Arquivo SVG
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => copyToClipboard(dummySvgCode, 'svgCode')}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'svgCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Código SVG
                </button>
                <button
                  onClick={() => copyToClipboard(dummyDataUri, 'dataUri')}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'dataUri' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Data URI
                </button>
              </div>
            </div>
          </div>

          {/* Visualização da Imagem Gerada (7 colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center min-h-[350px]">
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-3">
                Preview Renderizado ({dummyWidth} × {dummyHeight} px)
              </span>

              <div className="max-w-full max-h-[360px] overflow-hidden rounded-xl border border-slate-800 shadow-2xl flex items-center justify-center bg-slate-950">
                <div 
                  className="w-full h-auto max-w-[500px]"
                  dangerouslySetInnerHTML={{ __html: dummySvgCode }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
