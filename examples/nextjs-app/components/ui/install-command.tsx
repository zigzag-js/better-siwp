"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const managers = [
  { id: "npm", label: "npm", command: "npm i @zig-zag/better-siwp" },
  { id: "yarn", label: "yarn", command: "yarn add @zig-zag/better-siwp" },
  { id: "pnpm", label: "pnpm", command: "pnpm add @zig-zag/better-siwp" },
] as const;

export function InstallCommand() {
  const [active, setActive] = useState<string>("npm");
  const [copied, setCopied] = useState(false);

  const activeManager = managers.find((m) => m.id === active)!;

  const copyCommand = () => {
    navigator.clipboard.writeText(activeManager.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      {/* Tabs header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex gap-1">
          {managers.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                active === m.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={copyCommand}
          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      {/* Command */}
      <div className="bg-white px-4 py-3 dark:bg-zinc-950">
        <code className="font-mono text-sm text-zinc-800 dark:text-zinc-300">
          {activeManager.command}
        </code>
      </div>
    </div>
  );
}
