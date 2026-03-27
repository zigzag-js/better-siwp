import { Github, BookOpen } from "lucide-react";
import { InstallCommand } from "@/components/ui/install-command";

export function HeroSection() {
  return (
    <div className="mb-16 text-center">
      {/* Tag */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100/60 px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E6007A] shadow-[0_0_6px_#E6007A]" />
        Sign In With Polkadot
      </div>

      <h1 className="mb-4 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-7xl">
        better-
        <span className="bg-gradient-to-r from-[#E6007A] to-[#552BBF] bg-clip-text text-transparent">
          siwp
        </span>
      </h1>

      <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
        Polkadot wallet authentication for{" "}
        <span className="text-zinc-800 dark:text-zinc-200">Better-Auth</span>. One plugin, one
        signature, full session management.
      </p>

      <div className="flex items-center justify-center gap-6">
        <a
          href="https://github.com/zigzag-js/better-siwp"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
        >
          <Github className="h-4 w-4" />
          <span className="underline decoration-zinc-300 underline-offset-4 group-hover:decoration-zinc-500 dark:decoration-zinc-700 dark:group-hover:decoration-zinc-400">
            GitHub
          </span>
        </a>
        <span className="text-zinc-300 dark:text-zinc-800">|</span>
        <a
          href="https://www.npmjs.com/package/@zig-zag/better-siwp"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
        >
          <BookOpen className="h-4 w-4" />
          <span className="underline decoration-zinc-300 underline-offset-4 group-hover:decoration-zinc-500 dark:decoration-zinc-700 dark:group-hover:decoration-zinc-400">
            npm
          </span>
        </a>
      </div>

      {/* Install command with tabs */}
      <div className="mt-8">
        <InstallCommand />
      </div>
    </div>
  );
}
