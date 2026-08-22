import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import MotionProvider from '@/components/MotionProvider';
import PageTransition from '@/components/PageTransition';
import { ThemeProvider } from 'next-themes';
import JsonLd from '@/components/JsonLd';
import { BRAND_VERSION, siteConfig } from '@/lib/site';
import { cspNonce } from '@/lib/nonce';
import { BACKGROUND } from '@/lib/brand';

// One variable-font instance covers every weight; --font-display maps to it in
// globals.css. Mono is a system stack, so this is the only family downloaded.
const grotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Versioned so a SITE_* change moves the URL; the renderers live in app/brand/.
const ogImage = `/brand/opengraph-image?v=${BRAND_VERSION}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    // Per-route titles inherit this template: "About | Professional Portfolio".
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: `/brand/icon?v=${BRAND_VERSION}`,
    apple: `/brand/apple-icon?v=${BRAND_VERSION}`,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale.replace('-', '_'),
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Matches browser chrome to the page background.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BACKGROUND.light },
    { media: '(prefers-color-scheme: dark)', color: BACKGROUND.dark },
  ],
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: siteConfig.author,
  url: siteConfig.url,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // next-themes writes an inline pre-paint script; Next only nonces its own.
  const nonce = await cspNonce();

  return (
    <html
      lang={siteConfig.locale}
      className={grotesk.variable}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-background text-gray-900 dark:text-gray-100 flex flex-col min-h-screen"
        suppressHydrationWarning
      >
        <JsonLd data={personJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <MotionProvider>
            <BackgroundCanvas />
            <Navbar monogram={siteConfig.monogram} />
            <main id="main-content" className="flex-grow pt-20">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
