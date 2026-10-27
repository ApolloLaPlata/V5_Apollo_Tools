'use client';

import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Server, 
  ShieldCheck, 
  AlertTriangle, 
  Link2, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Sun, 
  Moon, 
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Code
} from 'lucide-react';

interface EmailAndTransactionalSuiteProps {
  defaultTab?: 'html-previewer' | 'smtp-ports' | 'dns-auth' | 'subject-tester' | 'mailto-builder';
}

export const EmailAndTransactionalSuite: React.FC<EmailAndTransactionalSuiteProps> = ({ defaultTab = 'html-previewer' }) => {
  const [activeTab, setActiveTab] = useState<'html-previewer' | 'smtp-ports' | 'dns-auth' | 'subject-tester' | 'mailto-builder'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: VISUALIZADOR HTML DE E-MAILS RESPONSIVOS
  // ==========================================
  const [htmlContent, setHtmlContent] = useState<string>(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; color: #f1f5f9; }
    .container { max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 32px 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .body { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .btn { display: inline-block; background-color: #06b6d4; color: #020617; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Holding V5 Apollo</h1>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Notificação de Acesso Seguro</p>
    </div>
    <div class="body">
      <h2 style="font-size: 18px; margin-top: 0; color: #e2e8f0;">Olá, Comandante!</h2>
      <p>Sua infraestrutura autônoma acaba de atingir o marco soberano de <strong>200+ ferramentas ativas</strong> no cluster da Capitania #11.</p>
      <p>Todos os sistemas estão operando em regime de alta disponibilidade com tempo de resposta sub-50ms.</p>
      <div style="text-align: center;">
        <a href="https://tools.v5apollo.com" class="btn">Acessar Painel Central</a>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Caso você não tenha solicitado este relatório, acesse suas credenciais de segurança imediatas.</p>
    </div>
    <div class="footer">
      &copy; 2026 Holding V5 Apollo. Todos os direitos reservados.<br>
      Porta Local Soberana :3009 · Não responda a este e-mail.
    </div>
  </div>
</body>
</html>`);

  const [viewportWidth, setViewportWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');

  const viewportWidthPixels = {
    desktop: '100%',
    tablet: '480px',
    mobile: '360px'
  }[viewportWidth];

  const htmlSizeKb = (new TextEncoder().encode(htmlContent).length / 1024).toFixed(2);

  // ==========================================
  // FERRAMENTA 2: DIAGNÓSTICO DE PORTAS SMTP / IMAP / POP3
  // ==========================================
  const mailProtocols = [
    {
      protocol: 'SMTP',
      name: 'Simple Mail Transfer Protocol (Envio)',
      ports: [
        { port: 587, type: 'Recomendada (STARTTLS)', description: 'Padrão moderno para envio autenticado por clientes e aplicações.' },
        { port: 465, type: 'SSL/TLS Implícito', description: 'Conexão criptografada direta (SMTPS) via túnel seguro.' },
        { port: 25, type: 'Legado / Relaying', description: 'Comunicação entre servidores (MTA para MTA). Bloqueada pela maioria dos provedores residenciais no Brasil.' }
      ]
    },
    {
      protocol: 'IMAP',
      name: 'Internet Message Access Protocol (Leitura com Sincronização)',
      ports: [
        { port: 993, type: 'SSL/TLS Seguro', description: 'Padrão moderno para sincronização de pastas e mensagens em múltiplos dispositivos.' },
        { port: 143, type: 'STARTTLS / Aberta', description: 'Porta padrão não criptografada ou negociada via STARTTLS.' }
      ]
    },
    {
      protocol: 'POP3',
      name: 'Post Office Protocol (Baixar & Descartar)',
      ports: [
        { port: 995, type: 'SSL/TLS Seguro', description: 'Download seguro de mensagens para armazenamento exclusivo na máquina local.' },
        { port: 110, type: 'Legado / Desprotegido', description: 'Porta padrão em texto claro, vulnerável a interceptação de senha.' }
      ]
    }
  ];

  // ==========================================
  // FERRAMENTA 3: GERADOR DE REGISTROS DNS DE AUTENTICAÇÃO (SPF, DKIM, DMARC)
  // ==========================================
  const [domainName, setDomainName] = useState<string>('v5apollo.com');
  const [spfProvider, setSpfProvider] = useState<'google' | 'microsoft' | 'sendgrid' | 'resend' | 'custom'>('google');
  const [customSpfInclude, setCustomSpfInclude] = useState<string>('_spf.v5apollo.internal');
  const [spfPolicy, setSpfPolicy] = useState<'-all' | '~all'>('~all'); // SoftFail vs HardFail
  const [dkimSelector, setDkimSelector] = useState<string>('apollo');
  const [dkimPublicKey, setDkimPublicKey] = useState<string>('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...');
  const [dmarcPolicy, setDmarcPolicy] = useState<'none' | 'quarantine' | 'reject'>('reject');
  const [dmarcEmail, setDmarcEmail] = useState<string>('dmarc-reports@v5apollo.com');

  const spfRecordValue = useMemo(() => {
    let includePart = '';
    if (spfProvider === 'google') includePart = 'include:_spf.google.com';
    else if (spfProvider === 'microsoft') includePart = 'include:spf.protection.outlook.com';
    else if (spfProvider === 'sendgrid') includePart = 'include:sendgrid.net';
    else if (spfProvider === 'resend') includePart = 'include:resend.com';
    else includePart = `include:${customSpfInclude}`;

    return `v=spf1 ${includePart} ${spfPolicy}`;
  }, [spfProvider, customSpfInclude, spfPolicy]);

  const dkimRecordName = `${dkimSelector}._domainkey.${domainName}`;
  const dkimRecordValue = `v=DKIM1; k=rsa; p=${dkimPublicKey}`;
  const dmarcRecordName = `_dmarc.${domainName}`;
  const dmarcRecordValue = `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail}; ruf=mailto:${dmarcEmail}; sp=${dmarcPolicy}; pct=100`;

  // ==========================================
  // FERRAMENTA 4: TESTADOR DE ASSUNTO DE E-MAIL & ANTI-SPAM
  // ==========================================
  const [subjectInput, setSubjectInput] = useState<string>('URGENTE: Acesse sua conta e ganhe R$ 500 GRÁTIS hoje mesmo!!!!!');

  const subjectAnalysis = useMemo(() => {
    const text = subjectInput.trim();
    const charCount = text.length;
    // Estimativa de pixels para fontes Sans-Serif médias no Gmail (~7.8px por caractere)
    const estimatedPixels = Math.round(charCount * 7.8);
    const isMobileTruncated = charCount > 40;
    const isDesktopTruncated = charCount > 60;

    // Lista de termos clássicos gatilho de filtro anti-spam
    const spamTriggerList = [
      'grátis', 'gratis', 'urgente', 'oportunidade única', 'ganhe dinheiro', 'renda extra',
      'promoção imperdível', 'clique aqui', '100% garantido', 'sorteio', 'lucro garantido',
      'fique rico', 'sem risco', 'parabéns você ganhou', 'aproveite agora'
    ];

    const detectedTriggers: string[] = [];
    spamTriggerList.forEach(trigger => {
      if (text.toLowerCase().includes(trigger)) {
        detectedTriggers.push(trigger);
      }
    });

    // Análise de maiúsculas excessivas
    const upperCount = (text.match(/[A-ZÀ-Ý]/g) || []).length;
    const letterCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    const isExcessiveUpper = letterCount > 0 && (upperCount / letterCount) > 0.45;

    // Análise de pontuação excessiva (!!!! ou ????)
    const isExcessivePunctuation = /[!?]{2,}/.test(text);

    // Cálculo do Score de Entregabilidade (0 a 100)
    let score = 100;
    if (detectedTriggers.length > 0) score -= detectedTriggers.length * 20;
    if (isExcessiveUpper) score -= 25;
    if (isExcessivePunctuation) score -= 15;
    if (charCount < 10) score -= 10;
    if (charCount > 70) score -= 10;
    score = Math.max(0, Math.min(100, score));

    return {
      charCount,
      estimatedPixels,
      isMobileTruncated,
      isDesktopTruncated,
      detectedTriggers,
      isExcessiveUpper,
      isExcessivePunctuation,
      score
    };
  }, [subjectInput]);

  // ==========================================
  // FERRAMENTA 5: CONSTRUTOR AVANÇADO DE LINKS MAILTO: RFC 6068
  // ==========================================
  const [mailtoTo, setMailtoTo] = useState<string>('contato@v5apollo.com');
  const [mailtoCc, setMailtoCc] = useState<string>('diretoria@v5apollo.com');
  const [mailtoBcc, setMailtoBcc] = useState<string>('');
  const [mailtoSubject, setMailtoSubject] = useState<string>('Parceria Comercial - Holding V5 Apollo');
  const [mailtoBody, setMailtoBody] = useState<string>(
    'Olá, Vinicius!\n\nGostaria de solicitar uma proposta comercial referente aos serviços e licenciamento das ferramentas da Capitania #11.\n\nFico no aguardo do retorno.'
  );

  const generatedMailtoUrl = useMemo(() => {
    const params: string[] = [];
    if (mailtoCc.trim()) params.push(`cc=${encodeURIComponent(mailtoCc.trim())}`);
    if (mailtoBcc.trim()) params.push(`bcc=${encodeURIComponent(mailtoBcc.trim())}`);
    if (mailtoSubject.trim()) params.push(`subject=${encodeURIComponent(mailtoSubject.trim())}`);
    if (mailtoBody.trim()) params.push(`body=${encodeURIComponent(mailtoBody.trim())}`);

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    return `mailto:${mailtoTo.trim()}${queryString}`;
  }, [mailtoTo, mailtoCc, mailtoBcc, mailtoSubject, mailtoBody]);

  const htmlLinkCode = `<a href="${generatedMailtoUrl}" target="_blank" rel="noopener noreferrer">Enviar E-mail</a>`;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              E-mails & Protocolos Transacionais
            </span>
            <span className="text-xs text-slate-500 font-mono">100% Client-Side Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-cyan-400" />
            Suíte de E-mails, Protocolos SMTP & Comunicação
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Visualizador de e-mails responsivos, portas SMTP/IMAP, construtor DNS SPF/DKIM/DMARC, detector de spam words e links mailto:.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setActiveTab('html-previewer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'html-previewer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          Previewer de HTML de E-mails
        </button>

        <button
          onClick={() => setActiveTab('smtp-ports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'smtp-ports'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          Portas & Protocolos SMTP/IMAP
        </button>

        <button
          onClick={() => setActiveTab('dns-auth')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'dns-auth'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          DNS SPF / DKIM / DMARC
        </button>

        <button
          onClick={() => setActiveTab('subject-tester')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'subject-tester'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Testador de Assunto & Anti-Spam
        </button>

        <button
          onClick={() => setActiveTab('mailto-builder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'mailto-builder'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Gerador de Links mailto: RFC 6068
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-4">
        {/* ABA 1: VISUALIZADOR HTML DE E-MAILS RESPONSIVOS */}
        {activeTab === 'html-previewer' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 mr-1">Viewport:</span>
                <button
                  onClick={() => setViewportWidth('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewportWidth === 'desktop' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop (100%)
                </button>
                <button
                  onClick={() => setViewportWidth('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewportWidth === 'tablet' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet (480px)
                </button>
                <button
                  onClick={() => setViewportWidth('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewportWidth === 'mobile' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile (360px)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">Tamanho: {htmlSizeKb} KB</span>
                <button
                  onClick={() => copyToClipboard(htmlContent, 'html-email')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 transition-all"
                >
                  {copiedKey === 'html-email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'html-email' ? 'HTML Copiado!' : 'Copiar HTML'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5">
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Código HTML do E-mail:
                </label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={15}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
                  placeholder="Cole o HTML do seu e-mail marketing aqui..."
                />
              </div>

              <div className="lg:col-span-7 flex flex-col items-center">
                <label className="text-xs font-medium text-slate-300 block mb-1 self-start">
                  Pré-visualização em Tempo Real (Iframe Sandbox):
                </label>
                <div 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-2 flex justify-center transition-all duration-300"
                  style={{ minHeight: '380px' }}
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={htmlContent}
                    sandbox="allow-same-origin"
                    className="border border-slate-800 rounded-lg shadow-inner bg-slate-950"
                    style={{ width: viewportWidthPixels, height: '360px', transition: 'width 0.3s ease' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: DIAGNÓSTICO DE PORTAS SMTP / IMAP / POP3 */}
        {activeTab === 'smtp-ports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mailProtocols.map(proto => (
                <div key={proto.protocol} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                      <Server className="w-5 h-5 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">{proto.protocol}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{proto.name}</p>

                    <div className="space-y-3">
                      {proto.ports.map(p => (
                        <div key={p.port} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs font-bold text-cyan-400">Porta {p.port}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-medium border border-blue-500/20">
                              {p.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-blue-300 block mb-0.5">Dica de Configuração para Aplicações Modernas (Next.js / Node / Python):</strong>
                Para envio transacional via SendGrid, Resend, Amazon SES ou Postmark, utilize sempre a porta <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">587</code> com STARTTLS ou a porta <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">465</code> com SSL direto. Evite a porta 25 em ambientes de nuvem pública (AWS, Azure e GCP a bloqueiam por padrão).
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: GERADOR DE REGISTROS DNS SPF / DKIM / DMARC */}
        {activeTab === 'dns-auth' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Seu Domínio de Envio:</label>
                <input
                  type="text"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500"
                  placeholder="exemplo.com.br"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Provedor de E-mail (SPF Include):</label>
                <select
                  value={spfProvider}
                  onChange={(e: any) => setSpfProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500"
                >
                  <option value="google">Google Workspace (include:_spf.google.com)</option>
                  <option value="microsoft">Microsoft 365 (include:spf.protection.outlook.com)</option>
                  <option value="sendgrid">SendGrid (include:sendgrid.net)</option>
                  <option value="resend">Resend (include:resend.com)</option>
                  <option value="custom">Personalizado / Servidor Próprio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Política SPF:</label>
                  <select
                    value={spfPolicy}
                    onChange={(e: any) => setSpfPolicy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500"
                  >
                    <option value="~all">~all (SoftFail - Recomendado)</option>
                    <option value="-all">-all (HardFail - Estrito)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Política DMARC:</label>
                  <select
                    value={dmarcPolicy}
                    onChange={(e: any) => setDmarcPolicy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500"
                  >
                    <option value="reject">p=reject (Bloqueia Spoofing)</option>
                    <option value="quarantine">p=quarantine (Spam Box)</option>
                    <option value="none">p=none (Apenas Monitora)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">E-mail de Relatórios DMARC (RUA):</label>
                <input
                  type="email"
                  value={dmarcEmail}
                  onChange={(e) => setDmarcEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Registros DNS Prontos para Copiar */}
            <div className="lg:col-span-7 space-y-3">
              {/* SPF */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-emerald-400">1. Registro SPF (TXT na raiz @)</span>
                  <button
                    onClick={() => copyToClipboard(spfRecordValue, 'dns-spf')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400"
                  >
                    {copiedKey === 'dns-spf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mb-1">Host: @ ou {domainName}</div>
                <pre className="text-xs font-mono text-slate-200 bg-slate-900/60 p-2 rounded-lg overflow-x-auto select-all">
                  {spfRecordValue}
                </pre>
              </div>

              {/* DKIM */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-emerald-400">2. Registro DKIM (TXT)</span>
                  <button
                    onClick={() => copyToClipboard(dkimRecordValue, 'dns-dkim')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400"
                  >
                    {copiedKey === 'dns-dkim' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mb-1">Host: {dkimRecordName}</div>
                <pre className="text-xs font-mono text-slate-200 bg-slate-900/60 p-2 rounded-lg overflow-x-auto select-all">
                  {dkimRecordValue}
                </pre>
              </div>

              {/* DMARC */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-emerald-400">3. Registro DMARC (TXT)</span>
                  <button
                    onClick={() => copyToClipboard(dmarcRecordValue, 'dns-dmarc')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400"
                  >
                    {copiedKey === 'dns-dmarc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mb-1">Host: {dmarcRecordName}</div>
                <pre className="text-xs font-mono text-slate-200 bg-slate-900/60 p-2 rounded-lg overflow-x-auto select-all">
                  {dmarcRecordValue}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: TESTADOR DE ASSUNTO DE E-MAIL & ANTI-SPAM */}
        {activeTab === 'subject-tester' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Assunto do E-mail para Testar:
              </label>
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                placeholder="Digite o assunto que você planeja enviar..."
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Score de Entregabilidade</span>
                <span className={`text-2xl font-black font-mono ${
                  subjectAnalysis.score >= 80 ? 'text-emerald-400' : subjectAnalysis.score >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {subjectAnalysis.score}/100
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {subjectAnalysis.score >= 80 ? 'Excelente' : subjectAnalysis.score >= 50 ? 'Risco Médio' : 'Alto Risco de Spam'}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Caracteres</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{subjectAnalysis.charCount}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Ideal: 30 a 50</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Largura Estimada</span>
                <span className="text-2xl font-black text-blue-400 font-mono">{subjectAnalysis.estimatedPixels}px</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Corte Mobile ~320px</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-xs text-slate-400 block mb-1">Spam Triggers</span>
                <span className={`text-2xl font-black font-mono ${subjectAnalysis.detectedTriggers.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {subjectAnalysis.detectedTriggers.length}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Palavras bloqueadas</span>
              </div>
            </div>

            {/* Diagnóstico Detalhado */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-200">Diagnóstico de Entregabilidade e Truncamento:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  subjectAnalysis.isMobileTruncated ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Visualização Mobile (Gmail / iOS Mail):</strong>
                    {subjectAnalysis.isMobileTruncated ? 'Provável corte com reticências (...) em telas de smartphone.' : 'Cabe confortavelmente na tela sem cortes.'}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  subjectAnalysis.detectedTriggers.length > 0 ? 'bg-red-950/20 border-red-500/30 text-red-300' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Palavras Gatilho Detectadas:</strong>
                    {subjectAnalysis.detectedTriggers.length > 0
                      ? `Contém: ${subjectAnalysis.detectedTriggers.join(', ')}`
                      : 'Nenhuma spam word óbvia detectada.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: GERADOR DE LINKS MAILTO: RFC 6068 */}
        {activeTab === 'mailto-builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Destinatário Principal (To):</label>
                <input
                  type="email"
                  value={mailtoTo}
                  onChange={(e) => setMailtoTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Cópia (CC):</label>
                  <input
                    type="text"
                    value={mailtoCc}
                    onChange={(e) => setMailtoCc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Cópia Oculta (BCC):</label>
                  <input
                    type="text"
                    value={mailtoBcc}
                    onChange={(e) => setMailtoBcc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Assunto do E-mail:</label>
                <input
                  type="text"
                  value={mailtoSubject}
                  onChange={(e) => setMailtoSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Corpo da Mensagem (Body):</label>
                <textarea
                  value={mailtoBody}
                  onChange={(e) => setMailtoBody(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-purple-500 resize-y leading-relaxed"
                />
              </div>
            </div>

            {/* Saída do Link e Código */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-purple-300">Link Direto (mailto: URL):</span>
                  <button
                    onClick={() => copyToClipboard(generatedMailtoUrl, 'mailto-url')}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'mailto-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar URL
                  </button>
                </div>
                <textarea
                  value={generatedMailtoUrl}
                  readOnly
                  rows={4}
                  className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 text-xs font-mono text-cyan-300 select-all"
                />

                <div className="mt-3 flex items-center justify-between">
                  <a
                    href={generatedMailtoUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-medium transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Testar e Abrir no Cliente de E-mail
                  </a>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-purple-300">Snippet HTML (&lt;a href="..."&gt;):</span>
                  <button
                    onClick={() => copyToClipboard(htmlLinkCode, 'mailto-html')}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'mailto-html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar HTML
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto select-all leading-relaxed">
                  {htmlLinkCode}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
