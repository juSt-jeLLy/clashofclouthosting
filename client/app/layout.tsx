import "@/styles/globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import ContextProvider from '@/app/context';
import Navbar from './_components/Navbar';
import Footer from './_components/Footer';

export const metadata: Metadata = {
  title: 'Clash of Clout',
  description: 'Web3 Meme Battle Platform - Powered by WalletConnect',
};

export default async function RootLayout({ 
  children 
}: Readonly<{ 
  children: React.ReactNode 
}>) {
  const cookies = (await headers()).get('cookie');

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          <div className="min-h-screen flex flex-col bg-gradient-to-r from-purple-900 to-pink-900">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
