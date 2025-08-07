import { HeroSection } from "@/components/hero-section";
import { AuthCard } from "@/components/auth/auth-card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <HeroSection />
        <AuthCard />
      </div>
    </main>
  );
}