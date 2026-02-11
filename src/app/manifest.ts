import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KYN - Finanças Pessoais',
    short_name: 'KYN',
    description: 'Gestão financeira pessoal simples e segura. Registre gastos pelo WhatsApp.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#070b14',
    theme_color: '#10b77f',
    orientation: 'portrait',
    lang: 'pt-BR',
    categories: ['finance', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
