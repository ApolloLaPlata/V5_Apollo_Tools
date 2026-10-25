import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'V5 Apollo Tools • Central de Utilitários & Workflows ComfyUI',
  description: 'Micro-ferramentas rápidas estilo Invertexto e workflows de ComfyUI para E-commerce, IA e Mídia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#090a0f] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 font-sans">
        {children}
      </body>
    </html>
  );
}
