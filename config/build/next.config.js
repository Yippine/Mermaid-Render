/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['cytoscape'],
  },
  webpack: config => {
    // Cytoscape.js requires special handling
    config.externals = config.externals || []
    config.externals.push({
      cytoscape: 'cytoscape',
    })

    return config
  },
}

module.exports = nextConfig
