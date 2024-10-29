import './global.css';
import { Header } from './header';
import { Footer } from './footer';
import { Providers } from './providers';

export const metadata = {
  title: 'Inkstain',
  description: 'Inkstain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
