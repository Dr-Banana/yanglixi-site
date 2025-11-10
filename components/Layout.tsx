import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  isAdmin?: boolean;
}

export default function Layout({ 
  children, 
  title = "Lixi's Kitchen - Cooking with Love",
  description = "A personal cooking journal documenting culinary adventures and favorite recipes",
  isAdmin = false
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header isAdmin={isAdmin} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

