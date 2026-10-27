'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Moon, 
  Sun, 
  Sparkles, 
  Compass, 
  Clock, 
  ArrowRight, 
  Copy, 
  Check, 
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Compass as ZodiacIcon
} from 'lucide-react';

export type CalendarAstronomyTab = 'idade-signos' | 'calendario-feriados' | 'fases-lua' | 'estacoes-dia-ano';

// ==========================================
// ALGORITMOS ASTRONÔMICOS E FISCAIS
// ==========================================

// Cálculo da Páscoa (Algoritmo Anônimo Gregoriano / Meeus)
function getEasterSunday(year: number): { day: number; month: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { day, month }; // mês 1 a 12
}

interface HolidayItem {
  name: string;
  dateStr: string; // YYYY-MM-DD
  day: number;
  month: number; // 1-12
  type: 'nacional' | 'facultativo';
}

function getBrazilianHolidays(year: number): HolidayItem[] {
  const easter = getEasterSunday(year);
  const easterDate = new Date(year, easter.month - 1, easter.day);

  const addDays = (base: Date, days: number): Date => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  const carnaval = addDays(easterDate, -47);
  const sextaSanta = addDays(easterDate, -2);
  const corpusChristi = addDays(easterDate, 60);

  const formatItem = (name: string, date: Date, type: 'nacional' | 'facultativo' = 'nacional'): HolidayItem => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { name, dateStr, day, month, type };
  };

  const holidays: HolidayItem[] = [
    { name: 'Confraternização Universal (Ano Novo)', dateStr: `${year}-01-01`, day: 1, month: 1, type: 'nacional' },
    formatItem('Carnaval (Ponto Facultativo)', carnaval, 'facultativo'),
    formatItem('Sexta-feira Santa / Paixão de Cristo', sextaSanta, 'nacional'),
    formatItem('Páscoa', easterDate, 'nacional'),
    { name: 'Tiradentes', dateStr: `${year}-04-21`, day: 21, month: 4, type: 'nacional' },
    { name: 'Dia do Trabalhador', dateStr: `${year}-05-01`, day: 1, month: 5, type: 'nacional' },
    formatItem('Corpus Christi (Ponto Facultativo)', corpusChristi, 'facultativo'),
    { name: 'Independência do Brasil', dateStr: `${year}-09-07`, day: 7, month: 9, type: 'nacional' },
    { name: 'Nossa Senhora Aparecida (Padroeira)', dateStr: `${year}-10-12`, day: 12, month: 10, type: 'nacional' },
    { name: 'Finados', dateStr: `${year}-11-02`, day: 2, month: 11, type: 'nacional' },
    { name: 'Proclamação da República', dateStr: `${year}-11-15`, day: 15, month: 11, type: 'nacional' },
    { name: 'Dia da Consciência Negra (Lei 14.759)', dateStr: `${year}-11-20`, day: 20, month: 11, type: 'nacional' },
    { name: 'Véspera de Natal (Ponto Facultativo)', dateStr: `${year}-12-24`, day: 24, month: 12, type: 'facultativo' },
    { name: 'Natal', dateStr: `${year}-12-25`, day: 25, month: 12, type: 'nacional' },
    { name: 'Véspera de Ano Novo (Ponto Facultativo)', dateStr: `${year}-12-31`, day: 31, month: 12, type: 'facultativo' },
  ];

  return holidays.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
}

// Algoritmo de Fase Lunar (Ciclo Sinódico 29.53058867 dias)
function getMoonPhaseDetails(date: Date) {
  // Data conhecida de Lua Nova: 2000-01-06 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)).getTime();
  const currentUtc = date.getTime();
  const diffDays = (currentUtc - knownNewMoon) / (1000 * 60 * 60 * 24);
  const cycleDays = 29.53058867;
  const phaseNormalized = (diffDays % cycleDays + cycleDays) % cycleDays; // 0 a 29.53
  const phaseFraction = phaseNormalized / cycleDays; // 0 a 1

  // Porcentagem de iluminação (0% na nova, 100% na cheia)
  const illuminationPercent = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

  let phaseName = 'Lua Nova';
  let phaseIcon = '🌑';
  let description = 'A face voltada para a Terra não recebe luz solar direta.';

  if (phaseFraction >= 0.03 && phaseFraction < 0.22) {
    phaseName = 'Crescente Côncava';
    phaseIcon = '🌒';
    description = 'Uma fina fatia iluminada surge no horizonte ocidental após o pôr do sol.';
  } else if (phaseFraction >= 0.22 && phaseFraction < 0.28) {
    phaseName = 'Quarto Crescente';
    phaseIcon = '🌓';
    description = 'Metade do disco lunar visível está iluminado (formato de semicírculo).';
  } else if (phaseFraction >= 0.28 && phaseFraction < 0.47) {
    phaseName = 'Crescente Gibosa';
    phaseIcon = '🌔';
    description = 'Mais da metade do disco está iluminada, aumentando até a lua cheia.';
  } else if (phaseFraction >= 0.47 && phaseFraction < 0.53) {
    phaseName = 'Lua Cheia';
    phaseIcon = '🌕';
    description = 'O disco lunar está 100% iluminado e visível durante toda a noite.';
  } else if (phaseFraction >= 0.53 && phaseFraction < 0.72) {
    phaseName = 'Minguante Gibosa';
    phaseIcon = '🌖';
    description = 'A área iluminada começa a encolher gradualmente.';
  } else if (phaseFraction >= 0.72 && phaseFraction < 0.78) {
    phaseName = 'Quarto Minguante';
    phaseIcon = '🌗';
    description = 'Metade do disco está iluminado, visível na segunda metade da madrugada.';
  } else if (phaseFraction >= 0.78 && phaseFraction < 0.97) {
    phaseName = 'Minguante Côncava';
    phaseIcon = '🌘';
    description = 'Uma fina fatia visível antes do amanhecer, preparando-se para o ciclo novo.';
  }

  return {
    phaseAgeDays: Number(phaseNormalized.toFixed(1)),
    illuminationPercent,
    phaseName,
    phaseIcon,
    description,
    phaseFraction
  };
}

// Zodíaco Ocidental & Horóscopo Chinês
function getZodiacSign(day: number, month: number) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: 'Áries', dates: '21/03 a 19/04', element: 'Fogo', symbol: '♈', planet: 'Marte', quality: 'Cardeal' };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: 'Touro', dates: '20/04 a 20/05', element: 'Terra', symbol: '♉', planet: 'Vênus', quality: 'Fixo' };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: 'Gêmeos', dates: '21/05 a 20/06', element: 'Ar', symbol: '♊', planet: 'Mercúrio', quality: 'Mutável' };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: 'Câncer', dates: '21/06 a 22/07', element: 'Água', symbol: '♋', planet: 'Lua', quality: 'Cardeal' };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: 'Leão', dates: '23/07 a 22/08', element: 'Fogo', symbol: '♌', planet: 'Sol', quality: 'Fixo' };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: 'Virgem', dates: '23/08 a 22/09', element: 'Terra', symbol: '♍', planet: 'Mercúrio', quality: 'Mutável' };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: 'Libra', dates: '23/09 a 22/10', element: 'Ar', symbol: '♎', planet: 'Vênus', quality: 'Cardeal' };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: 'Escorpião', dates: '23/10 a 21/11', element: 'Água', symbol: '♏', planet: 'Plutão / Marte', quality: 'Fixo' };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: 'Sagitário', dates: '22/11 a 21/12', element: 'Fogo', symbol: '♐', planet: 'Júpiter', quality: 'Mutável' };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { name: 'Capricórnio', dates: '22/12 a 19/01', element: 'Terra', symbol: '♑', planet: 'Saturno', quality: 'Cardeal' };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: 'Aquário', dates: '20/01 a 18/02', element: 'Ar', symbol: '♒', planet: 'Urano / Saturno', quality: 'Fixo' };
  } else {
    return { name: 'Peixes', dates: '19/02 a 20/03', element: 'Água', symbol: '♓', planet: 'Netuno / Júpiter', quality: 'Mutável' };
  }
}

function getChineseZodiac(year: number) {
  const animals = [
    { name: 'Rato', char: '鼠', element: 'Água' },
    { name: 'Boi', char: '牛', element: 'Terra' },
    { name: 'Tigre', char: '虎', element: 'Madeira' },
    { name: 'Coelho', char: '兔', element: 'Madeira' },
    { name: 'Dragão', char: '龙', element: 'Terra' },
    { name: 'Serpente', char: '蛇', element: 'Fogo' },
    { name: 'Cavalo', char: '马', element: 'Fogo' },
    { name: 'Cabra', char: '羊', element: 'Terra' },
    { name: 'Macaco', char: '猴', element: 'Metal' },
    { name: 'Galo', char: '鸡', element: 'Metal' },
    { name: 'Cão', char: '狗', element: 'Terra' },
    { name: 'Porco', char: '猪', element: 'Água' }
  ];
  // 1900 foi o ano do Rato
  const index = (year - 4) % 12;
  const positiveIndex = (index + 12) % 12;
  return animals[positiveIndex];
}

// Estações do Ano no Hemisfério Sul
function getSouthernSeason(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Outono: 20 de março a 20 de junho
  // Inverno: 21 de junho a 21 de setembro
  // Primavera: 22 de setembro a 20 de dezembro
  // Verão: 21 de dezembro a 19 de março

  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return { name: 'Outono', icon: '🍂', color: 'text-amber-400', period: '20 de Março a 20 de Junho', next: 'Inverno (21 de Junho)' };
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 21)) {
    return { name: 'Inverno', icon: '❄️', color: 'text-cyan-400', period: '21 de Junho a 21 de Setembro', next: 'Primavera (22 de Setembro)' };
  } else if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return { name: 'Primavera', icon: '🌸', color: 'text-emerald-400', period: '22 de Setembro a 20 de Dezembro', next: 'Verão (21 de Dezembro)' };
  } else {
    return { name: 'Verão', icon: '☀️', color: 'text-yellow-400', period: '21 de Dezembro a 19 de Março', next: 'Outono (20 de Março)' };
  }
}

// Dia do Ano e Semana ISO
function getDayOfYearAndWeek(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const isLeapYear = (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || (date.getFullYear() % 400 === 0);
  const totalDaysInYear = isLeapYear ? 366 : 365;
  const yearProgressPercent = ((dayOfYear / totalDaysInYear) * 100).toFixed(1);

  // Semana ISO 8601
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return { dayOfYear, totalDaysInYear, yearProgressPercent, weekNo, isLeapYear };
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function CalendarAndAstronomySuite({ defaultTab = 'idade-signos' }: { defaultTab?: CalendarAstronomyTab }) {
  const [activeTab, setActiveTab] = useState<CalendarAstronomyTab>(defaultTab);
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
  // TAB 1: IDADE & SIGNOS STATE
  // ==========================================
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const ageData = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate + 'T00:00:00');
    const target = targetDate ? new Date(targetDate + 'T00:00:00') : new Date();

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return null;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDaysLived = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalHoursLived = totalDaysLived * 24;
    const totalMinutesLived = totalHoursLived * 60;
    const totalSecondsLived = totalMinutesLived * 60;

    // Próximo aniversário
    let nextBdayYear = target.getFullYear();
    let nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    }
    const daysUntilNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    // Dia da semana do nascimento
    const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const bornWeekDay = weekDays[birth.getDay()];

    // Signo
    const zodiac = getZodiacSign(birth.getDate(), birth.getMonth() + 1);
    const chineseZodiac = getChineseZodiac(birth.getFullYear());

    return {
      years,
      months,
      days,
      totalDaysLived,
      totalHoursLived,
      totalMinutesLived,
      totalSecondsLived,
      daysUntilNextBday,
      bornWeekDay,
      zodiac,
      chineseZodiac
    };
  }, [birthDate, targetDate]);

  // ==========================================
  // TAB 2: CALENDÁRIO & FERIADOS STATE
  // ==========================================
  const [calYear, setCalYear] = useState<number>(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(new Date().getMonth() + 1); // 1-12

  const holidaysOfYear = useMemo(() => {
    return getBrazilianHolidays(calYear);
  }, [calYear]);

  const monthCalendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay(); // 0: Dom, 1: Seg...
    const daysInCurrentMonth = new Date(calYear, calMonth, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth - 1, 0).getDate();

    const days = [];
    // Dias do mês anterior
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateStr: '' });
    }
    // Dias do mês atual
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = holidaysOfYear.find(h => h.dateStr === dateStr);
      days.push({ day: d, isCurrentMonth: true, dateStr, holiday });
    }
    // Completar até 35 ou 42 dias na grade
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, dateStr: '' });
    }

    return days;
  }, [calYear, calMonth, holidaysOfYear]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // ==========================================
  // TAB 3: FASES DA LUA STATE
  // ==========================================
  const [moonDateInput, setMoonDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const moonInfo = useMemo(() => {
    const d = moonDateInput ? new Date(moonDateInput + 'T12:00:00') : new Date();
    return getMoonPhaseDetails(d);
  }, [moonDateInput]);

  // ==========================================
  // TAB 4: ESTAÇÕES DO ANO, DIA DO ANO STATE
  // ==========================================
  const [seasonDateInput, setSeasonDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const seasonInfo = useMemo(() => {
    const d = seasonDateInput ? new Date(seasonDateInput + 'T12:00:00') : new Date();
    const season = getSouthernSeason(d);
    const dayAndWeek = getDayOfYearAndWeek(d);
    return { season, ...dayAndWeek };
  }, [seasonDateInput]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Cyberpunk de Fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header da Suíte */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
              Benchmark Invertexto · Suíte de Tempo
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              100% Client-Side
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-cyan-400" />
            Calendário, Idade, Signos & Astronomia
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cálculo exato de idade com zodíaco, calendário anual com feriados federais, fases da lua e dados astronômicos.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('idade-signos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'idade-signos'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ZodiacIcon className="w-3.5 h-3.5" />
            Idade & Signos
          </button>
          <button
            onClick={() => setActiveTab('calendario-feriados')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'calendario-feriados'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendário & Feriados
          </button>
          <button
            onClick={() => setActiveTab('fases-lua')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'fases-lua'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Fases da Lua
          </button>
          <button
            onClick={() => setActiveTab('estacoes-dia-ano')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'estacoes-dia-ano'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Estações & Dia do Ano
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="relative z-10 pt-6">

        {/* ========================================================= */}
        {/* TAB 1: IDADE & SIGNOS */}
        {/* ========================================================= */}
        {activeTab === 'idade-signos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Data de Nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <label className="block text-xs font-mono text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Calcular Idade na Data (Padrão: Hoje)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {ageData ? (
              <div className="space-y-6">
                {/* Cartão de Destaque da Idade */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Idade Exata Calculada
                    </span>
                    <div className="text-3xl sm:text-5xl font-black text-white mt-1">
                      {ageData.years} <span className="text-lg font-normal text-slate-400">anos</span>, {ageData.months} <span className="text-lg font-normal text-slate-400">meses e</span> {ageData.days} <span className="text-lg font-normal text-slate-400">dias</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Nasceu em um(a) <strong className="text-cyan-300">{ageData.bornWeekDay}</strong>. Faltam <strong className="text-amber-300">{ageData.daysUntilNextBday} dias</strong> para o próximo aniversário.
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(`${ageData.years} anos, ${ageData.months} meses e ${ageData.days} dias`, 'age-summary')}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap"
                  >
                    {copiedKey === 'age-summary' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>Copiar Idade</span>
                  </button>
                </div>

                {/* Métricas de Tempo Vivido */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] font-mono text-slate-500 block">Total de Dias</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-slate-200 mt-0.5 block">
                      {ageData.totalDaysLived.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] font-mono text-slate-500 block">Total de Horas</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-slate-200 mt-0.5 block">
                      {ageData.totalHoursLived.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] font-mono text-slate-500 block">Total de Minutos</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-slate-200 mt-0.5 block">
                      {ageData.totalMinutesLived.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-[11px] font-mono text-slate-500 block">Total de Segundos</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-slate-200 mt-0.5 block">
                      {ageData.totalSecondsLived.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Signos do Zodíaco Ocidental & Chinês */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Zodíaco Ocidental */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Signo Ocidental
                      </span>
                      <span className="text-2xl">{ageData.zodiac.symbol}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">
                      {ageData.zodiac.name}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Período: {ageData.zodiac.dates}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Elemento:</span>
                        <strong className="text-amber-300 font-mono">{ageData.zodiac.element}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Regente:</span>
                        <strong className="text-slate-200 font-mono">{ageData.zodiac.planet}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Qualidade:</span>
                        <strong className="text-slate-200 font-mono">{ageData.zodiac.quality}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Horóscopo Chinês */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" /> Horóscopo Chinês
                      </span>
                      <span className="text-2xl font-serif text-rose-400">{ageData.chineseZodiac.char}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">
                      Ano do {ageData.chineseZodiac.name}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Elemento Fixo: {ageData.chineseZodiac.element}
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      Na astrologia oriental tradicional, o ciclo lunar de 12 animais e 5 elementos rege traços de personalidade e sinastria.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-slate-500 text-xs font-mono">
                Selecione uma data de nascimento válida no passado para calcular a idade.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CALENDÁRIO & FERIADOS BRASILEIROS */}
        {/* ========================================================= */}
        {activeTab === 'calendario-feriados' && (
          <div className="space-y-6">
            {/* Controles de Navegação de Mês e Ano */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (calMonth === 1) {
                      setCalMonth(12);
                      setCalYear(calYear - 1);
                    } else {
                      setCalMonth(calMonth - 1);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-base sm:text-lg font-bold font-mono text-slate-100 px-3">
                  {monthNames[calMonth - 1]} de {calYear}
                </div>
                <button
                  onClick={() => {
                    if (calMonth === 12) {
                      setCalMonth(1);
                      setCalYear(calYear + 1);
                    } else {
                      setCalMonth(calMonth + 1);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={calYear}
                  onChange={(e) => setCalYear(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const today = new Date();
                    setCalYear(today.getFullYear());
                    setCalMonth(today.getMonth() + 1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-mono font-bold transition cursor-pointer"
                >
                  Hoje
                </button>
              </div>
            </div>

            {/* Grid do Calendário */}
            <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800">
              {/* Cabeçalho dos Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-bold text-slate-400 pb-2 border-b border-slate-800/80">
                <div className="text-rose-400">Dom</div>
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div className="text-cyan-400">Sáb</div>
              </div>

              {/* Dias do Mês */}
              <div className="grid grid-cols-7 gap-1 pt-2">
                {monthCalendarDays.map((item, idx) => {
                  const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={idx}
                      className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                        !item.isCurrentMonth
                          ? 'bg-slate-950/20 border-transparent text-slate-600 opacity-40'
                          : item.holiday
                          ? item.holiday.type === 'nacional'
                            ? 'bg-rose-950/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950/20'
                            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                          : isToday
                          ? 'bg-cyan-950/30 border-cyan-500 text-cyan-200 font-bold'
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold ${isToday ? 'text-cyan-400' : ''}`}>
                          {item.day}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        )}
                      </div>

                      {item.holiday && (
                        <div className="text-[10px] leading-tight line-clamp-2 mt-1 font-sans font-medium">
                          {item.holiday.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista Oficial de Feriados Nacionais do Ano */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Todos os Feriados Nacionais de {calYear} (Brasil)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {holidaysOfYear.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${h.type === 'nacional' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                      <span className="text-slate-200 font-medium">{h.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 font-bold">
                      {String(h.day).padStart(2, '0')}/{String(h.month).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FASES DA LUA EM TEMPO REAL */}
        {/* ========================================================= */}
        {activeTab === 'fases-lua' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-sm">
              <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Selecionar Data Lunar
              </label>
              <input
                type="date"
                value={moonDateInput}
                onChange={(e) => setMoonDateInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Destaque Central da Fase Lunar */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
              <div className="text-7xl sm:text-8xl mb-4 select-none animate-pulse">
                {moonInfo.phaseIcon}
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Fase Atual Calculada
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-100 mt-1">
                {moonInfo.phaseName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                {moonInfo.description}
              </p>

              {/* Métricas Lunares */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mt-6 pt-6 border-t border-slate-800/80">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500 block">Iluminação</span>
                  <strong className="text-xl font-mono text-cyan-300 mt-0.5 block">
                    {moonInfo.illuminationPercent}%
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-500 block">Idade Lunar</span>
                  <strong className="text-xl font-mono text-amber-300 mt-0.5 block">
                    {moonInfo.phaseAgeDays} dias
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-mono text-slate-500 block">Ciclo Sinódico</span>
                  <strong className="text-xl font-mono text-slate-300 mt-0.5 block">
                    29.53 dias
                  </strong>
                </div>
              </div>
            </div>

            {/* Ciclo das 4 Fases Principais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-3xl block mb-1">🌑</span>
                <strong className="text-xs font-bold text-slate-200 block">Lua Nova</strong>
                <span className="text-[10px] text-slate-500 font-mono">0% Iluminação</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-3xl block mb-1">🌓</span>
                <strong className="text-xs font-bold text-slate-200 block">Quarto Crescente</strong>
                <span className="text-[10px] text-slate-500 font-mono">50% Iluminação</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-3xl block mb-1">🌕</span>
                <strong className="text-xs font-bold text-slate-200 block">Lua Cheia</strong>
                <span className="text-[10px] text-slate-500 font-mono">100% Iluminação</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-3xl block mb-1">🌗</span>
                <strong className="text-xs font-bold text-slate-200 block">Quarto Minguante</strong>
                <span className="text-[10px] text-slate-500 font-mono">50% Iluminação</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ESTAÇÕES DO ANO, DIA DO ANO & SEMANA */}
        {/* ========================================================= */}
        {activeTab === 'estacoes-dia-ano' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-sm">
              <label className="block text-xs font-mono text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Selecionar Data de Referência
              </label>
              <input
                type="date"
                value={seasonDateInput}
                onChange={(e) => setSeasonDateInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Destaque da Estação Atual no Brasil */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl select-none">{seasonInfo.season.icon}</div>
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    Hemisfério Sul (Brasil)
                  </span>
                  <div className={`text-3xl font-black ${seasonInfo.season.color}`}>
                    {seasonInfo.season.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Período: {seasonInfo.season.period}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-500 block">Próxima Virada de Estação</span>
                <strong className="text-sm font-bold text-slate-300 font-mono block mt-0.5">
                  {seasonInfo.season.next}
                </strong>
              </div>
            </div>

            {/* Métricas de Dia do Ano e Semana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs font-mono text-slate-500 block">Dia do Ano</span>
                <span className="text-3xl font-black font-mono text-cyan-400 mt-1 block">
                  {seasonInfo.dayOfYear} <span className="text-sm font-normal text-slate-500">/ {seasonInfo.totalDaysInYear}</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  {seasonInfo.isLeapYear ? 'Ano Bissexto (366 dias)' : 'Ano Regular (365 dias)'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs font-mono text-slate-500 block">Progresso do Ano</span>
                <span className="text-3xl font-black font-mono text-amber-400 mt-1 block">
                  {seasonInfo.yearProgressPercent}%
                </span>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${seasonInfo.yearProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs font-mono text-slate-500 block">Semana do Ano (ISO 8601)</span>
                <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
                  Semana {seasonInfo.weekNo}
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                  Padrão Internacional
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
