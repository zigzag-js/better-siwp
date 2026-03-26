import { HeroSection } from "@/components/hero-section";
import { AuthCard } from "@/components/auth/auth-card";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b]">
      {/* Background gradient mesh */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[40%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#E6007A]/8 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[#552BBF]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E6007A]/20 to-transparent" />
      </div>

      {/* Dot grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:py-28">
        <HeroSection />
        <AuthCard />

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-sm text-zinc-600">
            Part of the{" "}
            <a
              href="https://github.com/zigzag-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-[#E6007A]"
            >
              ZigZag
            </a>{" "}
            ecosystem
          </p>
        </footer>
      </div>
    </main>
  );
}
