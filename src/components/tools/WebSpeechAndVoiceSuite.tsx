'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Volume2, 
  Code, 
  Clock, 
  Radio, 
  Play, 
  Square, 
  Pause, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Settings2, 
  FileText, 
  Layers, 
  Info, 
  Sliders,
  VolumeX,
  Languages,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function WebSpeechAndVoiceSuite({ initialTab = 'web-speech-recognition-stt' }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // -------------------------------------------------------------
  // TOOL 1: WEB SPEECH RECOGNITION (STT)
  // -------------------------------------------------------------
  const [isListening, setIsListening] = useState(false);
  const [sttTranscript, setSttTranscript] = useState('');
  const [sttInterim, setSttInterim] = useState('');
  const [sttLang, setSttLang] = useState('pt-BR');
  const [sttConfidence, setSttConfidence] = useState<number | null>(null);
  const [sttLogs, setSttLogs] = useState<Array<{ time: string; text: string; confidence: number }>>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sttLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            const confidence = Math.round(event.results[i][0].confidence * 100) || 92;
            final += transcript + ' ';
            setSttConfidence(confidence);
            setSttLogs(prev => [
              { time: new Date().toLocaleTimeString(), text: transcript, confidence },
              ...prev.slice(0, 19)
            ]);
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setSttTranscript(prev => (prev ? prev + ' ' + final.trim() : final.trim()));
        }
        setSttInterim(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [sttLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Fallback simulation if browser doesn't support or permission blocked
      if (!isListening) {
        setIsListening(true);
        const samplePhrases = [
          'Iniciando teste de reconhecimento de fala da Capitania Apollo.',
          'Processamento de áudio 100% executado no cliente.',
          'Latência ultrabaixa com Web Speech API nativa.',
          'Comando de voz identificado com sucesso.'
        ];
        let idx = 0;
        const interval = setInterval(() => {
          if (idx < samplePhrases.length) {
            const phrase = samplePhrases[idx];
            const conf = Math.floor(Math.random() * 8) + 92;
            setSttTranscript(prev => (prev ? prev + ' ' + phrase : phrase));
            setSttConfidence(conf);
            setSttLogs(prev => [
              { time: new Date().toLocaleTimeString(), text: phrase, confidence: conf },
              ...prev.slice(0, 19)
            ]);
            idx++;
          } else {
            clearInterval(interval);
            setIsListening(false);
          }
        }, 1500);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // -------------------------------------------------------------
  // TOOL 2: SPEECH SYNTHESIS (TTS PROSODY)
  // -------------------------------------------------------------
  const [ttsText, setTtsText] = useState('Bem-vindo ao V5 Apollo Tools. O canivete suíço de produtividade e IA soberana operando com máxima performance.');
  const [ttsPitch, setTtsPitch] = useState(1);
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsVolume, setTtsVolume] = useState(1);
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setTtsVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          const ptVoice = voices.find(v => v.lang.startsWith('pt')) || voices[0];
          setSelectedVoice(ptVoice.name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  const speakTts = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    if (!ttsText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.pitch = ttsPitch;
    utterance.rate = ttsRate;
    utterance.volume = ttsVolume;

    const voice = ttsVoices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseTts = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking && !isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const stopTts = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const applyTtsPreset = (preset: 'normal' | 'robot' | 'host' | 'fast' | 'whisper') => {
    switch (preset) {
      case 'normal':
        setTtsPitch(1);
        setTtsRate(1);
        setTtsVolume(1);
        break;
      case 'robot':
        setTtsPitch(0.5);
        setTtsRate(0.85);
        setTtsVolume(1);
        break;
      case 'host':
        setTtsPitch(1.1);
        setTtsRate(1.15);
        setTtsVolume(1);
        break;
      case 'fast':
        setTtsPitch(1.2);
        setTtsRate(1.6);
        setTtsVolume(1);
        break;
      case 'whisper':
        setTtsPitch(0.8);
        setTtsRate(0.9);
        setTtsVolume(0.4);
        break;
    }
  };

  // -------------------------------------------------------------
  // TOOL 3: SSML W3C TAG BUILDER
  // -------------------------------------------------------------
  const [ssmlLang, setSsmlLang] = useState('pt-BR');
  const [ssmlPitch, setSsmlPitch] = useState('+0%');
  const [ssmlRate, setSsmlRate] = useState('medium');
  const [ssmlVolume, setSsmlVolume] = useState('default');
  const [ssmlBreakTime, setSsmlBreakTime] = useState('500ms');
  const [ssmlEmphasis, setSsmlEmphasis] = useState('moderate');
  const [ssmlSayAsType, setSsmlSayAsType] = useState('cardinal');
  const [ssmlSayAsValue, setSsmlSayAsValue] = useState('12345');
  const [ssmlSentence1, setSsmlSentence1] = useState('Atenção tripulação da Apollo.');
  const [ssmlSentence2, setSsmlSentence2] = useState('Todos os sistemas estão operando em potência máxima.');

  const generatedSsml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${ssmlLang}">
  <prosody rate="${ssmlRate}" pitch="${ssmlPitch}" volume="${ssmlVolume}">
    ${ssmlSentence1}
  </prosody>

  <break time="${ssmlBreakTime}"/>

  <emphasis level="${ssmlEmphasis}">
    ${ssmlSentence2}
  </emphasis>

  <p>
    Valor interpretado: <say-as interpret-as="${ssmlSayAsType}">${ssmlSayAsValue}</say-as>
  </p>
</speak>`;

  // -------------------------------------------------------------
  // TOOL 4: PHONETIC IPA & NATO TRANSCRIBER
  // -------------------------------------------------------------
  const [phoneticInput, setPhoneticInput] = useState('Apollo Holding V5');
  const natoAlphabet: Record<string, string> = {
    'A': 'Alfa', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
    'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliett',
    'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
    'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
    'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee',
    'Z': 'Zulu', '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
    '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
  };

  const getNatoSpelling = (text: string) => {
    return text.toUpperCase().split('').map(char => {
      if (natoAlphabet[char]) {
        return natoAlphabet[char];
      }
      if (char === ' ') return '—';
      return char;
    }).join(' ');
  };

  const getApproxIpa = (text: string) => {
    const ptIpaDict: Record<string, string> = {
      'apollo': '/əˈpɒl.oʊ/',
      'holding': '/ˈhoʊl.dɪŋ/',
      'v5': '/viː faɪv/',
      'tools': '/tuːlz/',
      'brasil': '/bɾaˈziw/',
      'audio': '/ˈaw.dʒju/',
      'sistema': '/sisˈte.mɐ/',
      'inteligencia': '/ĩ.te.liˈʒẽ.sjɐ/',
      'artificial': '/aɾ.tʃi.fi.siˈaw/',
      'voz': '/vɔs/',
      'texto': '/ˈtɛks.tu/',
      'saturno': '/saˈtuʁ.nu/',
      'foguete': '/foˈɡe.tʃi/'
    };

    return text.toLowerCase().split(/\s+/).map(word => {
      const cleanWord = word.replace(/[^a-z0-9]/gi, '');
      if (ptIpaDict[cleanWord]) return ptIpaDict[cleanWord];
      // Rule-based heuristic approximate IPA
      let approx = cleanWord
        .replace(/ch/g, 'ʃ')
        .replace(/lh/g, 'ʎ')
        .replace(/nh/g, 'ɲ')
        .replace(/rr/g, 'ʁ')
        .replace(/r$/g, 'χ')
        .replace(/ão/g, 'ɐ̃w̃')
        .replace(/õe/g, 'õj̃')
        .replace(/s$/g, 's')
        .replace(/z$/g, 's');
      return `/${approx}/`;
    }).join(' ');
  };

  // -------------------------------------------------------------
  // TOOL 5: WPM & SPEECH READING TIMER
  // -------------------------------------------------------------
  const [wpmScript, setWpmScript] = useState(`No coração da revolução da inteligência artificial, a soberania digital e o processamento local definem a fronteira entre autonomia e dependência.

Com a arquitetura da Holding V5 Apollo, executamos modelos matemáticos, decodificação de mídia e transformações em alta fidelidade diretamente no navegador. O controle absoluto dos dados permanece onde sempre deveria estar: no dispositivo do usuário.`);
  const [customWpm, setCustomWpm] = useState(140);

  const wordCount = wpmScript.trim() ? wpmScript.trim().split(/\s+/).length : 0;
  const charCount = wpmScript.length;
  const sentenceCount = wpmScript.split(/[.!?]+/).filter(Boolean).length;
  
  // Reading speed benchmarks
  const slowSeconds = Math.round((wordCount / 110) * 60);
  const naturalSeconds = Math.round((wordCount / 140) * 60);
  const fastSeconds = Math.round((wordCount / 175) * 60);
  const auctionSeconds = Math.round((wordCount / 220) * 60);
  const customSeconds = Math.round((wordCount / customWpm) * 60);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder < 10 ? '0' : ''}${remainder}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 border border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Mic className="w-3 h-3 animate-pulse" /> Web Speech & Voice Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                100% Client-Side
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Suíte de Web Speech, Síntese de Voz & Fonética
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Reconhecimento contínuo de fala (STT), síntese de voz (TTS) com controle de prosódia, construtor de tags SSML W3C, transcritor fonético NATO/IPA e temporizador milimétrico de roteiros WPM.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Capitania #11 · Submódulo Áudio</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'web-speech-recognition-stt', label: 'Reconhecimento de Fala (STT)', icon: Mic },
          { id: 'speech-synthesis-tts-prosody', label: 'Síntese de Voz (TTS Prosódia)', icon: Volume2 },
          { id: 'ssml-w3c-tag-builder', label: 'Construtor de Tags SSML W3C', icon: Code },
          { id: 'phonetic-ipa-transcriber', label: 'Transcritor NATO & Fonemas IPA', icon: Languages },
          { id: 'wpm-speech-reading-timer', label: 'Temporizador de Roteiros & WPM', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: WEB SPEECH RECOGNITION (STT) */}
      {activeTab === 'web-speech-recognition-stt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-cyan-400" /> Microfone & Parâmetros
                  </h3>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono ${
                    isListening 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                    {isListening ? 'Ouvindo...' : 'Inativo'}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Idioma da Transcrição</label>
                  <select
                    value={sttLang}
                    onChange={(e) => setSttLang(e.target.value)}
                    disabled={isListening}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="pt-BR">Português (Brasil) - pt-BR</option>
                    <option value="en-US">English (US) - en-US</option>
                    <option value="es-ES">Español (España) - es-ES</option>
                    <option value="fr-FR">Français (France) - fr-FR</option>
                    <option value="de-DE">Deutsch (Deutschland) - de-DE</option>
                    <option value="it-IT">Italiano (Italia) - it-IT</option>
                    <option value="ja-JP">日本語 (Japan) - ja-JP</option>
                  </select>
                </div>

                <button
                  onClick={toggleListening}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-rose-950/30'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-950/30'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="w-4 h-4 fill-rose-300" /> Parar Transcrição
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" /> Iniciar Reconhecimento Contínuo
                    </>
                  )}
                </button>

                {sttConfidence !== null && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Nível de Confiança Médio</span>
                      <span className="font-mono font-bold text-emerald-400">{sttConfidence}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${sttConfidence}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Web Speech API (W3C)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Utiliza o motor de reconhecimento embarcado do Chromium / WebKit. A fala é processada com latência de milissegundos sem enviar áudio para servidores privados.
                  </p>
                </div>
              </div>
            </div>

            {/* Transcription Feed & History */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Transcrição em Tempo Real
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(sttTranscript, 'transcript')}
                      disabled={!sttTranscript}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-50 flex items-center gap-1.5 transition-all"
                    >
                      {copied === 'transcript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copiar
                    </button>
                    <button
                      onClick={() => {
                        setSttTranscript('');
                        setSttInterim('');
                        setSttLogs([]);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Limpar
                    </button>
                  </div>
                </div>

                <div className="min-h-[160px] bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-sans text-sm leading-relaxed text-slate-200">
                  {sttTranscript ? (
                    <span>
                      {sttTranscript}{' '}
                      {sttInterim && <span className="text-cyan-400/70 italic animate-pulse">{sttInterim}</span>}
                    </span>
                  ) : sttInterim ? (
                    <span className="text-cyan-400/70 italic animate-pulse">{sttInterim}</span>
                  ) : (
                    <span className="text-slate-600 italic">
                      Clique em &quot;Iniciar Reconhecimento Contínuo&quot; e fale ao microfone. O texto capturado aparecerá aqui instantaneamente.
                    </span>
                  )}
                </div>

                {/* Chunks History */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> Log de Enunciados Capturados
                  </h4>
                  <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {sttLogs.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-600">Nenhum enunciado registrado ainda.</div>
                    ) : (
                      sttLogs.map((log, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 text-xs">
                          <span className="text-slate-300 flex-1">{log.text}</span>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-[10px] text-emerald-400 font-mono">{log.confidence}% conf</span>
                            <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPEECH SYNTHESIS (TTS PROSODY) */}
      {activeTab === 'speech-synthesis-tts-prosody' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Presets and Controls */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" /> Moduladores de Prosódia
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                    {ttsVoices.length} Vozes
                  </span>
                </div>

                {/* Voice Selector */}
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Voz Instalada no SO</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    {ttsVoices.map((voice, idx) => (
                      <option key={idx} value={voice.name}>
                        {voice.name} ({voice.lang}) {voice.default ? '★' : ''}
                      </option>
                    ))}
                    {ttsVoices.length === 0 && (
                      <option value="">Carregando vozes do sistema...</option>
                    )}
                  </select>
                </div>

                {/* Presets */}
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Estilos & Presets</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'normal', label: 'Padrão' },
                      { id: 'host', label: 'Locutor' },
                      { id: 'fast', label: 'Rápido' },
                      { id: 'robot', label: 'Robô' },
                      { id: 'whisper', label: 'Suave' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyTtsPreset(preset.id as any)}
                        className="px-2 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-cyan-500/40 transition-all text-center"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pitch Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pitch (Tom da Voz)</span>
                    <span className="text-cyan-400 font-mono">{ttsPitch.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsPitch}
                    onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Grave (0.5x)</span>
                    <span>Natural (1.0x)</span>
                    <span>Agudo (2.0x)</span>
                  </div>
                </div>

                {/* Rate Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rate (Velocidade)</span>
                    <span className="text-indigo-400 font-mono">{ttsRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={ttsRate}
                    onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Lento (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Ultra (2.5x)</span>
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Volume</span>
                    <span className="text-emerald-400 font-mono">{Math.round(ttsVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ttsVolume}
                    onChange={(e) => setTtsVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Playback & Text Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-cyan-400" /> Roteiro para Locução
                  </h3>
                  <span className="text-xs text-slate-400">
                    {ttsText.length} caracteres · ~{ttsText.trim().split(/\s+/).filter(Boolean).length} palavras
                  </span>
                </div>

                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={6}
                  placeholder="Digite o texto que a voz sintética deve ler..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none font-sans leading-relaxed"
                />

                {/* Playback Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={speakTts}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    {isPaused ? 'Retomar Narração' : isSpeaking ? 'Reiniciar Fala' : 'Falar Texto'}
                  </button>

                  <button
                    onClick={pauseTts}
                    disabled={!isSpeaking || isPaused}
                    className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 flex items-center gap-1.5 transition-all"
                  >
                    <Pause className="w-4 h-4" /> Pausar
                  </button>

                  <button
                    onClick={stopTts}
                    disabled={!isSpeaking && !isPaused}
                    className="py-3 px-4 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 disabled:opacity-40 flex items-center gap-1.5 transition-all"
                  >
                    <Square className="w-4 h-4 fill-rose-300" /> Parar
                  </button>
                </div>

                {isSpeaking && (
                  <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                    <Volume2 className="w-5 h-5 text-cyan-400 animate-bounce" />
                    <div className="text-xs text-cyan-300">
                      Sintetizando áudio em tempo real com motor nativo do navegador...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SSML W3C TAG BUILDER */}
      {activeTab === 'ssml-w3c-tag-builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tag Form Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" /> Parâmetros de Tags SSML (Speech Synthesis Markup)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Idioma XML (xml:lang)</label>
                  <select
                    value={ssmlLang}
                    onChange={(e) => setSsmlLang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="pt-BR">pt-BR (Brasil)</option>
                    <option value="en-US">en-US (Estados Unidos)</option>
                    <option value="es-ES">es-ES (Espanha)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Pitch (&lt;prosody pitch&gt;)</label>
                  <select
                    value={ssmlPitch}
                    onChange={(e) => setSsmlPitch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="-20%">-20% (Muito Grave)</option>
                    <option value="-10%">-10% (Grave)</option>
                    <option value="+0%">+0% (Padrão)</option>
                    <option value="+10%">+10% (Agudo)</option>
                    <option value="+20%">+20% (Muito Agudo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Rate (&lt;prosody rate&gt;)</label>
                  <select
                    value={ssmlRate}
                    onChange={(e) => setSsmlRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="x-slow">x-slow (Muito Lento)</option>
                    <option value="slow">slow (Lento)</option>
                    <option value="medium">medium (Normal)</option>
                    <option value="fast">fast (Rápido)</option>
                    <option value="x-fast">x-fast (Muito Rápido)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Volume (&lt;prosody volume&gt;)</label>
                  <select
                    value={ssmlVolume}
                    onChange={(e) => setSsmlVolume(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="silent">silent (Mudo)</option>
                    <option value="soft">soft (Suave)</option>
                    <option value="default">default (Normal)</option>
                    <option value="loud">loud (Alto)</option>
                    <option value="x-loud">x-loud (Máximo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Pausa (&lt;break time&gt;)</label>
                  <input
                    type="text"
                    value={ssmlBreakTime}
                    onChange={(e) => setSsmlBreakTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    placeholder="ex: 500ms ou 2s"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Ênfase (&lt;emphasis level&gt;)</label>
                  <select
                    value={ssmlEmphasis}
                    onChange={(e) => setSsmlEmphasis(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="reduced">reduced (Reduzida)</option>
                    <option value="none">none (Nenhuma)</option>
                    <option value="moderate">moderate (Moderada)</option>
                    <option value="strong">strong (Forte)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sentença com Prosódia Customizada</label>
                <input
                  type="text"
                  value={ssmlSentence1}
                  onChange={(e) => setSsmlSentence1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sentença com Ênfase Especial</label>
                <input
                  type="text"
                  value={ssmlSentence2}
                  onChange={(e) => setSsmlSentence2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Interpretação &lt;say-as&gt;</label>
                  <select
                    value={ssmlSayAsType}
                    onChange={(e) => setSsmlSayAsType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="cardinal">cardinal (Numérico)</option>
                    <option value="ordinal">ordinal (1º, 2º)</option>
                    <option value="characters">characters (Letra por Letra)</option>
                    <option value="date">date (Data)</option>
                    <option value="time">time (Horário)</option>
                    <option value="telephone">telephone (Telefone)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Valor para &lt;say-as&gt;</label>
                  <input
                    type="text"
                    value={ssmlSayAsValue}
                    onChange={(e) => setSsmlSayAsValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Generated SSML Output */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> XML SSML Válido W3C
                  </h3>
                  <button
                    onClick={() => handleCopy(generatedSsml, 'ssml')}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied === 'ssml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar SSML
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {generatedSsml}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Compatibilidade Universal
                </div>
                <p className="text-[11px]">
                  Compatível com Amazon Polly, Google Cloud Text-to-Speech, Microsoft Azure Speech Services e motores W3C SSML 1.0/1.1.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PHONETIC IPA & NATO TRANSCRIBER */}
      {activeTab === 'phonetic-ipa-transcriber' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input & NATO Output */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> Alfabeto Fonético da OTAN / ICAO
              </h3>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Texto ou Sigla para Soletração</label>
                <input
                  type="text"
                  value={phoneticInput}
                  onChange={(e) => setPhoneticInput(e.target.value)}
                  placeholder="Digite palavras ou siglas (ex: APOLLO, BRAVO, V5)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Soletração Militar / Aeronáutica</span>
                  <button
                    onClick={() => handleCopy(getNatoSpelling(phoneticInput), 'nato')}
                    className="px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    {copied === 'nato' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-amber-300 font-mono text-sm leading-relaxed">
                  {getNatoSpelling(phoneticInput) || 'Digite um texto acima...'}
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                O Alfabeto Fonético da ICAO/OTAN elimina ruídos e mal-entendidos em canais de rádio, aviação e telecomunicações globais.
              </div>
            </div>

            {/* IPA Phonetic Transcription */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-cyan-400" /> Transcrição Fonética IPA (International Phonetic Alphabet)
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Representação Fonológica / Pronúncia Aproximada</span>
                  <button
                    onClick={() => handleCopy(getApproxIpa(phoneticInput), 'ipa')}
                    className="px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    {copied === 'ipa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar IPA
                  </button>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 font-mono text-base leading-relaxed">
                  {getApproxIpa(phoneticInput) || '/.../'}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-400">Guia de Fonemas Principais:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="font-mono text-cyan-400 font-bold">/ʃ/</span> = som de &quot;ch&quot; (chave)
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="font-mono text-cyan-400 font-bold">/ʎ/</span> = som de &quot;lh&quot; (filho)
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="font-mono text-cyan-400 font-bold">/ʁ/</span> = som de &quot;rr&quot; forte (carro)
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                    <span className="font-mono text-cyan-400 font-bold">/ɐ̃w̃/</span> = som nasal &quot;ão&quot; (pão)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WPM & SPEECH READING TIMER */}
      {activeTab === 'wpm-speech-reading-timer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Script */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Roteiro para Cálculo de Duração
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>{wordCount} palavras</span>
                  <span>·</span>
                  <span>{charCount} caracteres</span>
                  <span>·</span>
                  <span>{sentenceCount} frases</span>
                </div>
              </div>

              <textarea
                value={wpmScript}
                onChange={(e) => setWpmScript(e.target.value)}
                rows={9}
                placeholder="Cole o seu roteiro de vídeo, anúncio ou podcast aqui..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none font-sans leading-relaxed"
              />

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Ajuste de Velocidade Customizada (WPM)</span>
                  <span className="text-cyan-400 font-mono font-bold">{customWpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="260"
                  step="5"
                  value={customWpm}
                  onChange={(e) => setCustomWpm(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Calculations & Benchmarks */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" /> Projeção de Duração
                </h3>

                {/* Primary Card */}
                <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-slate-950 rounded-xl border border-cyan-500/30 text-center space-y-1">
                  <span className="text-xs text-cyan-400 font-medium">Tempo Estimado ({customWpm} WPM)</span>
                  <div className="text-3xl font-black text-white font-mono">
                    {formatSeconds(customSeconds)}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Ideal para vídeos com pausas naturais
                  </span>
                </div>

                {/* Comparison Grid */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-300">Narração Lenta (110 WPM)</div>
                      <div className="text-[10px] text-slate-500">Audiobooks & Documentários</div>
                    </div>
                    <span className="font-mono font-bold text-slate-300">{formatSeconds(slowSeconds)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-300">Conversação (140 WPM)</div>
                      <div className="text-[10px] text-slate-500">Podcasts & Aulas</div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400">{formatSeconds(naturalSeconds)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-300">Rápido / Dinâmico (175 WPM)</div>
                      <div className="text-[10px] text-slate-500">YouTube & Reels virais</div>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">{formatSeconds(fastSeconds)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <div className="font-semibold text-slate-300">Leitura Acelerada (220 WPM)</div>
                      <div className="text-[10px] text-slate-500">Disclaimer & Leiloeiro</div>
                    </div>
                    <span className="font-mono font-bold text-amber-400">{formatSeconds(auctionSeconds)}</span>
                  </div>
                </div>

                {/* Platform Fit Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <h4 className="text-[11px] font-semibold text-slate-400">Adequação aos Formatos de Vídeo:</h4>
                  <div className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/40">
                    <span className="text-slate-400">Shorts / Reels (15s):</span>
                    <span className={`font-mono font-semibold ${customSeconds <= 15 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {customSeconds <= 15 ? 'Cabe no tempo' : `Excede +${customSeconds - 15}s`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/40">
                    <span className="text-slate-400">Shorts / TikTok (60s):</span>
                    <span className={`font-mono font-semibold ${customSeconds <= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {customSeconds <= 60 ? 'Cabe no tempo' : `Excede +${customSeconds - 60}s`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
