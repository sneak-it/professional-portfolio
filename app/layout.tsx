// Type-only: ViewTransition lives in React's canary channel, which is what the
// App Router runs (its bundled React exports it) while node_modules/react does
// not. A reference rather than `import {} from 'react/canary'` because that
// module has no runtime counterpart and the bundler fails to resolve it.
/// <reference types="react/canary" />
import type { Metadata, Viewport } from 'next';
import { ViewTransition } from 'react';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackgroundCanvas from '@/components/BackgroundCanvas';
import MotionProvider from '@/components/MotionProvider';
import { ThemeProvider } from 'next-themes';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from '@/lib/site';
import { BACKGROUND } from '@/lib/brand';

// One characterful neo-grotesque carries both body and display: a single
// variable-font instance covers every weight we use (incl. the display
// 600/700/800), so --font-display maps to this same instance in globals.css
// @theme instead of fetching the family a second time. A monospace handles
// small-caps labels / meta / numbers.
const grotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Themes the mobile browser chrome to match the page background in each scheme.
// Static rather than generateViewport: it depends on nothing about the request.
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${mono.variable}`}
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
        >
          <MotionProvider>
            <BackgroundCanvas />
            <Navbar monogram={siteConfig.monogram} />
            <main id="main-content" className="flex-grow pt-20">
              {/* Route crossfade. The layout persists while `children` swaps,
                  which React treats as an update and animates; the class is
                  styled in globals.css. Replaces a hand-rolled click
                  interceptor + document.startViewTransition. */}
              <ViewTransition default="page-crossfade">
                {children}
              </ViewTransition>
            </main>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
