import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Aegis-Rail | Infrastructure & Transit Simulation',
  description: 'Enterprise-grade rail transit simulation, bottleneck prediction, and rerouting control center.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ocean-bg text-ocean-light min-h-screen flex flex-col antialiased selection:bg-ocean-mauve selection:text-white font-mono">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}