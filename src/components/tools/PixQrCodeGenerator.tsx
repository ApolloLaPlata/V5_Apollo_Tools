'use client';

import React, { useState, useMemo } from 'react';
import { QrCode, Copy, Check, Download, ShieldCheck } from 'lucide-react';

export function PixQrCodeGenerator() {
  const [pixKey, setPixKey] = useState('pix@v5apollo.com');
  const [merchantName, setMerchantName] = useState('Holding V5 Apollo');
  const [merchantCity, setMerchantCity] = useState('SAO PAULO');
  const [amount, setAmount] = useState('49.90');
  const [copied, setCopied] = useState(false);

  // Algoritmo Oficial de CRC16-CCITT (Polinômio 0x1021, Init 0xFFFF) padrão BACEN
  const computeCrc16 = (payload: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  // Payload BR Code oficial BACEN com estrutura TLV (Type-Length-Value)
  const copiaColaCode = useMemo(() => {
    const cleanKey = pixKey.trim();
    if (!cleanKey) return '';

    const cleanName = merchantName.trim().toUpperCase().slice(0, 25) || 'RECEBEDOR';
    const cleanCity = merchantCity.trim().toUpperCase().slice(0, 15) || 'SAO PAULO';
    const numAmount = parseFloat(amount || '0');

    // 00: Format Indicator (01)
    const f00 = '000201';

    // 26: Merchant Account Information (Pix GUI + Chave)
    const gui = '0014br.gov.bcb.pix';
    const keyField = `01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
    const mai = `${gui}${keyField}`;
    const f26 = `26${mai.length.toString().padStart(2, '0')}${mai}`;

    // 52: Merchant Category Code (0000)
    const f52 = '52040000';
    // 53: Transaction Currency (986 = BRL)
    const f53 = '53039865';

    // 54: Transaction Amount (opcional, incluído se > 0)
    let f54 = '';
    if (numAmount > 0) {
      const formatted = numAmount.toFixed(2);
      f54 = `54${formatted.length.toString().padStart(2, '0')}${formatted}`;
    }

    // 58: Country Code (BR)
    const f58 = '5802BR';
    // 59: Merchant Name
    const f59 = `59${cleanName.length.toString().padStart(2, '0')}${cleanName}`;
    // 60: Merchant City
    const f60 = `60${cleanCity.length.toString().padStart(2, '0')}${cleanCity}`;
    // 62: Additional Data Field Template (TxID)
    const txid = '***';
    const txidField = `05${txid.length.toString().padStart(2, '0')}${txid}`;
    const f62 = `62${txidField.length.toString().padStart(2, '0')}${txidField}`;

    const rawPayload = `${f00}${f26}${f52}${f53}${f54}${f58}${f59}${f60}${f62}6304`;
    const crc = computeCrc16(rawPayload);
    return `${rawPayload}${crc}`;
  }, [pixKey, merchantName, merchantCity, amount]);

  // URL pública do QR Code com SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(copiaColaCode)}&margin=10`;

  const handleCopy = () => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(copiaColaCode).catch(() => {}); } catch {}
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
