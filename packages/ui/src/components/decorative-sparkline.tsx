const SPARKLINE_PATHS: Record<string, string> = {
  reach: "0,38 16,30 32,32 48,18 64,20 80,8",
  engage: "0,36 20,28 40,30 60,20 80,14",
  convert: "0,38 20,32 40,28 60,18 80,10",
  growth: "0,40 20,34 40,28 60,22 80,12",
  comments: "0,36 20,30 40,32 60,22 80,16",
};

export type MetricSparklinePreset = keyof typeof SPARKLINE_PATHS;

export function DecorativeSparkline({
  preset,
  color,
}: {
  preset: MetricSparklinePreset;
  color: string;
}) {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 opacity-30"
      width="80"
      height="44"
      viewBox="0 0 80 44"
      aria-hidden="true"
    >
      <polyline
        points={SPARKLINE_PATHS[preset]}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}
