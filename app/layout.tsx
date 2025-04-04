import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import RecoilProvider from '@/providers/RecoilProvider';
import QueryClientProvider from '@/providers/QueryClientProvider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: '10Km',
  description: '10Km',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RecoilProvider>
          <QueryClientProvider>{children}</QueryClientProvider>
        </RecoilProvider>
      </body>
    </html>
  );
}
