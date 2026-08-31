import type { NextConfig } from 'next'

// Derivado de NEXT_PUBLIC_SUPABASE_URL para que la imagen Docker sea portable
// entre entornos (dev/staging/prod) sin tener que tocar código.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  // Standalone: produce un .next/standalone autocontenido, ideal para Docker
  // (copia solo los node_modules realmente usados en runtime).
  output: 'standalone',
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/sign/**',
          },
        ]
      : [],
  },
}

export default nextConfig
