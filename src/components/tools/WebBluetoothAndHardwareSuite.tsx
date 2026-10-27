'use client';

import { normalizeStr } from '@/lib/utils/stringUtils';
import React, { useState, useMemo } from 'react';
import { 
  Bluetooth, 
  Cpu, 
  Battery, 
  Terminal, 
  Sliders, 
  Activity, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  Layers, 
  Zap, 
  Hash,
  Share2
} from 'lucide-react';

interface WebBluetoothAndHardwareSuiteProps {
  defaultTab?: 'ble-gatt' | 'web-hid' | 'web-serial' | 'ble-battery' | 'sig-numbers';
}

export const WebBluetoothAndHardwareSuite: React.FC<WebBluetoothAndHardwareSuiteProps> = ({ 
  defaultTab = 'ble-gatt' 
}) => {
  const [activeTab, setActiveTab] = useState<'ble-gatt' | 'web-hid' | 'web-serial' | 'ble-battery' | 'sig-numbers'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // =========================================================================
  // FERRAMENTA 1: EXPLORADOR GATT WEB BLUETOOTH
  // =========================================================================
  const [selectedGattDevice, setSelectedGattDevice] = useState<'heart-rate' | 'env-sensor' | 'smart-tag'>('heart-rate');
  const [simulatedValue, setSimulatedValue] = useState<number>(76); // bpm ou temp
  const [isNotifying, setIsNotifying] = useState<boolean>(true);

  const gattDevicesData = {
    'heart-rate': {
      name: 'V5 Polar HRM-900',
      serviceUuid: '0x180D (Heart Rate Service)',
      primaryUuid128: '0000180d-0000-1000-8000-00805f9b34fb',
      characteristics: [
        {
          uuid: '0x2A37',
          name: 'Heart Rate Measurement',
          props: ['notify'],
          rawHex: `0x06 ${simulatedValue.toString(16).padStart(2, '0')} E8 03`,
          decoded: `Flags: 0x06 (8-bit BPM, Sensor Contact Detected), Frequência: ${simulatedValue} bpm, Intervalo RR: 1000ms`,
          cccd: '0x0001 (Notificações Habilitadas)'
        },
        {
          uuid: '0x2A38',
          name: 'Body Sensor Location',
          props: ['read'],
          rawHex: '0x01',
          decoded: 'Localização do Eletrodo: Peitoral (Chest)',
          cccd: 'N/A'
        }
      ]
    },
    'env-sensor': {
      name: 'V5 WeatherNode BME280',
      serviceUuid: '0x181A (Environmental Sensing)',
      primaryUuid128: '0000181a-0000-1000-8000-00805f9b34fb',
      characteristics: [
        {
          uuid: '0x2A6E',
          name: 'Temperature (Celsius)',
          props: ['read', 'notify'],
          rawHex: '0x94 0x09',
          decoded: 'Valor Int16LE: 2452 -> 24.52 °C (Resolução 0.01 °C)',
          cccd: '0x0001'
        },
        {
          uuid: '0x2A6F',
          name: 'Humidity (% RH)',
          props: ['read', 'notify'],
          rawHex: '0x40 0x17',
          decoded: 'Valor UInt16LE: 5952 -> 59.52% (Resolução 0.01%)',
          cccd: '0x0001'
        },
        {
          uuid: '0x2A6D',
          name: 'Pressure (Pascals)',
          props: ['read'],
          rawHex: '0xA0 0x86 0x01 0x00',
          decoded: 'Valor UInt32LE: 100000 -> 1000.00 hPa',
          cccd: 'N/A'
        }
      ]
    },
    'smart-tag': {
      name: 'V5 Beacon Tag Pro',
      serviceUuid: '0x180A (Device Information)',
      primaryUuid128: '0000180a-0000-1000-8000-00805f9b34fb',
      characteristics: [
        {
          uuid: '0x2A29',
          name: 'Manufacturer Name String',
          props: ['read'],
          rawHex: '0x56 0x35 0x20 0x41 0x70 0x6F 0x6C 0x6C 0x6F',
          decoded: 'UTF-8 String: "V5 Apollo"',
          cccd: 'N/A'
        },
        {
          uuid: '0x2A24',
          name: 'Model Number String',
          props: ['read'],
          rawHex: '0x53 0x54 0x2D 0x31 0x31',
          decoded: 'UTF-8 String: "ST-11"',
          cccd: 'N/A'
        }
      ]
    }
  };

  const activeDevice = gattDevicesData[selectedGattDevice];

  // =========================================================================
  // FERRAMENTA 2: PARSER DE DESCRITORES WEBHID
  // =========================================================================
  const [hidPreset, setHidPreset] = useState<'mouse' | 'keyboard' | 'gamepad'>('mouse');

  const hidDescriptors = {
    mouse: {
      name: 'Mouse Óptico Padrão (3 Botões + Roda de Rolagem)',
      rawHex: '05 01 09 02 A1 01 09 01 A1 00 05 09 19 01 29 03 15 00 25 01 95 03 75 01 81 02 95 01 75 05 81 03 05 01 09 30 09 31 15 81 25 7F 75 08 95 02 81 06 09 38 15 81 25 7F 75 08 95 01 81 06 C0 C0',
      parsedItems: [
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Generic Desktop (0x01)' },
        { type: 'Local', tag: 'USAGE', value: 'Mouse (0x02)' },
        { type: 'Main', tag: 'COLLECTION', value: 'Application (0x01)' },
        { type: 'Local', tag: 'USAGE', value: 'Pointer (0x01)' },
        { type: 'Main', tag: 'COLLECTION', value: 'Physical (0x00)' },
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Button (0x09)' },
        { type: 'Local', tag: 'USAGE_MINIMUM', value: 'Button 1 (Left)' },
        { type: 'Local', tag: 'USAGE_MAXIMUM', value: 'Button 3 (Middle)' },
        { type: 'Global', tag: 'LOGICAL_MINIMUM', value: '0' },
        { type: 'Global', tag: 'LOGICAL_MAXIMUM', value: '1' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '3 (3 bits para botões)' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '1 bit' },
        { type: 'Main', tag: 'INPUT', value: 'Data, Variable, Absolute (0x02)' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '1' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '5 bits (Padding)' },
        { type: 'Main', tag: 'INPUT', value: 'Constant (0x03)' },
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Generic Desktop (0x01)' },
        { type: 'Local', tag: 'USAGE', value: 'X (0x30)' },
        { type: 'Local', tag: 'USAGE', value: 'Y (0x31)' },
        { type: 'Global', tag: 'LOGICAL_MINIMUM', value: '-127' },
        { type: 'Global', tag: 'LOGICAL_MAXIMUM', value: '127' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '8 bits (1 Byte)' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '2 (X e Y)' },
        { type: 'Main', tag: 'INPUT', value: 'Data, Variable, Relative (0x06)' },
        { type: 'Local', tag: 'USAGE', value: 'Wheel (0x38)' },
        { type: 'Main', tag: 'INPUT', value: 'Data, Variable, Relative (0x06)' },
        { type: 'Main', tag: 'END_COLLECTION', value: 'Physical' },
        { type: 'Main', tag: 'END_COLLECTION', value: 'Application' }
      ]
    },
    keyboard: {
      name: 'Teclado HID USB 6KRO (Boot Protocol)',
      rawHex: '05 01 09 06 A1 01 05 07 19 E0 29 E7 15 00 25 01 75 01 95 08 81 02 95 01 75 08 81 03 95 05 75 01 05 08 19 01 29 05 91 02 95 01 75 03 91 03 95 06 75 08 15 00 25 65 05 07 19 00 29 65 81 00 C0',
      parsedItems: [
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Generic Desktop (0x01)' },
        { type: 'Local', tag: 'USAGE', value: 'Keyboard (0x06)' },
        { type: 'Main', tag: 'COLLECTION', value: 'Application (0x01)' },
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Keyboard/Keypad (0x07)' },
        { type: 'Local', tag: 'USAGE_MINIMUM', value: 'Left Control (0xE0)' },
        { type: 'Local', tag: 'USAGE_MAXIMUM', value: 'Right GUI (0xE7)' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '8 (Modifiers)' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '1 bit' },
        { type: 'Main', tag: 'INPUT', value: 'Data, Variable, Absolute (Modifiers)' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '1' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '8 bits' },
        { type: 'Main', tag: 'INPUT', value: 'Constant (Reserved Byte)' },
        { type: 'Global', tag: 'USAGE_PAGE', value: 'LEDs (0x08)' },
        { type: 'Main', tag: 'OUTPUT', value: 'LED Indicators (NumLock, CapsLock, ScrollLock)' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '6' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '8 bits (6 Key Codes simultâneos)' },
        { type: 'Main', tag: 'INPUT', value: 'Data, Array (0x00)' },
        { type: 'Main', tag: 'END_COLLECTION', value: 'Application' }
      ]
    },
    gamepad: {
      name: 'Controle Joystick / Gamepad X-Input',
      rawHex: '05 01 09 05 A1 01 05 01 09 30 09 31 15 00 26 FF 03 75 0A 95 02 81 02 05 09 19 01 29 10 15 00 25 01 75 01 95 10 81 02 C0',
      parsedItems: [
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Generic Desktop (0x01)' },
        { type: 'Local', tag: 'USAGE', value: 'Game Pad (0x05)' },
        { type: 'Main', tag: 'COLLECTION', value: 'Application (0x01)' },
        { type: 'Local', tag: 'USAGE', value: 'Thumbstick X/Y' },
        { type: 'Global', tag: 'LOGICAL_MAXIMUM', value: '1023 (Resolução 10-bit)' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '10 bits' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '2' },
        { type: 'Main', tag: 'INPUT', value: 'Analog Sticks (0x02)' },
        { type: 'Global', tag: 'USAGE_PAGE', value: 'Buttons (0x09)' },
        { type: 'Global', tag: 'REPORT_COUNT', value: '16 Botões (A, B, X, Y, D-Pad, Triggers)' },
        { type: 'Global', tag: 'REPORT_SIZE', value: '1 bit' },
        { type: 'Main', tag: 'INPUT', value: 'Digital Buttons (0x02)' },
        { type: 'Main', tag: 'END_COLLECTION', value: 'Application' }
      ]
    }
  };

  const activeDescriptor = hidDescriptors[hidPreset];

  // =========================================================================
  // FERRAMENTA 3: SIMULADOR DE PACOTES SERIAL RS-232 / UART
  // =========================================================================
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [dataBits, setDataBits] = useState<number>(8);
  const [stopBits, setStopBits] = useState<number>(1);
  const [parity, setParity] = useState<'none' | 'even' | 'odd'>('none');
  const [serialPayload, setSerialPayload] = useState<string>('CMD:GET_TELEMETRY;ID=42');

  const serialStats = useMemo(() => {
    const parityBits = parity === 'none' ? 0 : 1;
    const totalBitsPerFrame = 1 /* start bit */ + dataBits + parityBits + stopBits;
    const payloadBytes = new TextEncoder().encode(serialPayload).length + 2; // + CRLF
    const totalFrameBits = payloadBytes * totalBitsPerFrame;
    const transmissionTimeMs = (totalFrameBits / baudRate) * 1000;
    const effectiveBytesPerSec = (baudRate / totalBitsPerFrame);
    const overheadPercent = ((totalBitsPerFrame - dataBits) / totalBitsPerFrame) * 100;

    // Checksum XOR LRC
    let xorCheck = 0;
    for (let i = 0; i < serialPayload.length; i++) {
      xorCheck ^= serialPayload.charCodeAt(i);
    }

    // CRC-8 (polinômio 0x07)
    let crc8 = 0;
    for (let i = 0; i < serialPayload.length; i++) {
      crc8 ^= serialPayload.charCodeAt(i);
      for (let b = 0; b < 8; b++) {
        if (crc8 & 0x80) crc8 = ((crc8 << 1) ^ 0x07) & 0xFF;
        else crc8 = (crc8 << 1) & 0xFF;
      }
    }

    return {
      totalBitsPerFrame,
      payloadBytes,
      totalFrameBits,
      transmissionTimeMs: transmissionTimeMs.toFixed(3),
      effectiveBytesPerSec: Math.floor(effectiveBytesPerSec),
      overheadPercent: overheadPercent.toFixed(1),
      xorLrcHex: `0x${xorCheck.toString(16).toUpperCase().padStart(2, '0')}`,
      crc8Hex: `0x${crc8.toString(16).toUpperCase().padStart(2, '0')}`
    };
  }, [baudRate, dataBits, stopBits, parity, serialPayload]);

  // =========================================================================
  // FERRAMENTA 4: CALCULADORA BLE BATTERY SERVICE
  // =========================================================================
  const [batteryType, setBatteryType] = useState<'cr2032' | 'lipo-500'>('cr2032');
  const [advIntervalSeconds, setAdvIntervalSeconds] = useState<number>(2.0); // 2 segundos
  const [txPowerDbm, setTxPowerDbm] = useState<number>(0); // 0 dBm

  const batteryAnalysis = useMemo(() => {
    const batteryCapacityMah = batteryType === 'cr2032' ? 225 : 500;
    const nominalVoltage = batteryType === 'cr2032' ? 3.0 : 3.7;

    // Modelo de Correntes BLE (nRF52840 / ESP32-C3)
    const sleepCurrentUa = batteryType === 'cr2032' ? 2.5 : 12.0; // microamperes
    const txCurrentMa = txPowerDbm === 4 ? 9.5 : txPowerDbm === 0 ? 5.3 : 3.8; // mA durante 3ms de burst
    const txBurstTimeMs = 3.5;
    const sensorActiveTimeMs = 15.0;
    const sensorActiveCurrentMa = 3.5;

    // Corrente média por segundo
    const intervalMs = advIntervalSeconds * 1000;
    const txChargeMAs = txCurrentMa * txBurstTimeMs;
    const sensorChargeMAs = sensorActiveCurrentMa * sensorActiveTimeMs;
    const sleepTimeMs = intervalMs - (txBurstTimeMs + sensorActiveTimeMs);
    const sleepChargeMAs = (sleepCurrentUa / 1000) * (sleepTimeMs > 0 ? sleepTimeMs : 0);

    const totalChargePerCycleMAs = txChargeMAs + sensorChargeMAs + sleepChargeMAs;
    const averageCurrentMa = (totalChargePerCycleMAs / intervalMs);
    const averageCurrentUa = averageCurrentMa * 1000;

    const totalHours = (batteryCapacityMah * 0.85) / averageCurrentMa; // 85% fator de eficiência
    const totalDays = totalHours / 24;
    const totalMonths = totalDays / 30.4;
    const totalYears = totalDays / 365.25;

    return {
      batteryCapacityMah,
      nominalVoltage,
      averageCurrentUa: averageCurrentUa.toFixed(1),
      totalDays: Math.floor(totalDays),
      totalMonths: totalMonths.toFixed(1),
      totalYears: totalYears.toFixed(2),
      energyJoules: (batteryCapacityMah * (nominalVoltage * 3.6)).toFixed(0)
    };
  }, [batteryType, advIntervalSeconds, txPowerDbm]);

  // =========================================================================
  // FERRAMENTA 5: DICIONÁRIO DE NÚMEROS ATRIBUÍDOS BLUETOOTH SIG
  // =========================================================================
  const [sigSearchTerm, setSigSearchTerm] = useState<string>('');
  const [sigTypeFilter, setSigTypeFilter] = useState<'all' | 'service' | 'characteristic' | 'descriptor'>('all');

  const sigAssignedNumbers = [
    { uuid: '0x1800', type: 'service', name: 'Generic Access', desc: 'Define parâmetros genéricos de visibilidade, nome de dispositivo e aparência GAP.' },
    { uuid: '0x1801', type: 'service', name: 'Generic Attribute', desc: 'Serviço de controle de atributos GATT e notificações de alteração de serviços.' },
    { uuid: '0x180A', type: 'service', name: 'Device Information', desc: 'Metadados de hardware: fabricante, modelo, serial, firmware e hardware revision.' },
    { uuid: '0x180D', type: 'service', name: 'Heart Rate', desc: 'Transmissão contínua de frequência cardíaca e intervalos R-R para wearables.' },
    { uuid: '0x180F', type: 'service', name: 'Battery Service', desc: 'Nível percentual de bateria do dispositivo cliente (0x2A19).' },
    { uuid: '0x181A', type: 'service', name: 'Environmental Sensing', desc: 'Dados meteorológicos: temperatura, umidade, pressão atmosférica, vento e radiação UV.' },
    { uuid: '0x1826', type: 'service', name: 'Fitness Machine', desc: 'Esteiras ergométricas, bicicletas estacionárias, remo e elípticos.' },
    { uuid: '0x1822', type: 'service', name: 'Pulse Oximeter', desc: 'Saturação de oxigênio SpO2 periférico e pulsação arterial médica.' },
    { uuid: '0x2A00', type: 'characteristic', name: 'Device Name', desc: 'Nome UTF-8 do dispositivo broadcastado nos pacotes de advertising.' },
    { uuid: '0x2A01', type: 'characteristic', name: 'Appearance', desc: 'Ícone/Categoria visual BLE: relógio (0x00C0), sensor cardíaco (0x0340), tag (0x0200).' },
    { uuid: '0x2A19', type: 'characteristic', name: 'Battery Level', desc: 'Valor escalar UInt8 representando carga restante de 0% a 100%.' },
    { uuid: '0x2A29', type: 'characteristic', name: 'Manufacturer Name', desc: 'String de texto UTF-8 identificando o fabricante original.' },
    { uuid: '0x2A37', type: 'characteristic', name: 'Heart Rate Measurement', desc: 'Estrutura binária dinâmica com flags, taxa de batimentos e intervalos RR.' },
    { uuid: '0x2A6E', type: 'characteristic', name: 'Temperature', desc: 'Temperatura em escala Celsius com ponto fixo Int16 (fator 0.01 °C).' },
    { uuid: '0x2A6F', type: 'characteristic', name: 'Humidity', desc: 'Umidade relativa do ar UInt16 com fator de escala 0.01%.' },
    { uuid: '0x2902', type: 'descriptor', name: 'Client Characteristic Configuration (CCCD)', desc: 'Controle de ativação de Notificações (0x0001) e Indicações (0x0002).' },
    { uuid: '0x2901', type: 'descriptor', name: 'Characteristic User Description', desc: 'Rótulo textual legível para características personalizadas.' },
    { uuid: '0x2904', type: 'descriptor', name: 'Characteristic Presentation Format', desc: 'Metadados de tipo de dado, expoente, unidade SI e namespace Bluetooth.' }
  ];

  const filteredSigItems = useMemo(() => {
    return sigAssignedNumbers.filter(item => {
      const q = normalizeStr(sigSearchTerm);
      const matchQuery = !q ||
        normalizeStr(item.name).includes(q) ||
        normalizeStr(item.uuid).includes(q) ||
        normalizeStr(item.desc).includes(q);
      const matchType = sigTypeFilter === 'all' || item.type === sigTypeFilter;
      return matchQuery && matchType;
    });
  }, [sigSearchTerm, sigTypeFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header da Suíte */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
                Web Bluetooth & WebHID APIs
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
                Hardware Device Telemetry
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                Marco 360 Ferramentas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Bluetooth className="w-8 h-8 text-cyan-400" />
              Suíte de Web Bluetooth, WebHID & Hardware Device Diagnostics
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Inspecione e decodifique dispositivos periféricos conectados ao navegador: explorador GATT com decodificação DataView, parser de descritores de relatório USB HID, telemetria e enquadramento serial UART e calculador de bateria BLE CR2032.
            </p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800 text-sm scrollbar-thin">
          <button
            onClick={() => setActiveTab('ble-gatt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'ble-gatt'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            1. Explorador GATT Web Bluetooth
          </button>
          <button
            onClick={() => setActiveTab('web-hid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'web-hid'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. Parser USB HID Reports
          </button>
          <button
            onClick={() => setActiveTab('web-serial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'web-serial'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            3. Enquadramento UART / Serial
          </button>
          <button
            onClick={() => setActiveTab('ble-battery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'ble-battery'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Battery className="w-4 h-4" />
            4. Autonomia Bateria BLE 0x180F
          </button>
          <button
            onClick={() => setActiveTab('sig-numbers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === 'sig-numbers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Hash className="w-4 h-4" />
            5. Dicionário UUIDs Bluetooth SIG
          </button>
        </div>
      </div>

      {/* ABA 1: GATT EXPLORER */}
      {activeTab === 'ble-gatt' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bluetooth className="w-5 h-5 text-cyan-400" />
                Explorador & Inspecionador GATT (Generic Attribute Profile)
              </h2>
              <p className="text-slate-400 text-sm">
                Navegue pela árvore de Serviços Primários, Características e Descritores CCCD com decodificação DataView em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedGattDevice('heart-rate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGattDevice === 'heart-rate' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sensor Cardíaco (HRM)
              </button>
              <button
                onClick={() => setSelectedGattDevice('env-sensor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGattDevice === 'env-sensor' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Estação Clima (BME280)
              </button>
              <button
                onClick={() => setSelectedGattDevice('smart-tag')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGattDevice === 'smart-tag' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Device Info (DIS)
              </button>
            </div>
          </div>

          {/* Card do Dispositivo Conectado */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-white font-bold text-sm">{activeDevice.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  GATT Connected
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Serviço Primário: <span className="text-cyan-300">{activeDevice.serviceUuid}</span> · Base 128-bit: {activeDevice.primaryUuid128}
              </div>
            </div>
            {selectedGattDevice === 'heart-rate' && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Simular Batimentos:</span>
                <input
                  type="range"
                  min="50"
                  max="180"
                  value={simulatedValue}
                  onChange={e => setSimulatedValue(Number(e.target.value))}
                  className="w-28 accent-cyan-400 cursor-pointer"
                />
                <span className="text-sm font-bold text-cyan-400 font-mono">{simulatedValue} bpm</span>
              </div>
            )}
          </div>

          {/* Características do Dispositivo */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">
              Características & Descritores GATT Mapeados:
            </span>
            <div className="grid grid-cols-1 gap-3">
              {activeDevice.characteristics.map((charac, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{charac.uuid}</span>
                      <span className="text-sm font-semibold text-white">{charac.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {charac.props.map((p, pIdx) => (
                        <span key={pIdx} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 border border-slate-700 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1">BUFFER BRUTO (ArrayBuffer / Hex):</span>
                      <span className="text-indigo-300 font-bold">{charac.rawHex}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1">VALOR DECODIFICADO (DataView Parser):</span>
                      <span className="text-emerald-400 font-bold">{charac.decoded}</span>
                    </div>
                  </div>

                  {charac.cccd !== 'N/A' && (
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800/60">
                      <span>Descritor CCCD (0x2902):</span>
                      <span className="font-mono text-cyan-300 font-semibold">{charac.cccd}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: WEBHID DESCRIPTOR PARSER */}
      {activeTab === 'web-hid' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Parser & Decodificador de Descritores de Relatório USB HID
              </h2>
              <p className="text-slate-400 text-sm">
                Desmonte a árvore binária de itens USB HID (Usage Pages, Collections, Input/Output/Feature Reports).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setHidPreset('mouse')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  hidPreset === 'mouse' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mouse 3-Botões
              </button>
              <button
                onClick={() => setHidPreset('keyboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  hidPreset === 'keyboard' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Teclado 6KRO
              </button>
              <button
                onClick={() => setHidPreset('gamepad')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  hidPreset === 'gamepad' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gamepad / Joystick
              </button>
            </div>
          </div>

          {/* Bytes Brutos do Descritor */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1">
              <span>BYTECODE DO REPORT DESCRIPTOR (HEX):</span>
              <button onClick={() => copyToClipboard(activeDescriptor.rawHex, 'hid-hex')} className="hover:text-white flex items-center gap-1">
                {copiedKey === 'hid-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copiar
              </button>
            </div>
            <div className="text-cyan-300 break-all select-all leading-relaxed">
              {activeDescriptor.rawHex}
            </div>
          </div>

          {/* Tabela de Itens Decodificados */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Escopo</th>
                  <th className="py-2.5 px-4">Tag HID</th>
                  <th className="py-2.5 px-4">Valor Decodificado & Parâmetros</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activeDescriptor.parsedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'Global' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        item.type === 'Local' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-white font-bold">{item.tag}</td>
                    <td className="py-2 px-4 text-cyan-300">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: ENQUADRAMENTO SERIAL UART */}
      {activeTab === 'web-serial' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                Simulador de Enquadramento & Telemetria Serial (UART / Web Serial)
              </h2>
              <p className="text-slate-400 text-sm">
                Calcule overhead de enquadramento, tempos de transmissão e checksums de integridade (LRC e CRC-8).
              </p>
            </div>
          </div>

          {/* Configuração de Porta Serial */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Baud Rate (bps):</label>
              <select
                value={baudRate}
                onChange={e => setBaudRate(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                <option value={9600}>9600 baud</option>
                <option value={19200}>19200 baud</option>
                <option value={38400}>38400 baud</option>
                <option value={57600}>57600 baud</option>
                <option value={115200}>115200 baud</option>
                <option value={921600}>921600 baud</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Data Bits:</label>
              <select
                value={dataBits}
                onChange={e => setDataBits(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                <option value={7}>7 bits</option>
                <option value={8}>8 bits</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Stop Bits:</label>
              <select
                value={stopBits}
                onChange={e => setStopBits(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                <option value={1}>1 stop bit</option>
                <option value={2}>2 stop bits</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Paridade:</label>
              <select
                value={parity}
                onChange={e => setParity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                <option value="none">None (Sem Paridade)</option>
                <option value="even">Even (Par)</option>
                <option value="odd">Odd (Ímpar)</option>
              </select>
            </div>
          </div>

          {/* Entrada de Payload */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Payload Serial a Transmitir:</label>
            <input
              type="text"
              value={serialPayload}
              onChange={e => setSerialPayload(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Painel de Estatísticas de Transmissão */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Bits por Caractere</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{serialStats.totalBitsPerFrame} bits/frame</div>
              <div className="text-[10px] text-slate-500 mt-1">1 start + {dataBits} data + {stopBits} stop</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Tempo de Transmissão</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{serialStats.transmissionTimeMs} ms</div>
              <div className="text-[10px] text-slate-500 mt-1">Para {serialStats.payloadBytes} bytes enviados</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Throughput Efetivo</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{serialStats.effectiveBytesPerSec.toLocaleString()} B/s</div>
              <div className="text-[10px] text-slate-500 mt-1">{serialStats.overheadPercent}% overhead framing</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Checksums Calculados</div>
              <div className="text-sm font-bold text-amber-400 mt-1">XOR: {serialStats.xorLrcHex}</div>
              <div className="text-sm font-bold text-cyan-300">CRC-8: {serialStats.crc8Hex}</div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: AUTONOMIA BATERIA BLE 0x180F */}
      {activeTab === 'ble-battery' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Battery className="w-5 h-5 text-cyan-400" />
                Calculadora de Vida Útil de Bateria BLE (Battery Service UUID 0x180F)
              </h2>
              <p className="text-slate-400 text-sm">
                Projeção matemática de durabilidade para dispositivos IoT com Coin Cell CR2032 ou baterias LiPo.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBatteryType('cr2032')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  batteryType === 'cr2032' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Coin Cell CR2032 (225 mAh)
              </button>
              <button
                onClick={() => setBatteryType('lipo-500')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  batteryType === 'lipo-500' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                LiPo Recarregável (500 mAh)
              </button>
            </div>
          </div>

          {/* Controles de Intervalo e Potência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Intervalo de Telemetria / Advertising:</span>
                <span className="text-cyan-400 font-bold font-mono">{advIntervalSeconds} segundos</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="60"
                step="0.2"
                value={advIntervalSeconds}
                onChange={e => setAdvIntervalSeconds(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>200ms (Beacon Rápido)</span>
                <span>2s (Sensor Médio)</span>
                <span>60s (Ultra Long Life)</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Potência de Transmissão de Rádio (Tx Power):</label>
              <select
                value={txPowerDbm}
                onChange={e => setTxPowerDbm(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              >
                <option value={-4}>-4 dBm (Baixo Alcance ~5m - 3.8 mA)</option>
                <option value={0}>0 dBm (Padrão BLE ~15m - 5.3 mA)</option>
                <option value={4}>+4 dBm (Longo Alcance ~30m - 9.5 mA)</option>
              </select>
            </div>
          </div>

          {/* Cards de Previsão de Autonomia */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Consumo Médio</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{batteryAnalysis.averageCurrentUa} μA</div>
              <div className="text-[10px] text-slate-500 mt-1">Inclui Sleep + Tx + Sensores</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Autonomia Estimada</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{batteryAnalysis.totalDays} Dias</div>
              <div className="text-[10px] text-slate-500 mt-1">{batteryAnalysis.totalMonths} Meses contínuos</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Duração em Anos</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{batteryAnalysis.totalYears} Anos</div>
              <div className="text-[10px] text-slate-500 mt-1">Fator de derating 85%</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400 uppercase font-mono">Energia Total Útil</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{batteryAnalysis.energyJoules} Joules</div>
              <div className="text-[10px] text-slate-500 mt-1">Capacidade nominal: {batteryAnalysis.batteryCapacityMah} mAh</div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: DICIONÁRIO BLUETOOTH SIG */}
      {activeTab === 'sig-numbers' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-cyan-400" />
                Dicionário de Números Atribuídos da Bluetooth SIG (Assigned Numbers)
              </h2>
              <p className="text-slate-400 text-sm">
                Catálogo de Serviços, Características e Descritores padrão definidos pelo consórcio Bluetooth SIG.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSigTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sigTypeFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSigTypeFilter('service')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sigTypeFilter === 'service' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Serviços
              </button>
              <button
                onClick={() => setSigTypeFilter('characteristic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sigTypeFilter === 'characteristic' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Características
              </button>
              <button
                onClick={() => setSigTypeFilter('descriptor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sigTypeFilter === 'descriptor' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Descritores
              </button>
            </div>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filtrar por nome (ex: Heart Rate, Battery), UUID (0x180D) ou descrição..."
              value={sigSearchTerm}
              onChange={e => setSigSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          {/* Tabela de UUIDs */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">UUID 16-bit</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Nome Canônico SIG</th>
                  <th className="py-2.5 px-4">Finalidade & Especificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredSigItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-cyan-400 font-bold">{item.uuid}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'service' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                        item.type === 'characteristic' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-white font-bold">{item.name}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
