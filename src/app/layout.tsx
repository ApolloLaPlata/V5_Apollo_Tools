import type { Metadata, Viewport } from 'next';
import './globals.css';


export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'V5 Apollo Tools • Canivete Suíço de Produtividade, Dev & Workflows ComfyUI',
  description: 'Mais de 530 ferramentas soberanas client-side: 4Devs, Invertexto, Workflows ComfyUI e IA Criativa Apollo La Plata. Zero custo de API e privacidade total.',
  keywords: [
    '4devs',
    'invertexto',
    'gerador de cpf',
    'gerador de cnpj',
    'validador de cpf',
    'comfyui workflows',
    'nordy ai',
    'ferramentas online',
    'v5 apollo',
    'ferramentas de desenvolvedor',
    'calculadora de juros compostos',
    'qrcode pix'
  ],
  authors: [{ name: 'Holding V5 Apollo', url: 'https://v5apollo.com' }],
  creator: 'Apollo La Plata',
  publisher: 'Holding V5 Apollo',
  metadataBase: new URL('https://tools.v5apollo.com'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'V5 Apollo Tools • Canivete Suíço de Produtividade & IA',
    description: 'A união definitiva das utilidades de desenvolvedor do 4Devs, agilidade do Invertexto e workflows de IA do Nordy.ai ComfyUI.',
    url: 'https://tools.v5apollo.com',
    siteName: 'V5 Apollo Tools',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'V5 Apollo Tools • Canivete Suíço de Produtividade & IA',
    description: 'Mais de 530 ferramentas gratuitas e soberanas para desenvolvedores, QA e criadores de conteúdo.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'V5 Apollo Tools',
    url: 'https://tools.v5apollo.com',
    description: 'Central unificada com mais de 530 ferramentas de produtividade, desenvolvimento e workflows ComfyUI.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    creator: {
      '@type': 'Organization',
      name: 'Holding V5 Apollo',
      url: 'https://v5apollo.com',
    },
  };

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#020617] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 font-sans">
        {children}
      </body>
    </html>
  );
}
