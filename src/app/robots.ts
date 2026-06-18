import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/mis-porras/', '/porra/*/apostar', '/porra/*/predicciones'],
    },
    sitemap: 'https://mundial2026porra.com/sitemap.xml',
  }
}
