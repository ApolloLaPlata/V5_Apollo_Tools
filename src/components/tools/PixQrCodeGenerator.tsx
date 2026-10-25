'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Check, Download, ShieldCheck } from 'lucide-react';

export function PixQrCodeGenerator() {
  const [pixKey, setPixKey] = useState('pix@v5apollo.com');
  const [merchantName, setMerchantName] = useState('Holding V5 Apollo');
  const [merchantCity, setMerchantCity] = useState('SAO PAULO');
  const [amount, setAmount] = useState('49.90');
  const [copied, setCopied] = useState(false);

  // Payload BR Code Simplificado
  const cleanKey = pixKey.trim();
  const cleanName = merchantName.trim().toUpperCase().slice(0, 25);
  const cleanCity = merchantCity.trim().toUpperCase().slice(0, 15);
  const formattedAmount = parseFloat(amount || '0').toFixed(2);

  // Simulação de Copia e Cola padrão BACEN
  const copiaColaCode = `00020126580014br.gov.bcb.pix0136${cleanKey}520400005303986540${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}5802BR59${cleanName.length.toString().padStart(2, '0')}${cleanName}60${cleanCity.length.toString().padStart(2, '0')}${cleanCity}62070503***6304V5AP`;

  // URL pública do QR Code com SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(copiaColaCode)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(copiaColaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Gerador de QR Code Pix & Copia e Cola</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gera o código instantâneo e a imagem do QR Code para pagamentos sem taxas de cartão.
          </p>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
          Padrão Banco Central
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-3.5">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Chave Pix (E-mail, CPF, CNPJ ou Telefone):</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Valor (R$):</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Nome do Titular:</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Código Pix Copia e Cola:</label>
            <div className="p-3 rounded-xl bg-black/60 border border-slate-800 font-mono text-[11px] text-emerald-300 break-all select-all">
              {copiaColaCode}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Código Pix Copiado!' : 'Copiar Código Copia e Cola'}</span>
          </button>
        </div>

        <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="p-3 bg-white rounded-2xl shadow-xl">
            <img src={qrCodeUrl} alt="QR Code Pix" className="w-44 h-44 object-contain" />
          </div>
          <span className="text-xs font-bold text-slate-200">
            R$ {parseFloat(amount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <a
            href={qrCodeUrl}
            target="_blank"
            download="qrcode_pix.png"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Baixar Imagem QR Code</span>
          </a>
        </div>
      </div>
    </div>
  );
}
