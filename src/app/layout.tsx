import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Porra Mundialista 2026 🏆",
  description:
    "La app de porra del Mundial 2026. Elige tus 10 selecciones, crea tu liga con amigos y compite por ser el mejor pronosticador.",
  keywords: ["mundial 2026", "porra", "fantasy", "fútbol", "FIFA World Cup"],
  openGraph: {
    title: "Porra Mundialista 2026 🏆",
    description: "Crea tu porra del Mundial 2026 con amigos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <AuthProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <p>
              🏆 Porra Mundialista 2026 &nbsp;·&nbsp; Datos:{" "}
              <a
                href="https://worldcup26.ir"
                target="_blank"
                rel="noopener noreferrer"
              >
                worldcup26.ir
              </a>
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
