'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, QrCode, Phone, Sparkles, Send } from 'lucide-react';

export function WhatsAppLinkGenerator() {
  const [ddi, setDdi] = useState('55');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Olá! Vim pelo seu anúncio e gostaria de mais informações.');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);

  // Formatted Clean Phone
  const cleanPhone = useMemo(() => {
    return phone.replace(/\D/g, '');
  }, [phone]);

  const fullNumber = useMemo(() => {
    return `${ddi}${cleanPhone}`;
  }, [ddi, cleanPhone]);

  // Generated Link
  const generatedLink = useMemo(() => {
    if (!cleanPhone) return '';
    const encodedMsg = encodeURIComponent(message);
    return `https://wa.me/${fullNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
  }, [fullNumber, message, cleanPhone]);

  const copyLink = () => {
    if (!generatedLink) return;
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(generatedLink).catch(() => {}); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentHour = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Emerald Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gerador de Link Direto de WhatsApp
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              INVERTEXTO BENCHMARK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Crie links diretos <code className="text-emerald-400">wa.me</code> com mensagem personalizada pré-preenchida e QR Code para celular.
          </p>
        </div>

        <button
          onClick={() => setShowQr(!showQr)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
            showQr
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          {showQr ? 'Ocultar QR Code' : 'Mostrar QR Code'}
        </button>
      </div>

      {/* Grid Principal: Formulário + Preview Interativo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Inputs (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Seletor DDI + Número de Telefone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Número de Telefone (com DDD)
            </label>
            <div className="flex items-center gap-2">
              <select
                value={ddi}
                onChange={(e) => setDdi(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 shrink-0 cursor-pointer"
              >
                <option value="55">🇧🇷 +55 (Brasil)</option>
                <option value="1">🇺🇸 +1 (EUA / Canadá)</option>
                <option value="351">🇵🇹 +351 (Portugal)</option>
                <option value="34">🇪🇸 +34 (Espanha)</option>
                <option value="44">🇬🇧 +44 (Reino Unido)</option>
                <option value="54">🇦🇷 +54 (Argentina)</option>
              </select>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 11 99999-8888"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Não se preocupe com parênteses ou traços, nós limpamos tudo automaticamente.
            </span>
          </div>

          {/* Mensagem Padrão */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Mensagem Inicial Pré-Formatada</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMessage('Olá! Quero tirar uma dúvida sobre seus serviços.')}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800 transition cursor-pointer"
                >
                  Dúvidas
                </button>
                <button
                  onClick={() => setMessage('Olá! Gostaria de fazer um orçamento com você.')}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800 transition cursor-pointer"
                >
                  Orçamento
                </button>
                <button
                  onClick={() => setMessage('Olá! Vi seu anúncio e quero comprar o produto.')}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800 transition cursor-pointer"
                >
                  Comprar
                </button>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite o texto que a pessoa já vai mandar pronta ao clicar no link..."
              className="w-full h-28 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition"
            />
          </div>

          {/* Link Gerado & Ações */}
          {generatedLink && (
            <div className="p-3.5 bg-slate-950/70 border border-emerald-500/30 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Link Direto Gerado</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 truncate focus:outline-none"
                />
                <button
                  onClick={copyLink}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                  title="Testar link em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Preview do Balão de WhatsApp + QR Code (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* WhatsApp Native Preview Bubble */}
          <div className="p-4 bg-[#0b141a] border border-[#1f2c34] rounded-2xl relative shadow-xl overflow-hidden">
            {/* WhatsApp Topbar Fictícia */}
            <div className="flex items-center gap-3 border-b border-[#1f2c34] pb-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                {cleanPhone ? cleanPhone.slice(-2) : 'WA'}
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {cleanPhone ? `+${fullNumber}` : 'Seu Cliente'}
                </span>
                <span className="text-[10px] text-emerald-400 block">online</span>
              </div>
            </div>

            {/* Balão de Mensagem */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none px-3.5 py-2 text-xs shadow-md relative">
                <p className="whitespace-pre-wrap leading-relaxed break-words">
                  {message || 'Sua mensagem aparecerá aqui...'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                  <span>{currentHour}</span>
                  <span className="text-cyan-400 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          {showQr && generatedLink && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-lg shrink-0 w-[96px] h-[96px] flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(generatedLink)}&margin=4`}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block mb-1">
                  Escanear no Smartphone
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  Aponte a câmera do seu celular para abrir a conversa instantaneamente no WhatsApp.
                </p>
                <button
                  onClick={copyLink}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copiar link wa.me
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
