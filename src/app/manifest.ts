import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'V5 Tools Suite',
    short_name: 'Tools Suite',
    description: 'Canivete Suíço de Utilitários Técnicos e Validadores para Desenvolvedores',
    start_url: '/',
    display: 'standalone',
    background_color: '#060a15',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
