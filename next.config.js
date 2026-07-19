/** @type {import('next').NextConfig} */

function supabaseRemotePattern() {
  try {
    const url = new URL(process.env.SUPABASE_URL || '');
    return [
      {
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        pathname: '/storage/v1/object/public/**'
      }
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  output: 'standalone',
  images: {
    // Le Next Image Optimizer (sharp) n'est pas installe dans ce deploiement
    // Docker self-hoste : on sert les images telles quelles, sans recompression/
    // redimensionnement serveur, tout en gardant les benefices de next/image
    // (lazy loading natif, dimensions reservees pour eviter le layout shift).
    unoptimized: true,
    remotePatterns: supabaseRemotePattern()
  }
};

module.exports = nextConfig;
