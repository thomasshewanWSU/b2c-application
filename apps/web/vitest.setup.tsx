import "./src/app/globals.css";

// Mock process.env for Next.js Image component
if (typeof window !== 'undefined' && typeof process === 'undefined') {
    (window as any).process = {
      env: {
        __NEXT_IMAGE_OPTS: {
          deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
          imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
          path: '/_next/image',
          loader: 'default',
          domains: [],
          remotePatterns: [],
          unoptimized: true,
        },
        NODE_ENV: 'test'
      } as any
    };
  }