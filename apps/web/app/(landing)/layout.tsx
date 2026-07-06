import { MetaPixel } from "@/components/landing/meta-pixel";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <MetaPixel />
      <div className="landing-ambient" aria-hidden />
      <div className="app-ambient" aria-hidden />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
