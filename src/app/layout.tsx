import type { Metadata } from 'next';
import { Google_Sans_Flex } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin'],
  variable: '--font-google-sans-flex',
  display: 'swap',
});

const gilroy = localFont({
  src: [
    { path: '../../public/fonts/Gilroy-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../../public/fonts/Gilroy-ThinItalic.ttf', weight: '100', style: 'italic' },
    { path: '../../public/fonts/Gilroy-UltraLight.ttf', weight: '200', style: 'normal' },
    { path: '../../public/fonts/Gilroy-UltraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: '../../public/fonts/Gilroy-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Gilroy-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/Gilroy-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Gilroy-RegularItalic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/Gilroy-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Gilroy-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/Gilroy-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/Gilroy-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/Gilroy-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Gilroy-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../public/fonts/Gilroy-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../../public/fonts/Gilroy-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
    { path: '../../public/fonts/Gilroy-Heavy.ttf', weight: '900', style: 'normal' },
    { path: '../../public/fonts/Gilroy-HeavyItalic.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Akuila - Platform Pembuat Micro-Site Premium',
  description: 'Buat undangan pernikahan, kartu ucapan, dan hadiah personal digital yang indah dan interaktif. Platform SaaS micro-site builder terbaik di Indonesia.',
  keywords: 'undangan digital, micro-site, kartu ucapan, hadiah personal, wedding invitation, QRIS',
};

/* Inline script to prevent FOUC — runs before React hydrates */
const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('akuila-theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${googleSansFlex.variable} ${gilroy.variable}`} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
