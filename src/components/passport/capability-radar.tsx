import { RadarPlaceholder } from "@/components/passport/radar-placeholder";
import { formatCapabilityScore, scoreToChartRatio } from "@/lib/domain/scores";
import type { PublicCapability } from "@/lib/domain/types";

const CX = 120;
const CY = 120;
const MAX_RADIUS = 72;

type RadarCapability = PublicCapability & {
  id?: string;
};

type CapabilityRadarProps = {
  capabilities: RadarCapability[];
};

export function CapabilityRadar({ capabilities }: CapabilityRadarProps) {
  if (capabilities.length === 0) {
    return <RadarPlaceholder />;
  }

  const count = capabilities.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const valuePoints = capabilities.map((capability, index) =>
    point(scoreToChartRatio(capability.score) * MAX_RADIUS, index, count),
  );
  const chartLabel = capabilities
    .map(
      (capability) =>
        `${capability.name} ${formatCapabilityScore(capability.score)}`,
    )
    .join(". ");

  return (
    <div className="flex aspect-square w-full max-w-[240px] items-center justify-center sm:max-w-[300px]">
      <svg
        viewBox="0 0 240 240"
        role="img"
        aria-label={`Capability scores. ${chartLabel}`}
        className="h-full w-full text-navy"
      >
        <title>Capability scores</title>
        {rings.map((ring) => (
          <polygon
            key={ring}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12 + ring * 0.08}
            strokeWidth="1"
            points={regularPolygon(MAX_RADIUS * ring, count)}
          />
        ))}
        {capabilities.map((capability, index) => {
          const end = point(MAX_RADIUS, index, count);

          return (
            <line
              key={capability.id ?? capability.name}
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          fill="currentColor"
          fillOpacity="0.08"
          stroke="#0B6B64"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          points={valuePoints
            .map((value) => `${value.x.toFixed(1)},${value.y.toFixed(1)}`)
            .join(" ")}
        />
        {valuePoints.map((value, index) => (
          <circle
            key={capabilities[index]?.id ?? capabilities[index]?.name ?? index}
            cx={value.x}
            cy={value.y}
            r="3"
            fill="#0B6B64"
          />
        ))}
        {capabilities.map((capability, index) => {
          const label = point(MAX_RADIUS + 22, index, count);
          const words = capability.name.split(" ");
          const firstWord = words[0] ?? capability.name;
          const rest = words.slice(1);

          return (
            <text
              key={`${capability.id ?? capability.name}-label`}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-navy"
              fontSize="8"
              fontWeight="600"
            >
              {rest.length > 0 ? (
                <>
                  <tspan x={label.x} dy="-0.45em">
                    {firstWord}
                  </tspan>
                  <tspan x={label.x} dy="1.15em">
                    {rest.join(" ")}
                  </tspan>
                </>
              ) : (
                firstWord
              )}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function point(radius: number, index: number, count: number) {
  const angle = ((Math.PI * 2) / count) * index - Math.PI / 2;

  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
}

function regularPolygon(radius: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const value = point(radius, index, count);
    return `${value.x.toFixed(1)},${value.y.toFixed(1)}`;
  }).join(" ");
}
