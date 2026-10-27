'use client';

import React, { useState, useMemo } from 'react';
import { 
  Terminal, 
  Key, 
  Clock, 
  Cpu, 
  Server, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Code2, 
  Play, 
  Layers,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface TerminalAndSysAdminSuiteProps {
  defaultTab?: 'chmod-calc' | 'cron-decoder' | 'systemd-service' | 'kill-process' | 'ssh-keygen';
}

export const TerminalAndSysAdminSuite: React.FC<TerminalAndSysAdminSuiteProps> = ({ defaultTab = 'chmod-calc' }) => {
  const [activeTab, setActiveTab] = useState<'chmod-calc' | 'cron-decoder' | 'systemd-service' | 'kill-process' | 'ssh-keygen'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // FERRAMENTA 1: CALCULADORA CHMOD PERMISSÕES LINUX
  // ==========================================
  const [ownerRead, setOwnerRead] = useState<boolean>(true);
  const [ownerWrite, setOwnerWrite] = useState<boolean>(true);
  const [ownerExec, setOwnerExec] = useState<boolean>(true);

  const [groupRead, setGroupRead] = useState<boolean>(true);
  const [groupWrite, setGroupWrite] = useState<boolean>(false);
  const [groupExec, setGroupExec] = useState<boolean>(true);

  const [othersRead, setOthersRead] = useState<boolean>(true);
  const [othersWrite, setOthersWrite] = useState<boolean>(false);
  const [othersExec, setOthersExec] = useState<boolean>(true);

  const [isRecursive, setIsRecursive] = useState<boolean>(false);
  const [chmodFilePath, setChmodFilePath] = useState<string>('/var/www/v5-tools');

  const chmodResult = useMemo(() => {
    const ownerVal = (ownerRead ? 4 : 0) + (ownerWrite ? 2 : 0) + (ownerExec ? 1 : 0);
    const groupVal = (groupRead ? 4 : 0) + (groupWrite ? 2 : 0) + (groupExec ? 1 : 0);
    const othersVal = (othersRead ? 4 : 0) + (othersWrite ? 2 : 0) + (othersExec ? 1 : 0);
    const octal = `${ownerVal}${groupVal}${othersVal}`;

    const symOwner = `${ownerRead ? 'r' : '-'}${ownerWrite ? 'w' : '-'}${ownerExec ? 'x' : '-'}`;
    const symGroup = `${groupRead ? 'r' : '-'}${groupWrite ? 'w' : '-'}${groupExec ? 'x' : '-'}`;
    const symOthers = `${othersRead ? 'r' : '-'}${othersWrite ? 'w' : '-'}${othersExec ? 'x' : '-'}`;
    const symbolic = `-${symOwner}${symGroup}${symOthers}`;

    const recFlag = isRecursive ? '-R ' : '';
    const chmodCmd = `chmod ${recFlag}${octal} ${chmodFilePath}`;
    const chmodSymCmd = `chmod ${recFlag}u=${symOwner.replace(/-/g, '')},g=${symGroup.replace(/-/g, '')},o=${symOthers.replace(/-/g, '')} ${chmodFilePath}`;

    const isDangerous = octal === '777';

    return {
      octal,
      symbolic,
      chmodCmd,
      chmodSymCmd,
      isDangerous
    };
  }, [ownerRead, ownerWrite, ownerExec, groupRead, groupWrite, groupExec, othersRead, othersWrite, othersExec, isRecursive, chmodFilePath]);

  const applyChmodPreset = (u: number, g: number, o: number) => {
    setOwnerRead((u & 4) !== 0);
    setOwnerWrite((u & 2) !== 0);
    setOwnerExec((u & 1) !== 0);

    setGroupRead((g & 4) !== 0);
    setGroupWrite((g & 2) !== 0);
    setGroupExec((g & 1) !== 0);

    setOthersRead((o & 4) !== 0);
    setOthersWrite((o & 2) !== 0);
    setOthersExec((o & 1) !== 0);
  };

  // ==========================================
  // FERRAMENTA 2: DECODIFICADOR & CONSTRUTOR CRON EM PORTUGUÊS
  // ==========================================
  const [cronExp, setCronExp] = useState<string>('0 */2 * * *');

  const cronExplanation = useMemo(() => {
    const parts = cronExp.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { valid: false, error: 'A expressão Cron padrão requer exatamente 5 campos: minuto hora dia_mês mês dia_semana.' };
    }

    const [min, hour, dom, mon, dow] = parts;

    let desc = '';
    // Heurísticas em Português
    if (min === '*' && hour === '*') {
      desc = 'Executa a cada minuto de todos os dias.';
    } else if (min.startsWith('*/') && hour === '*') {
      desc = `Executa a cada ${min.replace('*/', '')} minutos continuamente.`;
    } else if (min === '0' && hour.startsWith('*/')) {
      desc = `Executa a cada ${hour.replace('*/', '')} horas, no minuto zero (ex: Protocolo da Colmeia).`;
    } else if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '*') {
      desc = 'Executa diariamente à meia-noite (00:00).';
    } else if (min === '0' && hour !== '*' && dow === '*') {
      desc = `Executa todos os dias exatamente às ${hour.padStart(2, '0')}:${min.padStart(2, '0')}.`;
    } else if (dow === '0' || dow === '7') {
      desc = `Executa todo domingo às ${hour.padStart(2, '0')}:${min.padStart(2, '0')}.`;
    } else if (dow === '1-5') {
      desc = `Executa de segunda a sexta-feira às ${hour.padStart(2, '0')}:${min.padStart(2, '0')}.`;
    } else {
      desc = `Executa no minuto (${min}), hora (${hour}), dia do mês (${dom}), mês (${mon}) e dia da semana (${dow}).`;
    }

    // Gerar próximas 5 simulações visuais
    const now = new Date();
    const nextDates: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now.getTime() + i * 2 * 3600 * 1000);
      d.setMinutes(0);
      d.setSeconds(0);
      nextDates.push(d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }));
    }

    return {
      valid: true,
      min, hour, dom, mon, dow,
      desc,
      nextDates
    };
  }, [cronExp]);

  // ==========================================
  // FERRAMENTA 3: GERADOR DE ARQUIVO SYSTEMD LINUX (.service)
  // ==========================================
  const [serviceName, setServiceName] = useState<string>('v5-apollo-tools');
  const [serviceDesc, setServiceDesc] = useState<string>('Holding V5 Apollo Tools Sovereign Node');
  const [serviceUser, setServiceUser] = useState<string>('ubuntu');
  const [serviceWorkDir, setServiceWorkDir] = useState<string>('/var/www/v5-apollo-tools');
  const [serviceExecStart, setServiceExecStart] = useState<string>('/usr/bin/npm run start -- -p 3009');
  const [serviceRestart, setServiceRestart] = useState<string>('always');
  const [serviceEnv, setServiceEnv] = useState<string>('NODE_ENV=production PORT=3009');

  const systemdContent = useMemo(() => {
    const lines = [
      `[Unit]`,
      `Description=${serviceDesc}`,
      `After=network.target`,
      ``,
      `[Service]`,
      `Type=simple`,
      `User=${serviceUser}`,
      `WorkingDirectory=${serviceWorkDir}`,
      `ExecStart=${serviceExecStart}`,
      `Restart=${serviceRestart}`,
      `RestartSec=10`,
      `StandardOutput=journal`,
      `StandardError=journal`,
      ...serviceEnv.split(' ').map(e => `Environment="${e}"`),
      ``,
      `[Install]`,
      `WantedBy=multi-user.target`
    ];
    return lines.join('\n');
  }, [serviceName, serviceDesc, serviceUser, serviceWorkDir, serviceExecStart, serviceRestart, serviceEnv]);

  const systemdCommands = useMemo(() => {
    const sName = serviceName.endsWith('.service') ? serviceName : `${serviceName}.service`;
    return `# 1. Salvar arquivo:\nsudo nano /etc/systemd/system/${sName}\n\n# 2. Recarregar e Ativar:\nsudo systemctl daemon-reload\nsudo systemctl enable ${sName}\nsudo systemctl start ${sName}\n\n# 3. Verificar Status & Logs:\nsudo systemctl status ${sName}\njournalctl -u ${sName} -f`;
  }, [serviceName]);

  // ==========================================
  // FERRAMENTA 4: CONSTRUTOR DE COMANDOS KILL POR PORTA / PID
  // ==========================================
  const [killPort, setKillPort] = useState<string>('3009');
  const [killPid, setKillPid] = useState<string>('12450');
  const [killOs, setKillOs] = useState<'windows' | 'linux'>('windows');

  const killCommands = useMemo(() => {
    if (killOs === 'windows') {
      return {
        inspectPort: `netstat -ano | findstr :${killPort}`,
        inspectPs: `Get-NetTCPConnection -LocalPort ${killPort}`,
        killByPortPs: `Stop-Process -Id (Get-NetTCPConnection -LocalPort ${killPort}).OwningProcess -Force`,
        killByPidCmd: `taskkill /PID ${killPid} /F`
      };
    } else {
      return {
        inspectPort: `lsof -i :${killPort} || ss -tulpn | grep :${killPort}`,
        inspectPs: `fuser ${killPort}/tcp`,
        killByPortPs: `kill -9 $(lsof -t -i :${killPort})`,
        killByPidCmd: `kill -9 ${killPid}`
      };
    }
  }, [killPort, killPid, killOs]);

  // ==========================================
  // FERRAMENTA 5: CONSTRUTOR SSH-KEYGEN & CONFIG
  // ==========================================
  const [sshType, setSshType] = useState<'ed25519' | 'rsa'>('ed25519');
  const [sshComment, setSshComment] = useState<string>('v5estudio@hotmail.com');
  const [sshKeyName, setSshKeyName] = useState<string>('id_ed25519_apollo');
  const [sshRemoteHost, setSshRemoteHost] = useState<string>('apollo-server');
  const [sshRemoteIp, setSshRemoteIp] = useState<string>('192.168.1.100');
  const [sshRemoteUser, setSshRemoteUser] = useState<string>('ubuntu');

  const sshKeygenCmd = useMemo(() => {
    if (sshType === 'ed25519') {
      return `ssh-keygen -t ed25519 -C "${sshComment}" -f ~/.ssh/${sshKeyName}`;
    } else {
      return `ssh-keygen -t rsa -b 4096 -C "${sshComment}" -f ~/.ssh/${sshKeyName}`;
    }
  }, [sshType, sshComment, sshKeyName]);

  const sshConfigSnippet = useMemo(() => {
    return `# ~/.ssh/config\nHost ${sshRemoteHost}\n    HostName ${sshRemoteIp}\n    User ${sshRemoteUser}\n    IdentityFile ~/.ssh/${sshKeyName}\n    IdentitiesOnly yes`;
  }, [sshRemoteHost, sshRemoteIp, sshRemoteUser, sshKeyName]);

  const sshCopyIdCmd = useMemo(() => {
    return `ssh-copy-id -i ~/.ssh/${sshKeyName}.pub ${sshRemoteUser}@${sshRemoteIp}`;
  }, [sshKeyName, sshRemoteUser, sshRemoteIp]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
      {/* Header Cyber Obsidian */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  Capitania #11 · Terminal, Shell & SysAdmin Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                  250 Ferramentas Ativas
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Utilitários de Shell, Linux SysAdmin & Automação de Terminal
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Chmod, Cron, Systemd, Kill Ports & SSH Soberano</span>
          </div>
        </div>

        {/* Abas da Suíte */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveTab('chmod-calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'chmod-calc'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Calculadora Chmod Octal</span>
          </button>

          <button
            onClick={() => setActiveTab('cron-decoder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'cron-decoder'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Decodificador Cron em Português</span>
          </button>

          <button
            onClick={() => setActiveTab('systemd-service')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'systemd-service'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Gerador de Serviço Systemd (.service)</span>
          </button>

          <button
            onClick={() => setActiveTab('kill-process')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'kill-process'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Kill Process & Liberador de Portas</span>
          </button>

          <button
            onClick={() => setActiveTab('ssh-keygen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'ssh-keygen'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>SSH Keygen & Config Builder</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-6">
        {/* ========================================================= */}
        {/* ABA 1: CALCULADORA CHMOD */}
        {/* ========================================================= */}
        {activeTab === 'chmod-calc' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200">Matriz de Permissões Unix / Linux</h3>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    {/* OWNER */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="font-bold text-cyan-400 border-b border-slate-800 pb-2">
                        Usuário / Owner (u)
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={ownerRead} onChange={e => setOwnerRead(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Read (r = 4)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={ownerWrite} onChange={e => setOwnerWrite(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Write (w = 2)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={ownerExec} onChange={e => setOwnerExec(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Execute (x = 1)</span>
                      </label>
                    </div>

                    {/* GROUP */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="font-bold text-indigo-400 border-b border-slate-800 pb-2">
                        Grupo / Group (g)
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={groupRead} onChange={e => setGroupRead(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Read (r = 4)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={groupWrite} onChange={e => setGroupWrite(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Write (w = 2)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={groupExec} onChange={e => setGroupExec(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Execute (x = 1)</span>
                      </label>
                    </div>

                    {/* OTHERS */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="font-bold text-amber-400 border-b border-slate-800 pb-2">
                        Outros / Others (o)
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={othersRead} onChange={e => setOthersRead(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Read (r = 4)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={othersWrite} onChange={e => setOthersWrite(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Write (w = 2)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" checked={othersExec} onChange={e => setOthersExec(e.target.checked)} className="rounded accent-emerald-500" />
                        <span>Execute (x = 1)</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={isRecursive} onChange={e => setIsRecursive(e.target.checked)} className="rounded accent-emerald-500" />
                      <span>Flag Recursiva (-R para pastas e subdiretórios)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Caminho:</span>
                      <input
                        type="text"
                        value={chmodFilePath}
                        onChange={e => setChmodFilePath(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets Rápidos */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Presets Típicos de Servidores Linux:</span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => applyChmodPreset(7, 5, 5)} className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono">
                      755 (Pastas Web / Executáveis)
                    </button>
                    <button onClick={() => applyChmodPreset(6, 4, 4)} className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono">
                      644 (Arquivos HTML/CSS/PHP padrão)
                    </button>
                    <button onClick={() => applyChmodPreset(6, 0, 0)} className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono">
                      600 (Chaves SSH / .env seguro)
                    </button>
                    <button onClick={() => applyChmodPreset(4, 0, 0)} className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono">
                      400 (Chave Privada Somente Leitura)
                    </button>
                    <button onClick={() => applyChmodPreset(7, 7, 7)} className="px-2.5 py-1 text-xs bg-red-950/60 hover:bg-red-900/60 border border-red-800 rounded-lg text-red-300 font-mono">
                      777 (Total - Inseguro!)
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultado Octal & Comandos */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-3">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Notação Octal</span>
                  <div className="text-5xl font-black text-emerald-400 font-mono tracking-wider">
                    {chmodResult.octal}
                  </div>
                  <div className="text-sm font-mono text-cyan-300 bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-800">
                    {chmodResult.symbolic}
                  </div>

                  {chmodResult.isDangerous && (
                    <div className="bg-red-950/60 border border-red-800 p-2.5 rounded-lg text-red-300 text-xs flex items-center gap-2 text-left">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>Aviso: 777 permite escrita pública irrestrita. Evite em produção!</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Comando Octal:</span>
                      <button onClick={() => copyToClipboard(chmodResult.chmodCmd, 'cmd-octal')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'cmd-octal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
                      {chmodResult.chmodCmd}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-300">Comando Simbólico:</span>
                      <button onClick={() => copyToClipboard(chmodResult.chmodSymCmd, 'cmd-sym')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'cmd-sym' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
                      {chmodResult.chmodSymCmd}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: CRON DECODER */}
        {/* ========================================================= */}
        {activeTab === 'cron-decoder' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Expressão Crontab (5 Campos)</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Expressão Cron:</label>
                  <input
                    type="text"
                    value={cronExp}
                    onChange={e => setCronExp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="* * * * *"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Presets Rápidos:</span>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => setCronExp('0 */2 * * *')} className="text-left text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 font-mono">
                      0 */2 * * * <span className="text-emerald-400 block text-[10px] font-sans">A cada 2 horas (Cron da Colmeia)</span>
                    </button>
                    <button onClick={() => setCronExp('*/15 * * * *')} className="text-left text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 font-mono">
                      */15 * * * * <span className="text-slate-400 block text-[10px] font-sans">A cada 15 minutos</span>
                    </button>
                    <button onClick={() => setCronExp('0 0 * * *')} className="text-left text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 font-mono">
                      0 0 * * * <span className="text-slate-400 block text-[10px] font-sans">Diariamente à meia-noite</span>
                    </button>
                    <button onClick={() => setCronExp('0 9 * * 1-5')} className="text-left text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 font-mono">
                      0 9 * * 1-5 <span className="text-slate-400 block text-[10px] font-sans">Segunda a sexta às 09:00</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {cronExplanation.valid ? (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="pb-3 border-b border-slate-800">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Tradução Humana em Português Claro</span>
                      <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span>{cronExplanation.desc}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">MINUTO</span>
                        <span className="text-cyan-400 font-bold">{cronExplanation.min}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">HORA</span>
                        <span className="text-cyan-400 font-bold">{cronExplanation.hour}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">DIA MÊS</span>
                        <span className="text-cyan-400 font-bold">{cronExplanation.dom}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">MÊS</span>
                        <span className="text-cyan-400 font-bold">{cronExplanation.mon}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">DIA SEM.</span>
                        <span className="text-cyan-400 font-bold">{cronExplanation.dow}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block mb-2 font-semibold">Próximas 5 Execuções Previstas (Horário Local):</span>
                      <div className="space-y-1.5 font-mono text-xs">
                        {cronExplanation.nextDates?.map((date, idx) => (
                          <div key={idx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-slate-300">
                            <span className="text-slate-500">Execução #{idx + 1}</span>
                            <span className="text-emerald-400 font-bold">{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/60 border border-red-800 p-4 rounded-xl text-red-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{cronExplanation.error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: GERADOR DE SERVIÇO SYSTEMD */}
        {/* ========================================================= */}
        {activeTab === 'systemd-service' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Configuração da Aplicação</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome do Serviço:</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={e => setServiceName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Descrição:</label>
                  <input
                    type="text"
                    value={serviceDesc}
                    onChange={e => setServiceDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Usuário Linux:</label>
                    <input
                      type="text"
                      value={serviceUser}
                      onChange={e => setServiceUser(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Restart Policy:</label>
                    <select
                      value={serviceRestart}
                      onChange={e => setServiceRestart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    >
                      <option value="always">always</option>
                      <option value="on-failure">on-failure</option>
                      <option value="no">no</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">WorkingDirectory:</label>
                  <input
                    type="text"
                    value={serviceWorkDir}
                    onChange={e => setServiceWorkDir(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">ExecStart (Comando de Início):</label>
                  <input
                    type="text"
                    value={serviceExecStart}
                    onChange={e => setServiceExecStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">
                      Arquivo /etc/systemd/system/{serviceName}.service:
                    </span>
                    <button
                      onClick={() => copyToClipboard(systemdContent, 'sys-content')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'sys-content' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Arquivo</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    {systemdContent}
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-400">Comandos de Ativação Systemctl:</span>
                    <button
                      onClick={() => copyToClipboard(systemdCommands, 'sys-cmds')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'sys-cmds' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Comandos</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {systemdCommands}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: KILL PROCESS & LIBERADOR DE PORTAS */}
        {/* ========================================================= */}
        {activeTab === 'kill-process' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Sistema Operacional:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setKillOs('windows')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${killOs === 'windows' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Windows (PowerShell / CMD)
                  </button>
                  <button
                    onClick={() => setKillOs('linux')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${killOs === 'linux' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                  >
                    Linux / macOS (Bash / Zsh)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Porta:</span>
                  <input
                    type="text"
                    value={killPort}
                    onChange={e => setKillPort(e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-cyan-300 font-mono font-bold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">PID:</span>
                  <input
                    type="text"
                    value={killPid}
                    onChange={e => setKillPid(e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  1. Identificar Quem Está Ocupando a Porta :{killPort}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-mono">Comando de Inspeção:</span>
                    <button onClick={() => copyToClipboard(killCommands.inspectPort, 'ins-port')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copiedKey === 'ins-port' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
                    {killCommands.inspectPort}
                  </pre>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-400" />
                  2. Matar Processo Imediatamente e Liberar a Porta
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400 font-mono">Matar Direto pela Porta :{killPort}:</span>
                      <button onClick={() => copyToClipboard(killCommands.killByPortPs, 'kill-port')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'kill-port' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-red-400 overflow-x-auto font-bold">
                      {killCommands.killByPortPs}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400 font-mono">Matar pelo PID {killPid}:</span>
                      <button onClick={() => copyToClipboard(killCommands.killByPidCmd, 'kill-pid')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        {copiedKey === 'kill-pid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-amber-300 overflow-x-auto">
                      {killCommands.killByPidCmd}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: SSH KEYGEN & CONFIG */}
        {/* ========================================================= */}
        {activeTab === 'ssh-keygen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Parâmetros da Chave SSH</h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Algoritmo Criptográfico:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSshType('ed25519')}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${sshType === 'ed25519' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Ed25519 (Moderno)
                    </button>
                    <button
                      onClick={() => setSshType('rsa')}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${sshType === 'rsa' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      RSA 4096 (Legado)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Comentário / E-mail:</label>
                  <input
                    type="text"
                    value={sshComment}
                    onChange={e => setSshComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nome do Arquivo:</label>
                  <input
                    type="text"
                    value={sshKeyName}
                    onChange={e => setSshKeyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Destino do Servidor:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Host Alias:</span>
                      <input
                        type="text"
                        value={sshRemoteHost}
                        onChange={e => setSshRemoteHost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Usuário Remoto:</span>
                      <input
                        type="text"
                        value={sshRemoteUser}
                        onChange={e => setSshRemoteUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">IP ou Domínio:</span>
                    <input
                      type="text"
                      value={sshRemoteIp}
                      onChange={e => setSshRemoteIp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-400">1. Gerar Chave Privada/Pública:</span>
                    <button onClick={() => copyToClipboard(sshKeygenCmd, 'ssh-gen')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copiedKey === 'ssh-gen' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
                    {sshKeygenCmd}
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">2. Copiar Chave Pública para Servidor:</span>
                    <button onClick={() => copyToClipboard(sshCopyIdCmd, 'ssh-copy')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copiedKey === 'ssh-copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
                    {sshCopyIdCmd}
                  </pre>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300">3. Snippet para ~/.ssh/config:</span>
                    <button onClick={() => copyToClipboard(sshConfigSnippet, 'ssh-conf')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {copiedKey === 'ssh-conf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Config</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {sshConfigSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
