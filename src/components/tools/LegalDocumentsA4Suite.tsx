'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Building, 
  Home, 
  AlertTriangle, 
  UserCheck, 
  Key, 
  Scale, 
  ShieldCheck, 
  Calendar, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface LegalDocumentsA4SuiteProps {
  defaultTab?: 'power-of-attorney' | 'rental-contract' | 'extrajudicial-notice' | 'residence-declaration' | 'receipt-keys-handover';
}

export function LegalDocumentsA4Suite({ defaultTab = 'power-of-attorney' }: LegalDocumentsA4SuiteProps) {
  const [activeTab, setActiveTab] = useState<'power-of-attorney' | 'rental-contract' | 'extrajudicial-notice' | 'residence-declaration' | 'receipt-keys-handover'>(defaultTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const todayDateString = () => {
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const d = new Date();
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  };

  // =========================================================================
  // ABA 1: PROCURAÇÃO PARTICULAR A4
  // =========================================================================
  const [grantorName, setGrantorName] = useState('MARCOS AURELIO DA SILVA');
  const [grantorNationality, setGrantorNationality] = useState('brasileiro');
  const [grantorMarital, setGrantorMarital] = useState('casado');
  const [grantorProfession, setGrantorProfession] = useState('engenheiro de software');
  const [grantorRg, setGrantorRg] = useState('12.345.678-9 SSP/SP');
  const [grantorCpf, setGrantorCpf] = useState('123.456.789-00');
  const [grantorAddress, setGrantorAddress] = useState('Rua das Acácias, nº 450, Bairro Jardim, São Paulo/SP, CEP 01234-567');

  const [attorneyName, setAttorneyName] = useState('JULIANA PEREIRA LIMA');
  const [attorneyNationality, setAttorneyNationality] = useState('brasileira');
  const [attorneyMarital, setAttorneyMarital] = useState('solteira');
  const [attorneyProfession, setAttorneyProfession] = useState('administradora');
  const [attorneyRg, setAttorneyRg] = useState('98.765.432-1 SSP/SP');
  const [attorneyCpf, setAttorneyCpf] = useState('987.654.321-99');
  const [attorneyAddress, setAttorneyAddress] = useState('Av. Paulista, nº 1000, Apto 82, Bela Vista, São Paulo/SP, CEP 01310-100');

  const [powersType, setPowersType] = useState<'broad' | 'vehicle' | 'bank' | 'custom'>('broad');
  const [customPowers, setCustomPowers] = useState('amplos poderes para me representar perante repartições públicas federais, estaduais e municipais, bancos e cartórios.');
  const [poaCity, setPoaCity] = useState('São Paulo');

  const getPowersText = () => {
    if (powersType === 'broad') {
      return 'amplos poderes para administrar bens e negócios, receber e dar quitação, assinar requerimentos, contratos e distratos, representar perante repartições públicas federais, estaduais e municipais, autarquias, cartórios de notas e de registro de imóveis, concessionárias de serviços públicos e estabelecimentos bancários em geral.';
    }
    if (powersType === 'vehicle') {
      return 'específicos poderes para promover a venda, transferência, licenciamento e regularização perante o DETRAN do veículo de minha propriedade, podendo assinar autorização para transferência de propriedade de veículo (ATPV-e), dar quitação, requerer certidões e praticar todos os atos pertinentes.';
    }
    if (powersType === 'bank') {
      return 'específicos poderes para movimentar contas correntes e poupança de minha titularidade, emitir e endossar cheques, autorizar transferências, PIX e TEDs, solicitar extratos e saldos, cadastrar e descadastrar senhas eletrônicas e encerrar contas.';
    }
    return customPowers;
  };

  const getPowerOfAttorneyFullText = () => {
    return `PROCURAÇÃO PARTICULAR

OUTORGANTE:
${grantorName.toUpperCase()}, ${grantorNationality}, ${grantorMarital}, ${grantorProfession}, portador(a) do RG nº ${grantorRg} e inscrito(a) no CPF/MF sob o nº ${grantorCpf}, residente e domiciliado(a) na ${grantorAddress}.

OUTORGADO(A):
${attorneyName.toUpperCase()}, ${attorneyNationality}, ${attorneyMarital}, ${attorneyProfession}, portador(a) do RG nº ${attorneyRg} e inscrito(a) no CPF/MF sob o nº ${attorneyCpf}, residente e domiciliado(a) na ${attorneyAddress}.

PODERES:
Pelo presente instrumento particular de mandato, o(a) Outorgante nomeia e constitui o(a) Outorgado(a) seu(sua) bastante procurador(a), conferindo-lhe ${getPowersText()}, dando tudo por bom, firme e valioso.

${poaCity}, ${todayDateString()}.


_________________________________________________
${grantorName.toUpperCase()}
(Outorgante)
`;
  };

  // =========================================================================
  // ABA 2: CONTRATO DE LOCAÇÃO RESIDENCIAL A4
  // =========================================================================
  const [landlordName, setLandlordName] = useState('ROBERTO CARLOS MENEZES');
  const [landlordCpf, setLandlordCpf] = useState('222.333.444-55');
  const [tenantName, setTenantName] = useState('CAROLINA DIAS SOUZA');
  const [tenantCpf, setTenantCpf] = useState('666.777.888-99');
  const [propertyAddress, setPropertyAddress] = useState('Rua dos Pinheiros, nº 120, Apto 41, Pinheiros, São Paulo/SP');
  const [rentalValue, setRentalValue] = useState('2.800,00');
  const [rentalDueDay, setRentalDueDay] = useState('05');
  const [rentalDurationMonths, setRentalDurationMonths] = useState('30');
  const [depositValue, setDepositValue] = useState('8.400,00');
  const [contractCity, setContractCity] = useState('São Paulo');

  const getRentalContractFullText = () => {
    return `CONTRATO DE LOCAÇÃO RESIDENCIAL COMERCIAL
(Regido pela Lei Federal nº 8.245/1991 - Lei do Inquilinato)

LOCADOR(A): ${landlordName.toUpperCase()}, inscrito(a) no CPF/MF sob o nº ${landlordCpf}.
LOCATÁRIO(A): ${tenantName.toUpperCase()}, inscrito(a) no CPF/MF sob o nº ${tenantCpf}.

OBJETO DA LOCAÇÃO:
O imóvel situado na ${propertyAddress}, destinado exclusivamente para fins residenciais.

CLÁUSULA PRIMEIRA - DO PRAZO:
O prazo de locação é de ${rentalDurationMonths} (trinta) meses, iniciando-se na data de assinatura deste contrato.

CLÁUSULA SEGUNDA - DO VALOR DO ALUGUEL:
O valor mensal da locação é fixado em R$ ${rentalValue}, devendo ser pago impreterivelmente até o dia ${rentalDueDay} de cada mês subsequente ao vencido.

CLÁUSULA TERCEIRA - DOS ENCARGOS:
Incumbirá ao(à) Locatário(a) o pagamento das despesas de condomínio, consumo de água, energia elétrica, gás e parcelas do IPTU relativas ao imóvel durante o período de ocupação.

CLÁUSULA QUARTA - DA GARANTIA LOCATÍCIA:
A título de caução em garantia (Art. 38 da Lei nº 8.245/91), o(a) Locatário(a) deposita a quantia de R$ ${depositValue} (equivalente a 3 aluguéis), a ser restituída ao término da locação com a devolução pacífica do imóvel.

CLÁUSULA QUINTA - DA RESTITUIÇÃO DO IMÓVEL:
O(A) Locatário(a) se obriga a restituir o imóvel inteiramente limpo e no estado em que o recebeu, conforme termo de vistoria inicial.

CLÁUSULA SEXTA - DO FORO:
Para dirimir quaisquer controvérsias oriundas do presente instrumento, as partes elegem o foro da Comarca de ${contractCity}/SP, com renúncia expressa a qualquer outro.

E, por estarem justos e contratados, assinam o presente contrato em 2 (duas) vias de igual teor e forma.

${contractCity}, ${todayDateString()}.


_________________________________________         _________________________________________
LOCADOR(A): ${landlordName.toUpperCase()}         LOCATÁRIO(A): ${tenantName.toUpperCase()}


TESTEMUNHAS:
1. _________________________________ CPF: ____________________
2. _________________________________ CPF: ____________________
`;
  };

  // =========================================================================
  // ABA 3: NOTIFICAÇÃO EXTRAJUDICIAL A4
  // =========================================================================
  const [notifierName, setNotifierName] = useState('V5 PARTICIPACOES E EMPREENDIMENTOS LTDA');
  const [notifierCnpj, setNotifierCnpj] = useState('12.345.678/0001-90');
  const [notifiedName, setNotifiedName] = useState('TECH BRASIL SOLUCOES DIGITAIS ME');
  const [notifiedCnpj, setNotifiedCnpj] = useState('98.765.432/0001-11');
  const [noticePurpose, setNoticePurpose] = useState<'debt' | 'vacate'>('debt');
  const [noticeDebtValue, setNoticeDebtValue] = useState('15.420,50');
  const [noticeDeadlineDays, setNoticeDeadlineDays] = useState('05');
  const [noticeCity, setNoticeCity] = useState('São Paulo');

  const getExtrajudicialNoticeFullText = () => {
    return `NOTIFICAÇÃO EXTRAJUDICIAL

A(O) NOTIFICADO(A):
${notifiedName.toUpperCase()}
CNPJ/CPF nº ${notifiedCnpj}

NOTIFICANTE:
${notifierName.toUpperCase()}
CNPJ/CPF nº ${notifierCnpj}

Pela presente NOTIFICAÇÃO EXTRAJUDICIAL, servimo-nos da presente para formalizar o quanto segue:

${noticePurpose === 'debt' 
  ? `Constatou-se a pendência financeira inadimplida no montante atualizado de R$ ${noticeDebtValue}, referente a obrigações contratuais vencidas e não quitadas até a presente data.

Fica o(a) Notificado(a) formalmente cientificado(a) a purgar a mora no prazo improrrogável de ${noticeDeadlineDays} (cinco) dias úteis contados do recebimento desta, efetuando o pagamento da quantia supramencionada.`
  : `Vimos por meio desta notificar formalmente a desocupação voluntária do imóvel locado no prazo fatal de ${noticeDeadlineDays} (trinta) dias, entregando as chaves livres de pessoas e coisas e devidamente pintado conforme vistoria.`}

ADVERTÊNCIA JURÍDICA:
O não atendimento à presente notificação dentro do prazo legal ensejará a imediata adoção das medidas judiciais cabíveis (Ação de Execução de Título, Despejo, Perdas e Danos e inclusão nos órgãos de proteção ao crédito - SCPC/Serasa), arcando a parte devedora com custas processuais e honorários advocatícios sucumbenciais.

${noticeCity}, ${todayDateString()}.


_________________________________________________
${notifierName.toUpperCase()}
(Notificante)
`;
  };

  // =========================================================================
  // ABA 4: DECLARAÇÃO DE RESIDÊNCIA & HIPOSSUFICIÊNCIA A4
  // =========================================================================
  const [declarantName, setDeclarantName] = useState('FERNANDA CRISTINA GOMES');
  const [declarantNationality, setDeclarantNationality] = useState('brasileira');
  const [declarantMarital, setDeclarantMarital] = useState('solteira');
  const [declarantProfession, setDeclarantProfession] = useState('designer');
  const [declarantRg, setDeclarantRg] = useState('33.444.555-6 SSP/SP');
  const [declarantCpf, setDeclarantCpf] = useState('333.444.555-66');
  const [declaredAddress, setDeclaredAddress] = useState('Rua Bela Cintra, nº 890, Apto 32, Consolação, São Paulo/SP, CEP 01415-000');
  const [declarationType, setDeclarationType] = useState<'residence' | 'poverty'>('residence');
  const [declCity, setDeclCity] = useState('São Paulo');

  const getDeclarationFullText = () => {
    if (declarationType === 'residence') {
      return `DECLARAÇÃO DE RESIDÊNCIA
(Em conformidade com a Lei Federal nº 7.115, de 29 de agosto de 1983)

Eu, ${declarantName.toUpperCase()}, nacionalidade ${declarantNationality}, estado civil ${declarantMarital}, profissão ${declarantProfession}, portador(a) da cédula de identidade RG nº ${declarantRg} e inscrito(a) no CPF/MF sob o nº ${declarantCpf}, DECLARO para os devidos fins de direito, sob as penas da lei, que resido e tenho domicílio no seguinte endereço:

${declaredAddress}.

Por ser expressão da verdade, assumo inteira responsabilidade civil e criminal pelas informações prestadas, estando ciente de que a falsidade na prestação destas declarações configura crime previsto no artigo 299 do Código Penal Brasileiro (Falsidade Ideológica).

${declCity}, ${todayDateString()}.


_________________________________________________
${declarantName.toUpperCase()}
`;
    }

    return `DECLARAÇÃO DE HIPOSSUFICIÊNCIA FINANCEIRA
(Justiça Gratuita - Art. 98 e seguintes do Código de Processo Civil / Lei nº 1.060/1950)

Eu, ${declarantName.toUpperCase()}, nacionalidade ${declarantNationality}, estado civil ${declarantMarital}, profissão ${declarantProfession}, portador(a) do RG nº ${declarantRg} e inscrito(a) no CPF/MF sob o nº ${declarantCpf}, residente na ${declaredAddress}, DECLARO sob as penas da lei que não possuo condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do sustento próprio e de minha família.

Desta forma, requeiro a concessão dos benefícios da GRATUIDADE DA JUSTIÇA, com fulcro no art. 5º, inciso LXXIV da Constituição Federal e artigos 98 e 99 do CPC.

${declCity}, ${todayDateString()}.


_________________________________________________
${declarantName.toUpperCase()}
`;
  };

  // =========================================================================
  // ABA 5: TERMO DE ENTREGA DE CHAVES & QUITAÇÃO A4
  // =========================================================================
  const [keysOwnerName, setKeysOwnerName] = useState('ROBERTO CARLOS MENEZES');
  const [keysTenantName, setKeysTenantName] = useState('CAROLINA DIAS SOUZA');
  const [keysPropertyAddress, setKeysPropertyAddress] = useState('Rua dos Pinheiros, nº 120, Apto 41, Pinheiros, São Paulo/SP');
  const [keysQuantity, setKeysQuantity] = useState('02 chaves da porta principal, 01 chave da portaria e 01 controle de garagem');
  const [keysCity, setKeysCity] = useState('São Paulo');

  const getKeysHandoverFullText = () => {
    return `TERMO DE ENTREGA DE CHAVES E VISTORIA FINAL DE IMÓVEL

LOCADOR(A): ${keysOwnerName.toUpperCase()}
LOCATÁRIO(A): ${keysTenantName.toUpperCase()}
IMÓVEL: ${keysPropertyAddress}

Pelo presente instrumento, o(a) Locatário(a) faz a efetiva devolução e entrega das chaves do imóvel locado, declarando o(a) Locador(a) que as recebe na presente data, compostas por: ${keysQuantity}.

Com a entrega das chaves e a realização da vistoria final no imóvel, as partes declaram:
1. O encerramento definitivo do contrato de locação celebrado entre as partes.
2. A quitação plena, rasa, geral e irrevogável de todos os débitos locatícios, incluindo aluguéis, condomínio, IPTU e contas de consumo, nada mais tendo a reclamar uma da outra a qualquer tempo ou título.

${keysCity}, ${todayDateString()}.


_________________________________________         _________________________________________
LOCADOR(A): ${keysOwnerName.toUpperCase()}         LOCATÁRIO(A): ${keysTenantName.toUpperCase()}


TESTEMUNHAS:
1. _________________________________ CPF: ____________________
2. _________________________________ CPF: ____________________
`;
  };

  const getCurrentDocumentText = () => {
    switch (activeTab) {
      case 'power-of-attorney': return getPowerOfAttorneyFullText();
      case 'rental-contract': return getRentalContractFullText();
      case 'extrajudicial-notice': return getExtrajudicialNoticeFullText();
      case 'residence-declaration': return getDeclarationFullText();
      case 'receipt-keys-handover': return getKeysHandoverFullText();
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-200 shadow-2xl backdrop-blur-md">
      {/* Header da Suíte */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Scale className="w-4 h-4" />
            <span>Capitania #11 · Suíte de Documentos Jurídicos & Cartorários A4</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Minutas, Contratos & Declarações Formais A4
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Pronto para Impressão
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gerador de procurações particulares, contratos de locação (Lei 8.245/91), notificações extrajudiciais, declarações de residência/pobreza e termos de entrega de chaves com impressão limpa (`window.print()`).
          </p>
        </div>

        {/* Status / Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Direito Civil & Imobiliário</span>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('power-of-attorney')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'power-of-attorney'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Procuração Particular</span>
        </button>

        <button
          onClick={() => setActiveTab('rental-contract')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'rental-contract'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Contrato de Locação</span>
        </button>

        <button
          onClick={() => setActiveTab('extrajudicial-notice')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'extrajudicial-notice'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Notificação Extrajudicial</span>
        </button>

        <button
          onClick={() => setActiveTab('residence-declaration')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'residence-declaration'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Declaração de Residência / Pobreza</span>
        </button>

        <button
          onClick={() => setActiveTab('receipt-keys-handover')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'receipt-keys-handover'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Entrega de Chaves & Quitação</span>
        </button>
      </div>

      {/* Grid Principal: Formulário na Esquerda + Pré-visualização A4 na Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* COLUNA ESQUERDA: FORMULÁRIO DINÂMICO (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          {/* =================================================================== */}
          {/* ABA 1: PROCURAÇÃO PARTICULAR */}
          {/* =================================================================== */}
          {activeTab === 'power-of-attorney' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  1. Dados do Outorgante (Quem concede os poderes):
                </span>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    value={grantorName}
                    onChange={(e) => setGrantorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">RG:</label>
                    <input
                      type="text"
                      value={grantorRg}
                      onChange={(e) => setGrantorRg(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">CPF:</label>
                    <input
                      type="text"
                      value={grantorCpf}
                      onChange={(e) => setGrantorCpf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Endereço Residencial Completo:</label>
                  <input
                    type="text"
                    value={grantorAddress}
                    onChange={(e) => setGrantorAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  2. Dados do Outorgado (Quem recebe a procuração):
                </span>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome Completo do Procurador:</label>
                  <input
                    type="text"
                    value={attorneyName}
                    onChange={(e) => setAttorneyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">RG:</label>
                    <input
                      type="text"
                      value={attorneyRg}
                      onChange={(e) => setAttorneyRg(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">CPF:</label>
                    <input
                      type="text"
                      value={attorneyCpf}
                      onChange={(e) => setAttorneyCpf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  3. Escopo de Poderes:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setPowersType('broad')}
                    className={`p-2 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      powersType === 'broad' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Amplos e Gerais
                  </button>
                  <button
                    onClick={() => setPowersType('vehicle')}
                    className={`p-2 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      powersType === 'vehicle' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Venda de Veículo
                  </button>
                  <button
                    onClick={() => setPowersType('bank')}
                    className={`p-2 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      powersType === 'bank' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Bancário & Movimentação
                  </button>
                  <button
                    onClick={() => setPowersType('custom')}
                    className={`p-2 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      powersType === 'custom' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {powersType === 'custom' && (
                  <textarea
                    rows={3}
                    value={customPowers}
                    onChange={(e) => setCustomPowers(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ABA 2: CONTRATO DE LOCAÇÃO */}
          {/* =================================================================== */}
          {activeTab === 'rental-contract' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Partes Contratantes:
                </span>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Locador(a) (Proprietário):</label>
                  <input
                    type="text"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">CPF do Locador:</label>
                  <input
                    type="text"
                    value={landlordCpf}
                    onChange={(e) => setLandlordCpf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Locatário(a) (Inquilino):</label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">CPF do Locatário:</label>
                  <input
                    type="text"
                    value={tenantCpf}
                    onChange={(e) => setTenantCpf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Condições Financeiras da Locação:
                </span>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Endereço do Imóvel Alugado:</label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Aluguel Mensal (R$):</label>
                    <input
                      type="text"
                      value={rentalValue}
                      onChange={(e) => setRentalValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Dia Vencimento:</label>
                    <input
                      type="text"
                      value={rentalDueDay}
                      onChange={(e) => setRentalDueDay(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Prazo (Meses):</label>
                    <input
                      type="text"
                      value={rentalDurationMonths}
                      onChange={(e) => setRentalDurationMonths(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Caução Garantia (R$):</label>
                    <input
                      type="text"
                      value={depositValue}
                      onChange={(e) => setDepositValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ABA 3: NOTIFICAÇÃO EXTRAJUDICIAL */}
          {/* =================================================================== */}
          {activeTab === 'extrajudicial-notice' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Finalidade da Notificação:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNoticePurpose('debt')}
                    className={`p-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      noticePurpose === 'debt' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Cobrança de Débito
                  </button>
                  <button
                    onClick={() => setNoticePurpose('vacate')}
                    className={`p-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      noticePurpose === 'vacate' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Desocupação de Imóvel
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Notificante (Credor):</label>
                  <input
                    type="text"
                    value={notifierName}
                    onChange={(e) => setNotifierName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Notificado (Devedor):</label>
                  <input
                    type="text"
                    value={notifiedName}
                    onChange={(e) => setNotifiedName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>

                {noticePurpose === 'debt' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Valor do Débito (R$):</label>
                      <input
                        type="text"
                        value={noticeDebtValue}
                        onChange={(e) => setNoticeDebtValue(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Prazo Pagamento (Dias):</label>
                      <input
                        type="text"
                        value={noticeDeadlineDays}
                        onChange={(e) => setNoticeDeadlineDays(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Prazo Desocupação (Dias):</label>
                    <input
                      type="text"
                      value={noticeDeadlineDays}
                      onChange={(e) => setNoticeDeadlineDays(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ABA 4: DECLARAÇÃO DE RESIDÊNCIA / HIPOSSUFICIÊNCIA */}
          {/* =================================================================== */}
          {activeTab === 'residence-declaration' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Tipo de Declaração:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeclarationType('residence')}
                    className={`p-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      declarationType === 'residence' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Declaração de Residência
                  </button>
                  <button
                    onClick={() => setDeclarationType('poverty')}
                    className={`p-2.5 rounded-lg text-xs font-bold transition text-left cursor-pointer border ${
                      declarationType === 'poverty' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Justiça Gratuita (Pobreza)
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Declarante:</label>
                  <input
                    type="text"
                    value={declarantName}
                    onChange={(e) => setDeclarantName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">RG:</label>
                    <input
                      type="text"
                      value={declarantRg}
                      onChange={(e) => setDeclarantRg(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">CPF:</label>
                    <input
                      type="text"
                      value={declarantCpf}
                      onChange={(e) => setDeclarantCpf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Endereço Declarado:</label>
                  <input
                    type="text"
                    value={declaredAddress}
                    onChange={(e) => setDeclaredAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ABA 5: TERMO DE ENTREGA DE CHAVES & QUITAÇÃO */}
          {/* =================================================================== */}
          {activeTab === 'receipt-keys-handover' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  Dados do Termo de Devolução:
                </span>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Locador:</label>
                  <input
                    type="text"
                    value={keysOwnerName}
                    onChange={(e) => setKeysOwnerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Locatário:</label>
                  <input
                    type="text"
                    value={keysTenantName}
                    onChange={(e) => setKeysTenantName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Endereço do Imóvel:</label>
                  <input
                    type="text"
                    value={keysPropertyAddress}
                    onChange={(e) => setKeysPropertyAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Discriminação das Chaves Entregues:</label>
                  <textarea
                    rows={2}
                    value={keysQuantity}
                    onChange={(e) => setKeysQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação Geral */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => copyToClipboard(getCurrentDocumentText(), 'doc-copy')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-200 transition cursor-pointer"
            >
              {copiedId === 'doc-copy' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedId === 'doc-copy' ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO A4 (7 colunas) */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Visualização em Folha A4 Padrão:
              </span>
              <span className="text-[11px] text-slate-500">Formato Oficial ABNT / Judiciário</span>
            </div>

            {/* Folha A4 com Efeito Papel Físico */}
            <div className="bg-white text-slate-900 rounded-xl p-8 sm:p-10 shadow-2xl border border-slate-300 min-h-[580px] font-serif text-sm leading-relaxed whitespace-pre-wrap select-all">
              {getCurrentDocumentText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
