export function RadarPlaceholder() {
  return (
    <div className="flex aspect-square w-full max-w-[240px] items-center justify-center sm:max-w-[300px]">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label="No capability scores to show"
        className="h-full w-full text-navy"
      >
        <title>No capability scores to show</title>
        {[1, 2, 3, 4].map((ring) => (
          <polygon
            key={ring}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1 + ring * 0.05}
            strokeWidth="1"
            points={hexPoints(100, 100, ring * 18)}
          />
        ))}
        {Array.from({ length: 6 }, (_, index) => {
          const angle = (Math.PI / 3) * index - Math.PI / 2;
          const x = 100 + Math.cos(angle) * 72;
          const y = 100 + Math.sin(angle) * 72;

          return (
            <line
              key={index}
              x1="100"
              y1="100"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          fill="currentColor"
          fillOpacity="0.06"
          stroke="#0B6B64"
          strokeOpacity="0.55"
          strokeWidth="1.5"
          points={hexPoints(100, 100, 28)}
        />
        <circle cx="100" cy="100" r="3.5" fill="#0B6B64" />
      </svg>
    </div>
  );
}

function hexPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}
