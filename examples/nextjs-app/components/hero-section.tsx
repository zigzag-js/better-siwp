import { Badge } from "@/components/ui/badge";
import { Github, Book } from "lucide-react";

export function HeroSection() {
  return (
    <div className="text-center space-y-6 mb-12">
      <Badge variant="secondary" className="mb-4">
        Web3 Authentication Made Simple
      </Badge>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Better-SIWS
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Production-ready Polkadot wallet authentication using Better-Auth. 
        Sign in with your Substrate wallet as easily as clicking a button.
      </p>
      
      <div className="flex gap-4 justify-center pt-4">
        <a
          href="https://github.com/itsyogesh/better-siws"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
        <a
          href="https://docs.better-siws.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Book className="h-4 w-4" />
          Documentation
        </a>
      </div>
    </div>
  );
}