import type { LaunchPostMortem } from "@/types/launches";
import { Star } from "lucide-react";

function ListSection({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className: string;
}) {
  if (!items.length) return null;
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ul className={`space-y-1.5 rounded-lg border px-3 py-3 text-sm ${className}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function LaunchPostMortemPanel({
  postMortem,
}: {
  postMortem: LaunchPostMortem;
}) {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h4 className="text-sm font-medium">Resumen ejecutivo</h4>
        <p className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {postMortem.summary}
        </p>
      </section>

      <ListSection
        title="✅ Qué funcionó"
        items={postMortem.what_worked}
        className="border-emerald-500/20 bg-emerald-500/5 text-emerald-100"
      />
      <ListSection
        title="❌ Qué no funcionó"
        items={postMortem.what_didnt_work}
        className="border-red-500/20 bg-red-500/5 text-red-100"
      />
      <ListSection
        title="💡 Aprendizajes clave"
        items={postMortem.key_learnings}
        className="border-amber-500/20 bg-amber-500/5 text-amber-100"
      />
      <ListSection
        title="🚀 Recomendaciones próximo lanzamiento"
        items={postMortem.next_launch_recommendations}
        className="border-blue-500/20 bg-blue-500/5 text-blue-100"
      />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Rating:</span>
        <span className="text-lg font-semibold tabular-nums">
          {postMortem.overall_rating}/10
        </span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < postMortem.overall_rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
