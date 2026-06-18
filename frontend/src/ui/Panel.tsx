import { ReactNode } from "react";

import { cn } from "@/ui/cn";

interface PanelProps {
  title?: string;
  /** Optional element rendered on the right side of the header. */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** A rounded, subtly elevated surface — the building block of the layout. */
export function Panel({ title, action, className, bodyClassName, children }: PanelProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-surface-border",
        "bg-surface/80 shadow-card backdrop-blur",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-surface-border px-4 py-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={cn("min-h-0 flex-1 overflow-auto p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
