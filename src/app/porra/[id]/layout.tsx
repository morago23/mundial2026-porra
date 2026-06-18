import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params safely for Next.js 15+ compatibility
  const resolvedParams = await params;
  const id = resolvedParams.id.toUpperCase();
  
  return {
    title: `🏆 Porra Mundial 2026 - Código: ${id}`,
    description: `Únete a esta porra privada del Mundial 2026. Tu código de invitación es ${id}. Construye tu equipo con 115 puntos y compite.`,
    openGraph: {
      title: `🏆 Únete a mi Liga Privada - Mundial 2026`,
      description: `Código de invitación: ${id}. Construye tu equipo con 115 puntos y demuestra quién sabe más de fútbol.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `🏆 Únete a mi Liga Privada - Mundial 2026`,
      description: `Código de invitación: ${id}.`,
    }
  };
}

export default function PorraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
