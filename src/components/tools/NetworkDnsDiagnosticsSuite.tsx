'use client';

import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  Layers, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  FileCode, 
  Network,
  Cpu,
  Clock,
  ArrowRight,
  ExternalLink,
  Sliders,
  Terminal,
  Zap
} from 'lucide-react';

interface NetworkDnsDiagnosticsSuiteProps {
  defaultTab?: 'ttl-calc' | 'records-builder' | 'hsts-inspector' | 'mtu-calc' | 'regex-validator';
}

export const NetworkDnsDiagnosticsSuite: React.FC<NetworkDnsDiagnosticsSuiteProps> = ({ defaultTab = 'ttl-calc' }) => {
  const [activeTab, setActiveTab] = useState<'ttl-calc' | 'records-builder' | 'hsts-inspector' | 'mtu-calc' | 'regex-validator'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CALCULADOR DE TTL & JANELA DE PROPAGAÇÃO DNS
  // ==========================================
  const [ttlValue, setTtlValue] = useState<number>(3600); // 1 hora padrão
  const [ttlUnit, setTtlUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('hours');
  const [negativeCachingTtl, setNegativeCachingTtl] = useState<number>(300); // SOA negative cache (5 min)
  const [timeSinceChange, setTimeSinceChange] = useState<number>(15); // minutos decorridos
  const [customResolverLatency, setCustomResolverLatency] = useState<number>(180); // minutos de cache de ISP

  const totalTtlSeconds = useMemo(() => {
    switch (ttlUnit) {
      case 'seconds': return Math.max(1, ttlValue);
      case 'minutes': return Math.max(1, ttlValue * 60);
      case 'hours': return Math.max(1, ttlValue * 3600);
      case 'days': return Math.max(1, ttlValue * 86400);
    }
  }, [ttlValue, ttlUnit]);

  const propagationStats = useMemo(() => {
    const elapsedSeconds = timeSinceChange * 60;
    const remainingSeconds = Math.max(0, totalTtlSeconds - elapsedSeconds);
    const percentage = Math.min(100, Math.round((elapsedSeconds / totalTtlSeconds) * 100));

    // Estimativas de status por resolver
    const resolvers = [
      { name: 'Cloudflare DNS (1.1.1.1)', adheresStrictly: true, minTtl: 30, estimatedProp: elapsedSeconds >= 300 ? 100 : Math.round((elapsedSeconds / 300) * 100) },
      { name: 'Google Public DNS (8.8.8.8)', adheresStrictly: true, minTtl: 60, estimatedProp: elapsedSeconds >= totalTtlSeconds ? 100 : percentage },
      { name: 'Quad9 Security (9.9.9.9)', adheresStrictly: true, minTtl: 60, estimatedProp: elapsedSeconds >= totalTtlSeconds ? 100 : percentage },
      { name: 'OpenDNS / Cisco Umbrella', adheresStrictly: false, minTtl: 300, estimatedProp: elapsedSeconds >= totalTtlSeconds + 600 ? 100 : Math.max(0, percentage - 10) },
      { name: 'ISPs Locais & Redes Móveis 4G/5G', adheresStrictly: false, minTtl: customResolverLatency * 60, estimatedProp: elapsedSeconds >= Math.max(totalTtlSeconds, customResolverLatency * 60) ? 100 : Math.round((elapsedSeconds / Math.max(totalTtlSeconds, customResolverLatency * 60)) * 100) },
    ];

    const formatTime = (secs: number) => {
      if (secs <= 0) return 'Propagação Concluída';
      const d = Math.floor(secs / 86400);
      const h = Math.floor((secs % 86400) / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0) parts.push(`${m}m`);
      if (s > 0 || parts.length === 0) parts.push(`${s}s`);
      return parts.join(' ');
    };

    return {
      totalTtlSeconds,
      elapsedSeconds,
      remainingSeconds,
      percentage,
      remainingFormatted: formatTime(remainingSeconds),
      totalFormatted: formatTime(totalTtlSeconds),
      resolvers
    };
  }, [totalTtlSeconds, timeSinceChange, customResolverLatency]);

  // ==========================================
  // FERRAMENTA 2: CONSTRUTOR & ANALISADOR DE REGISTROS DNS (BIND / RFC)
  // ==========================================
  const [recordType, setRecordType] = useState<'MX' | 'TXT_SPF' | 'TXT_DKIM' | 'TXT_DMARC' | 'CNAME' | 'SRV' | 'A'>('TXT_SPF');
  const [domainName, setDomainName] = useState<string>('v5apollo.com');
  const [recordTtl, setRecordTtl] = useState<number>(3600);

  // Parâmetros específicos
  const [mxPriority, setMxPriority] = useState<number>(10);
  const [mxTarget, setMxTarget] = useState<string>('mail.v5apollo.com.');

  const [spfInclude, setSpfInclude] = useState<string>('_spf.google.com');
  const [spfIp4, setSpfIp4] = useState<string>('185.199.108.153');
  const [spfAllPolicy, setSpfAllPolicy] = useState<'~all' | '-all' | '?all'>('~all');

  const [dkimSelector, setDkimSelector] = useState<string>('default');
  const [dkimPublicKey, setDkimPublicKey] = useState<string>('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...');

  const [dmarcPolicy, setDmarcPolicy] = useState<'none' | 'quarantine' | 'reject'>('reject');
  const [dmarcPct, setDmarcPct] = useState<number>(100);
  const [dmarcRua, setDmarcRua] = useState<string>('dmarc-reports@v5apollo.com');

  const [cnameTarget, setCnameTarget] = useState<string>('cname.vercel-dns.com.');

  const [srvService, setSrvService] = useState<string>('_sip');
  const [srvProto, setSrvProto] = useState<string>('_tcp');
  const [srvPriority, setSrvPriority] = useState<number>(10);
  const [srvWeight, setSrvWeight] = useState<number>(60);
  const [srvPort, setSrvPort] = useState<number>(5060);
  const [srvTarget, setSrvTarget] = useState<string>('sipserver.v5apollo.com.');

  const [aIp, setAIp] = useState<string>('76.76.21.21');

  const generatedDnsRecord = useMemo(() => {
    let rawBind = '';
    let explanation = '';
    let commonMistakes: string[] = [];

    const normDomain = domainName.endsWith('.') ? domainName : `${domainName}.`;

    switch (recordType) {
      case 'MX': {
        const targetClean = mxTarget.endsWith('.') ? mxTarget : `${mxTarget}.`;
        rawBind = `${domainName}.   ${recordTtl}   IN   MX   ${mxPriority}   ${targetClean}`;
        explanation = `Roteia e-mails recebidos para ${normDomain} com prioridade ${mxPriority} (menor número = maior preferência).`;
        if (!mxTarget.endsWith('.')) {
          commonMistakes.push(`Alerta BIND: "${mxTarget}" não termina com ponto final (.). Em servidores BIND/named, isso concatenará o domínio base resultando em "${mxTarget}.${domainName}".`);
        }
        break;
      }
      case 'TXT_SPF': {
        const parts = ['v=spf1'];
        if (spfIp4.trim()) parts.push(`ip4:${spfIp4.trim()}`);
        if (spfInclude.trim()) parts.push(`include:${spfInclude.trim()}`);
        parts.push(spfAllPolicy);
        const spfVal = parts.join(' ');
        rawBind = `${domainName}.   ${recordTtl}   IN   TXT   "${spfVal}"`;
        explanation = `Define a política SPF (Sender Policy Framework) autorizando servidores IP e serviços de e-mail a enviar em nome de ${normDomain}.`;
        if (spfAllPolicy === '?all') {
          commonMistakes.push('A política "?all" (Neutro) oferece baixa proteção contra spoofing. Recomenda-se "~all" (SoftFail) ou "-all" (HardFail).');
        }
        break;
      }
      case 'TXT_DKIM': {
        const host = `${dkimSelector}._domainkey.${domainName}.`;
        const val = `v=DKIM1; k=rsa; p=${dkimPublicKey.trim()}`;
        rawBind = `${host}   ${recordTtl}   IN   TXT   "${val}"`;
        explanation = `Chave pública DKIM (DomainKeys Identified Mail) no seletor "${dkimSelector}" para assinatura criptográfica de cabeçalhos RFC 6376.`;
        if (val.length > 255) {
          commonMistakes.push(`Aviso de String TXT RFC 1035: o valor possui ${val.length} caracteres (> 255). Em arquivos BIND, strings longas devem ser fatiadas em múltiplos blocos entre aspas: ("bloco1" "bloco2").`);
        }
        break;
      }
      case 'TXT_DMARC': {
        const host = `_dmarc.${domainName}.`;
        const parts = [`v=DMARC1; p=${dmarcPolicy}; pct=${dmarcPct}`];
        if (dmarcRua.trim()) parts.push(`rua=mailto:${dmarcRua.trim()}`);
        const val = parts.join('; ');
        rawBind = `${host}   ${recordTtl}   IN   TXT   "${val}"`;
        explanation = `Registro DMARC RFC 7489 orientando os servidores de destino sobre como agir caso SPF ou DKIM falhem (política: ${dmarcPolicy.toUpperCase()}).`;
        if (dmarcPolicy === 'none') {
          commonMistakes.push('Política "p=none" apenas gera relatórios e não bloqueia fraudadores. Considere migrar para "p=quarantine" ou "p=reject".');
        }
        break;
      }
      case 'CNAME': {
        const targetClean = cnameTarget.endsWith('.') ? cnameTarget : `${cnameTarget}.`;
        rawBind = `www.${domainName}.   ${recordTtl}   IN   CNAME   ${targetClean}`;
        explanation = `Apelido canônico (Canonical Name) redirecionando www.${normDomain} para o hostname de destino.`;
        if (!cnameTarget.endsWith('.')) {
          commonMistakes.push(`Alerta BIND: O destino "${cnameTarget}" não tem ponto final (.). Ele se tornará "${cnameTarget}.${domainName}".`);
        }
        commonMistakes.push('Regra Fundamental: Registros CNAME NUNCA devem ser configurados no ápice (domínio raiz @ / naked domain), pois violam a RFC 1034 (conflito com SOA e NS).');
        break;
      }
      case 'SRV': {
        const host = `${srvService}.${srvProto}.${domainName}.`;
        const targetClean = srvTarget.endsWith('.') ? srvTarget : `${srvTarget}.`;
        rawBind = `${host}   ${recordTtl}   IN   SRV   ${srvPriority} ${srvWeight} ${srvPort} ${targetClean}`;
        explanation = `Localizador de serviços SRV RFC 2782 para protocolos SIP, XMPP, LDAP ou Minecraft com peso e porta dedicados.`;
        break;
      }
      case 'A': {
        rawBind = `${domainName}.   ${recordTtl}   IN   A   ${aIp.trim()}`;
        explanation = `Registro de Endereço IPv4 (32-bit) associando o domínio diretamente a um IP de servidor.`;
        break;
      }
    }

    return {
      rawBind,
      explanation,
      commonMistakes
    };
  }, [recordType, domainName, recordTtl, mxPriority, mxTarget, spfInclude, spfIp4, spfAllPolicy, dkimSelector, dkimPublicKey, dmarcPolicy, dmarcPct, dmarcRua, cnameTarget, srvService, srvProto, srvPriority, srvWeight, srvPort, srvTarget, aIp]);

  // ==========================================
  // FERRAMENTA 3: INSPETOR & GERADOR HSTS (STRICT TRANSPORT SECURITY)
  // ==========================================
  const [hstsMaxAge, setHstsMaxAge] = useState<number>(31536000); // 1 ano (31536000s)
  const [hstsIncludeSubdomains, setHstsIncludeSubdomains] = useState<boolean>(true);
  const [hstsPreload, setHstsPreload] = useState<boolean>(true);
  const [hstsTargetDomain, setHstsTargetDomain] = useState<string>('tools.v5apollo.com');

  const hstsDirectives = useMemo(() => {
    const parts = [`max-age=${hstsMaxAge}`];
    if (hstsIncludeSubdomains) parts.push('includeSubDomains');
    if (hstsPreload) parts.push('preload');
    const headerValue = parts.join('; ');

    // Validação de Pré-requisitos para Preload List do Chrome (hstspreload.org)
    const preloadChecklist = [
      {
        title: 'Max-Age Mínimo de 1 Ano (>= 31536000s)',
        pass: hstsMaxAge >= 31536000,
        detail: `Atual: ${hstsMaxAge}s (${(hstsMaxAge / 86400).toFixed(0)} dias)`
      },
      {
        title: 'Diretiva includeSubDomains ativa',
        pass: hstsIncludeSubdomains,
        detail: hstsIncludeSubdomains ? 'Todos os subdomínios forçarão HTTPS' : 'Obrigatório para inclusão no Chrome Preload'
      },
      {
        title: 'Diretiva preload explícita',
        pass: hstsPreload,
        detail: hstsPreload ? 'Consenso fornecido para embutimento no binário dos navegadores' : 'Ausente'
      },
      {
        title: 'Submissão no Domínio Raiz (Apex)',
        pass: !hstsTargetDomain.startsWith('www.') && hstsTargetDomain.split('.').length <= 3,
        detail: 'O envio para hstspreload.org deve ser efetuado no domínio raiz (ex: v5apollo.com)'
      }
    ];

    const isPreloadEligible = preloadChecklist.every(c => c.pass);

    // Snippets para servidores
    const snippets = {
      nginx: `add_header Strict-Transport-Security "${headerValue}" always;`,
      apache: `Header always set Strict-Transport-Security "${headerValue}"`,
      caddy: `header Strict-Transport-Security "${headerValue}"`,
      vercel: JSON.stringify({
        headers: [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Strict-Transport-Security',
                value: headerValue
              }
            ]
          }
        ]
      }, null, 2),
      nextjs: `// Em next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: '${headerValue}',
          },
        ],
      },
    ];
  },
};`
    };

    return {
      headerValue,
      preloadChecklist,
      isPreloadEligible,
      snippets
    };
  }, [hstsMaxAge, hstsIncludeSubdomains, hstsPreload, hstsTargetDomain]);

  // ==========================================
  // FERRAMENTA 4: CALCULADORA DE MTU, MSS & OVERHEAD DE PACOTES
  // ==========================================
  const [mtuPreset, setMtuPreset] = useState<'standard' | 'pppoe' | 'wireguard' | 'openvpn' | 'jumbo' | 'custom'>('standard');
  const [customMtu, setCustomMtu] = useState<number>(1500);
  const [ipProtocol, setIpProtocol] = useState<'ipv4' | 'ipv6'>('ipv4');
  const [hasVlan, setHasVlan] = useState<boolean>(false);
  const [hasPppoe, setHasPppoe] = useState<boolean>(false);
  const [hasTcpTimestamp, setHasTcpTimestamp] = useState<boolean>(true);

  const mtuCalculations = useMemo(() => {
    let effectiveMtu = customMtu;
    if (mtuPreset === 'standard') effectiveMtu = 1500;
    else if (mtuPreset === 'pppoe') effectiveMtu = 1492;
    else if (mtuPreset === 'wireguard') effectiveMtu = 1420;
    else if (mtuPreset === 'openvpn') effectiveMtu = 1400;
    else if (mtuPreset === 'jumbo') effectiveMtu = 9000;

    const ipHeaderBytes = ipProtocol === 'ipv4' ? 20 : 40;
    const tcpHeaderBytes = 20 + (hasTcpTimestamp ? 12 : 0); // 12 bytes de TCP Options (Timestamps RFC 7323)
    const vlanBytes = hasVlan ? 4 : 0;
    const pppoeBytes = hasPppoe ? 8 : 0;

    const totalHeadersOverhead = ipHeaderBytes + tcpHeaderBytes;
    const mss = Math.max(0, effectiveMtu - totalHeadersOverhead);
    const linkLayerOverhead = 14 + 4 + vlanBytes + pppoeBytes; // Ethernet 14 + FCS 4
    const totalFrameSizeOnWire = effectiveMtu + linkLayerOverhead;
    const payloadEfficiency = effectiveMtu > 0 ? ((mss / totalFrameSizeOnWire) * 100).toFixed(1) : '0';

    return {
      effectiveMtu,
      ipHeaderBytes,
      tcpHeaderBytes,
      vlanBytes,
      pppoeBytes,
      totalHeadersOverhead,
      mss,
      totalFrameSizeOnWire,
      payloadEfficiency
    };
  }, [mtuPreset, customMtu, ipProtocol, hasVlan, hasPppoe, hasTcpTimestamp]);

  // ==========================================
  // FERRAMENTA 5: GERADOR & VALIDADOR DE REGEX DE REDE (IP / FQDN / CIDR)
  // ==========================================
  const [regexCategory, setRegexCategory] = useState<'ipv4' | 'ipv6' | 'cidr' | 'domain' | 'hostname'>('ipv4');
  const [testNetworkString, setTestNetworkString] = useState<string>('192.168.1.100');

  const regexPatterns = useMemo(() => {
    return {
      ipv4: {
        title: 'IPv4 Estrito (0-255 com 4 octetos)',
        pattern: '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
        description: 'Valida endereços IPv4 decimais exatos de 0.0.0.0 até 255.255.255.255 sem aceitar octetos inválidos como 256 ou 999.'
      },
      ipv6: {
        title: 'IPv6 Completo (RFC 4291 / RFC 5952)',
        pattern: '^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$',
        description: 'Suporta formatos 8 hextetos, compressão de zeros com :: dupla, link-local fe80 e IPv4-mapped ::ffff:192.0.2.1.'
      },
      cidr: {
        title: 'Subnet CIDR (IPv4 /0-32 & IPv6 /0-128)',
        pattern: '^(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\/(3[0-2]|[12]?[0-9]))$',
        description: 'Verifica notação CIDR IPv4 com máscara válida entre /0 e /32 (ex: 10.0.0.0/24).'
      },
      domain: {
        title: 'FQDN / Domínio Web (RFC 1035 / RFC 1123)',
        pattern: '^(?!:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,63}$',
        description: 'Labels de até 63 caracteres, separados por pontos, sem iniciar ou terminar com hífen, e TLD alfabético de 2 a 63 chars.'
      },
      hostname: {
        title: 'Hostname de Rede Local / Servidor (RFC 952)',
        pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$',
        description: 'Nomes de host de nós de rede (ex: k8s-node-01, web-lb-prod) de 1 a 63 caracteres.'
      }
    };
  }, []);

  const regexTestResult = useMemo(() => {
    const cur = regexPatterns[regexCategory];
    try {
      const reg = new RegExp(cur.pattern);
      const isMatch = reg.test(testNetworkString.trim());
      return {
        isValidRegex: true,
        isMatch,
        pattern: cur.pattern,
        description: cur.description,
        title: cur.title
      };
    } catch (e: any) {
      return {
        isValidRegex: false,
        isMatch: false,
        pattern: cur.pattern,
        description: cur.description,
        title: cur.title
      };
    }
  }, [regexCategory, testNetworkString, regexPatterns]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Cabeçalho da Bancada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Network className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Suíte de Diagnóstico de DNS, WHOIS & Infraestrutura de Rede
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  DevOps & SysAdmin
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Calculador de TTL & propagação, construtor de registros BIND RFC, diretivas HSTS Preload, calculadora MTU/MSS e validador regex de IP.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de Soberania */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Network Leak
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            RFC Standardized
          </span>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ttl-calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'ttl-calc'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>TTL & Propagação DNS</span>
        </button>

        <button
          onClick={() => setActiveTab('records-builder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'records-builder'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Construtor de Registros BIND</span>
        </button>

        <button
          onClick={() => setActiveTab('hsts-inspector')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'hsts-inspector'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>HSTS Preload & Headers</span>
        </button>

        <button
          onClick={() => setActiveTab('mtu-calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'mtu-calc'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>MTU, MSS & Overhead</span>
        </button>

        <button
          onClick={() => setActiveTab('regex-validator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
            activeTab === 'regex-validator'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Regex IP & Domínio</span>
        </button>
      </div>

      {/* ========================================================
          ABA 1: CALCULADOR DE TTL & JANELA DE PROPAGAÇÃO DNS
      ======================================================== */}
      {activeTab === 'ttl-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Configuração */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Parâmetros de Zona DNS
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Valor do TTL (Time To Live)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={ttlValue}
                    onChange={(e) => setTtlValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-2/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <select
                    value={ttlUnit}
                    onChange={(e) => setTtlUnit(e.target.value as any)}
                    className="w-1/3 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="seconds">Segundos</option>
                    <option value="minutes">Minutos</option>
                    <option value="hours">Horas</option>
                    <option value="days">Dias</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    onClick={() => { setTtlValue(300); setTtlUnit('seconds'); }}
                    className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    5 min (Migração)
                  </button>
                  <button
                    onClick={() => { setTtlValue(1); setTtlUnit('hours'); }}
                    className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    1h (Padrão Web)
                  </button>
                  <button
                    onClick={() => { setTtlValue(24); setTtlUnit('hours'); }}
                    className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    24h (Estável)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Tempo Decorrido desde a Mudança
                  </label>
                  <span className="text-xs font-mono text-cyan-400">{timeSinceChange} min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(1440, Math.round(propagationStats.totalTtlSeconds / 60) * 1.5 || 60)}
                  value={timeSinceChange}
                  onChange={(e) => setTimeSinceChange(parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Latência Média de Cache de Provedores Locais (ISPs)
                </label>
                <select
                  value={customResolverLatency}
                  onChange={(e) => setCustomResolverLatency(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={60}>1 Hora (ISPs de Grande Porte - Vivo/Claro)</option>
                  <option value={180}>3 Horas (Provedores Regionais com Cache Agressivo)</option>
                  <option value={360}>6 Horas (Operadoras Móveis Restritivas)</option>
                  <option value={1440}>24 Horas (Pior Cenário com Descumprimento de TTL)</option>
                </select>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs text-cyan-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Dica de Migração Sem Downtime:
                </p>
                <p className="text-cyan-400/80 leading-relaxed">
                  Reduza o TTL dos seus registros para 300 segundos (5 minutos) com pelo menos <strong>48 horas de antecedência</strong> à migração de IP. Após o término e validação, retorne para 3600s ou 86400s.
                </p>
              </div>
            </div>

            {/* Visualização de Status & Resolvers */}
            <div className="lg:col-span-2 space-y-4">
              {/* Barra de Progresso Geral */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Janela Teórica de Propagação Global</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">{propagationStats.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${propagationStats.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400 font-mono">
                  <span>TTL Total: {propagationStats.totalFormatted} ({propagationStats.totalTtlSeconds}s)</span>
                  <span>Restante no Cache Autoritativo: {propagationStats.remainingFormatted}</span>
                </div>
              </div>

              {/* Tabela de Estimativa de Resolvers */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Estimativa por Servidores DNS Recursivos
                </h4>
                <div className="space-y-3">
                  {propagationStats.resolvers.map((res, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{res.name}</div>
                        <div className="text-xs text-slate-500">
                          {res.adheresStrictly ? 'Respeita rigorosamente o TTL da zona' : 'Aplica limites mínimos de cache interno'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${res.estimatedProp >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                            style={{ width: `${res.estimatedProp}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono font-bold w-12 text-right ${
                          res.estimatedProp >= 100 ? 'text-emerald-400' : 'text-cyan-400'
                        }`}>
                          {res.estimatedProp}%
                        </span>
                        {res.estimatedProp >= 100 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Atualizado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Em Cache
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 2: CONSTRUTOR & ANALISADOR DE REGISTROS DNS (BIND / RFC)
      ======================================================== */}
      {activeTab === 'records-builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles do Registro */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> Parâmetros do Registro
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tipo de Registro DNS
                </label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="TXT_SPF">TXT - SPF (Sender Policy Framework)</option>
                  <option value="TXT_DKIM">TXT - DKIM (DomainKeys Identified Mail)</option>
                  <option value="TXT_DMARC">TXT - DMARC (Email Authentication)</option>
                  <option value="MX">MX - Servidor de Correio (Mail Exchange)</option>
                  <option value="CNAME">CNAME - Apelido Canônico</option>
                  <option value="SRV">SRV - Registro de Serviço</option>
                  <option value="A">A - Endereço IPv4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Domínio Base
                </label>
                <input
                  type="text"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  TTL (Segundos)
                </label>
                <input
                  type="number"
                  min="60"
                  value={recordTtl}
                  onChange={(e) => setRecordTtl(parseInt(e.target.value) || 3600)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Campos específicos por tipo */}
              {recordType === 'MX' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Prioridade (Preference)</label>
                    <input
                      type="number"
                      min="0"
                      max="65535"
                      value={mxPriority}
                      onChange={(e) => setMxPriority(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Hostname Destino (Mail Exchanger)</label>
                    <input
                      type="text"
                      value={mxTarget}
                      onChange={(e) => setMxTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </>
              )}

              {recordType === 'TXT_SPF' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Include de Provedor</label>
                    <input
                      type="text"
                      value={spfInclude}
                      onChange={(e) => setSpfInclude(e.target.value)}
                      placeholder="_spf.google.com"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">IP do Servidor Dedicado (ip4)</label>
                    <input
                      type="text"
                      value={spfIp4}
                      onChange={(e) => setSpfIp4(e.target.value)}
                      placeholder="185.199.108.153"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Política All</label>
                    <select
                      value={spfAllPolicy}
                      onChange={(e) => setSpfAllPolicy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="~all">~all (SoftFail - Recomendado)</option>
                      <option value="-all">-all (HardFail - Restrito)</option>
                      <option value="?all">?all (Neutral - Fraco)</option>
                    </select>
                  </div>
                </>
              )}

              {recordType === 'TXT_DKIM' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Seletor DKIM (Selector)</label>
                    <input
                      type="text"
                      value={dkimSelector}
                      onChange={(e) => setDkimSelector(e.target.value)}
                      placeholder="default ou google"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Chave Pública RSA (p=...)</label>
                    <textarea
                      rows={3}
                      value={dkimPublicKey}
                      onChange={(e) => setDkimPublicKey(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono resize-none"
                    />
                  </div>
                </>
              )}

              {recordType === 'TXT_DMARC' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Política DMARC (p=)</label>
                    <select
                      value={dmarcPolicy}
                      onChange={(e) => setDmarcPolicy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="reject">p=reject (Bloqueio Total de Falsificação)</option>
                      <option value="quarantine">p=quarantine (Encaminhar para Pasta Spam)</option>
                      <option value="none">p=none (Apenas Monitoramento e Relatórios)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Porcentagem Aplicada (pct=)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={dmarcPct}
                      onChange={(e) => setDmarcPct(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">E-mail para Relatórios Agregados (rua=)</label>
                    <input
                      type="email"
                      value={dmarcRua}
                      onChange={(e) => setDmarcRua(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </>
              )}

              {recordType === 'CNAME' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Destino Canônico (Target)</label>
                  <input
                    type="text"
                    value={cnameTarget}
                    onChange={(e) => setCnameTarget(e.target.value)}
                    placeholder="cname.vercel-dns.com."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              )}

              {recordType === 'A' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Endereço IPv4</label>
                  <input
                    type="text"
                    value={aIp}
                    onChange={(e) => setAIp(e.target.value)}
                    placeholder="76.76.21.21"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Saída Formatada BIND & Diagnóstico */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    Sintaxe Oficial RFC / BIND Zone File
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedDnsRecord.rawBind, 'bind-rec')}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition cursor-pointer"
                  >
                    {copiedKey === 'bind-rec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Registro</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 break-all select-all overflow-x-auto">
                  {generatedDnsRecord.rawBind}
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {generatedDnsRecord.explanation}
                </p>
              </div>

              {/* Avisos e Validações */}
              {generatedDnsRecord.commonMistakes.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Alertas de Boas Práticas & RFC:
                  </div>
                  <ul className="text-xs text-amber-300/90 space-y-1.5 list-disc pl-4">
                    {generatedDnsRecord.commonMistakes.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: INSPETOR & GERADOR HSTS (STRICT TRANSPORT SECURITY)
      ======================================================== */}
      {activeTab === 'hsts-inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles HSTS */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Diretivas HSTS (RFC 6797)
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Domínio Alvo
                </label>
                <input
                  type="text"
                  value={hstsTargetDomain}
                  onChange={(e) => setHstsTargetDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Duração do Cache (max-age em segundos)
                </label>
                <select
                  value={hstsMaxAge}
                  onChange={(e) => setHstsMaxAge(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={31536000}>31536000s (1 Ano - Requisito Chrome Preload)</option>
                  <option value={63072000}>63072000s (2 Anos - OWASP Elite Security)</option>
                  <option value={2592000}>2592000s (30 Dias - Modo Teste Provisório)</option>
                  <option value={300}>300s (5 Minutos - Diagnóstico Rápido)</option>
                  <option value={0}>0s (Desativação Imediata do Cache HSTS)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={hstsIncludeSubdomains}
                    onChange={(e) => setHstsIncludeSubdomains(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>includeSubDomains (Todos os subdomínios forçam HTTPS)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={hstsPreload}
                    onChange={(e) => setHstsPreload(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>preload (Submissão à lista global de navegadores)</span>
                </label>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-800/40 rounded-lg text-xs text-red-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Atenção Irreversível:
                </p>
                <p className="text-red-400/80 leading-relaxed">
                  Uma vez incluído no <strong>Chrome HSTS Preload</strong>, o domínio nunca mais poderá servir tráfego puro em HTTP. Qualquer subdomínio sem certificado SSL válido ficará completamente inacessível para todos os visitantes do mundo.
                </p>
              </div>
            </div>

            {/* Checklist Preload & Snippets */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header Raw */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">Strict-Transport-Security Header</span>
                  <button
                    onClick={() => copyToClipboard(hstsDirectives.headerValue, 'hsts-hdr')}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition"
                  >
                    {copiedKey === 'hsts-hdr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Header</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 select-all">
                  Strict-Transport-Security: {hstsDirectives.headerValue}
                </div>
              </div>

              {/* Checklist hstspreload.org */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Critérios de Elegibilidade Chrome Preload List (hstspreload.org)
                  </h4>
                  {hstsDirectives.isPreloadEligible ? (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                      Elegível para Preload
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                      Requisitos Incompletos
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {hstsDirectives.preloadChecklist.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start gap-2.5">
                      {item.pass ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs">
                        <div className={`font-medium ${item.pass ? 'text-slate-200' : 'text-amber-300'}`}>
                          {item.title}
                        </div>
                        <div className="text-slate-500">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Snippets de Configuração */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-3">
                  Configuração de Servidor de Produção
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-cyan-400">Nginx (nginx.conf)</span>
                      <button
                        onClick={() => copyToClipboard(hstsDirectives.snippets.nginx, 'nginx-hsts')}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'nginx-hsts' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
                      {hstsDirectives.snippets.nginx}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-cyan-400">Vercel (vercel.json)</span>
                      <button
                        onClick={() => copyToClipboard(hstsDirectives.snippets.vercel, 'vercel-hsts')}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'vercel-hsts' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto max-h-24">
                      {hstsDirectives.snippets.vercel}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: CALCULADORA DE MTU, MSS & OVERHEAD DE PACOTES
      ======================================================== */}
      {activeTab === 'mtu-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parâmetros de Camada de Enlace & Rede */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Parâmetros de Camada 2/3
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preset de Interface / Túnel
                </label>
                <select
                  value={mtuPreset}
                  onChange={(e) => setMtuPreset(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="standard">Ethernet Padrão (MTU 1500)</option>
                  <option value="pppoe">PPPoE Fibra / ADSL (MTU 1492)</option>
                  <option value="wireguard">WireGuard VPN Tunnel (MTU 1420)</option>
                  <option value="openvpn">OpenVPN / IPsec WAN (MTU 1400)</option>
                  <option value="jumbo">Jumbo Frames LAN / SAN (MTU 9000)</option>
                  <option value="custom">Customizado</option>
                </select>
              </div>

              {mtuPreset === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Valor Customizado de MTU
                  </label>
                  <input
                    type="number"
                    min="576"
                    max="65535"
                    value={customMtu}
                    onChange={(e) => setCustomMtu(parseInt(e.target.value) || 1500)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Protocolo de Rede (IP)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIpProtocol('ipv4')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium border ${
                      ipProtocol === 'ipv4'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    IPv4 (20 Bytes)
                  </button>
                  <button
                    onClick={() => setIpProtocol('ipv6')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium border ${
                      ipProtocol === 'ipv6'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    IPv6 (40 Bytes)
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasTcpTimestamp}
                    onChange={(e) => setHasTcpTimestamp(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Opções TCP Timestamp RFC 7323 (+12 Bytes)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasVlan}
                    onChange={(e) => setHasVlan(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Tag VLAN IEEE 802.1Q (+4 Bytes em L2)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasPppoe}
                    onChange={(e) => setHasPppoe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Encapsulamento PPPoE (+8 Bytes em L2)</span>
                </label>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">Equação MSS Clássica:</p>
                <p className="font-mono text-cyan-400">MSS = MTU - (IP_Header + TCP_Header)</p>
              </div>
            </div>

            {/* Decomposição do Pacote & Eficiência */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">MTU Máximo Efetivo</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">{mtuCalculations.effectiveMtu}</span>
                  <span className="text-xs text-slate-500 ml-1">bytes</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">MSS Útil (Payload TCP)</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">{mtuCalculations.mss}</span>
                  <span className="text-xs text-slate-500 ml-1">bytes</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Eficiência de Carga Útil</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">{mtuCalculations.payloadEfficiency}%</span>
                  <span className="text-xs text-slate-500 ml-1">da linha física</span>
                </div>
              </div>

              {/* Decomposição Visual dos Bytes */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Decomposição da Estrutura de Pacote na Camada de Rede
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Cabeçalho {ipProtocol.toUpperCase()}</span>
                    <span className="text-cyan-400 font-bold">{mtuCalculations.ipHeaderBytes} bytes</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Cabeçalho TCP {hasTcpTimestamp ? '(com Timestamps)' : '(sem opções)'}</span>
                    <span className="text-cyan-400 font-bold">{mtuCalculations.tcpHeaderBytes} bytes</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300">Total de Overhead TCP/IP</span>
                    <span className="text-amber-400 font-bold">{mtuCalculations.totalHeadersOverhead} bytes</span>
                  </div>

                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between text-emerald-300">
                    <span className="font-semibold">Carga de Dados Útil (MSS Disponível para Aplicação)</span>
                    <span className="font-bold text-emerald-400">{mtuCalculations.mss} bytes</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-200">Aviso sobre Blackhole de PMTUD (Path MTU Discovery):</p>
                  <p className="leading-relaxed">
                    Se firewalls intermediários bloquearem mensagens <strong>ICMP Type 3 Code 4 (Destination Unreachable / Fragmentation Needed)</strong>, pacotes com o bit DF (Don't Fragment) maior que o MTU do túnel serão descartados silenciosamente, causando conexões TCP congeladas (hangs) em uploads ou downloads TLS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 5: GERADOR & VALIDADOR DE REGEX DE REDE (IP / FQDN / CIDR)
      ======================================================== */}
      {activeTab === 'regex-validator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Escolha de Padrão */}
            <div className="lg:col-span-1 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4" /> Padrões Canônicos de Rede
              </h3>

              <div className="space-y-2">
                {(['ipv4', 'ipv6', 'cidr', 'domain', 'hostname'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setRegexCategory(cat);
                      if (cat === 'ipv4') setTestNetworkString('192.168.1.100');
                      else if (cat === 'ipv6') setTestNetworkString('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
                      else if (cat === 'cidr') setTestNetworkString('10.244.0.0/16');
                      else if (cat === 'domain') setTestNetworkString('tools.v5apollo.com');
                      else if (cat === 'hostname') setTestNetworkString('k8s-master-node');
                    }}
                    className={`w-full p-3 rounded-lg text-left text-xs transition cursor-pointer border ${
                      regexCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-medium text-slate-200">{regexPatterns[cat].title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{regexPatterns[cat].description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Testador em Tempo Real & Snippets */}
            <div className="lg:col-span-2 space-y-4">
              {/* Campo de Teste */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Entrada de Teste para Validação</span>
                  {regexTestResult.isMatch ? (
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Padrão Válido (Match)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Não Corresponde (Mismatch)
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={testNetworkString}
                  onChange={(e) => setTestNetworkString(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-sm font-mono text-white focus:outline-none transition ${
                    regexTestResult.isMatch ? 'border-emerald-500/60' : 'border-rose-500/60'
                  }`}
                  placeholder="Insira a string para testar..."
                />
              </div>

              {/* Expressão Regular Bruta */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Expressão Regular (Pattern)</span>
                  <button
                    onClick={() => copyToClipboard(regexTestResult.pattern, 'reg-pat')}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition"
                  >
                    {copiedKey === 'reg-pat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Regex</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 break-all select-all overflow-x-auto">
                  {regexTestResult.pattern}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {regexTestResult.description}
                </p>
              </div>

              {/* Snippets em Linguagens */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-3">
                  Snippets de Validação Prontos
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 block mb-1">TypeScript / JavaScript</span>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
{`const regex = new RegExp("${regexTestResult.pattern.replace(/\\/g, '\\\\')}");
const isValid = regex.test("${testNetworkString}");`}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 block mb-1">Python (re)</span>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
{`import re
pattern = r"${regexTestResult.pattern}"
is_valid = bool(re.match(pattern, "${testNetworkString}"))`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
