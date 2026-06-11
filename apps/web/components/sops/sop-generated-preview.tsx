import { Sparkles } from "lucide-react";
import type { GeneratedSop } from "@/types/sops";

export function SopGeneratedPreview({ sop }: { sop: GeneratedSop }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 border-b border-border/40 pb-4 dark:border-white/[0.08]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            SOP generado por IA
          </p>
          <h3 className="mt-1 text-base font-medium leading-snug">{sop.title}</h3>
        </div>
      </div>

      {sop.sections.map((section) => (
        <section key={section.title}>
          <h4 className="mb-2 text-sm font-medium text-foreground">
            {section.title}
          </h4>
          <ul className="space-y-1.5">
            {section.items.map((item, index) => (
              <li
                key={index}
                className="text-sm leading-relaxed text-muted-foreground before:mr-2 before:text-violet-400 before:content-['•']"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
