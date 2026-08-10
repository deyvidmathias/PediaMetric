import { useEffect, useId, useMemo, useState } from "react";
import type {
  GrowthChartIndicator,
  GrowthChartModel,
  GrowthChartZScore
} from "../anthropometry/index.ts";

const WIDTH = 760;
const HEIGHT = 420;
const PLOT = { left: 66, right: 26, top: 34, bottom: 58 } as const;

const INDICATOR_LABELS: Readonly<Record<GrowthChartIndicator, string>> = {
  WEIGHT_FOR_AGE: "Peso",
  HEIGHT_FOR_AGE: "Comprimento / altura",
  HEAD_CIRCUMFERENCE_FOR_AGE: "Perímetro cefálico",
  BMI_FOR_AGE: "IMC"
};

const Z_LABELS: Readonly<Record<GrowthChartZScore, string>> = {
  [-3]: "−3",
  [-2]: "−2",
  [-1]: "−1",
  0: "0",
  1: "+1",
  2: "+2",
  3: "+3"
};

const formatNumber = (value: number, digits = 1) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: value === 0 ? "never" : "auto"
  }).format(value);

const formatUnit = (unit: GrowthChartModel["measurementUnit"]) =>
  unit === "kg/m2" ? "kg/m²" : unit;

const formatAge = (months: number) => {
  if (months < 24) return `${formatNumber(months, months < 3 ? 1 : 0)} meses`;
  const years = Math.floor(months / 12);
  const remainder = Math.round(months - years * 12);
  return remainder > 0 ? `${years}a ${remainder}m` : `${years} anos`;
};

function extent(values: readonly number[], fallback: readonly [number, number]): [number, number] {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return [...fallback];
  const minimum = Math.min(...finite);
  const maximum = Math.max(...finite);
  if (minimum === maximum) return [minimum - 1, maximum + 1];
  return [minimum, maximum];
}

function ticks(minimum: number, maximum: number, count = 6): number[] {
  return Array.from({ length: count }, (_, index) =>
    minimum + ((maximum - minimum) * index) / (count - 1)
  );
}

function curveClass(zScore: GrowthChartZScore) {
  if (zScore === 0) return "growth-curve growth-curve-zero";
  if (Math.abs(zScore) === 2) return "growth-curve growth-curve-two";
  if (Math.abs(zScore) === 3) return "growth-curve growth-curve-three";
  return "growth-curve";
}

function GrowthChart({ model }: { model: GrowthChartModel }) {
  const titleId = useId();
  const descriptionId = useId();
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;

  const geometry = useMemo(() => {
    const curvePoints = model.curves.flatMap((curve) => curve.points);
    const xValues = curvePoints.map((point) => point.ageMonths);
    const yValues = curvePoints.map((point) => point.measurement);

    // O domínio inclui o marcador real. A coordenada nunca é limitada à borda.
    if (model.marker) {
      xValues.push(model.marker.ageMonths);
      yValues.push(model.marker.measurement);
    }

    const [rawXMin, rawXMax] = extent(xValues, [0, 24]);
    const [rawYMin, rawYMax] = extent(yValues, [0, 100]);
    const xPadding = (rawXMax - rawXMin) * 0.025;
    const yPadding = (rawYMax - rawYMin) * 0.08;
    const xMin = rawXMin <= xPadding ? 0 : rawXMin - xPadding;
    const xMax = rawXMax + xPadding;
    const yMin = rawYMin - yPadding;
    const yMax = rawYMax + yPadding;
    const x = (ageMonths: number) =>
      PLOT.left + ((ageMonths - xMin) / (xMax - xMin)) * plotWidth;
    const y = (measurement: number) =>
      PLOT.top + (1 - (measurement - yMin) / (yMax - yMin)) * plotHeight;

    return {
      x,
      y,
      xTicks: ticks(xMin, xMax),
      yTicks: ticks(yMin, yMax),
      paths: model.curves.map((curve) => ({
        zScore: curve.zScore,
        d: curve.points
          .filter((point) => Number.isFinite(point.ageMonths) && Number.isFinite(point.measurement))
          .map((point, index) => `${index === 0 ? "M" : "L"}${x(point.ageMonths).toFixed(2)},${y(point.measurement).toFixed(2)}`)
          .join(" ")
      }))
    };
  }, [model, plotHeight, plotWidth]);

  const indicator = INDICATOR_LABELS[model.indicator];
  const unit = formatUnit(model.measurementUnit);
  const reference = model.reference.replace("_", " ");
  const marker = model.marker;
  const hasCurves = model.curves.some((curve) => curve.points.length > 0);

  if (!hasCurves) {
    return (
      <div className="growth-reference-unavailable" role="status">
        <span aria-hidden="true">Z</span>
        <div>
          <strong>Referência não disponível nesta faixa etária</strong>
          <p>{model.unavailableReason ?? "Não há curvas oficiais para este indicador."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="growth-chart-canvas">
      <div className="growth-svg-scroll">
        <svg
          className="growth-chart-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
        <title id={titleId}>Curva de {indicator.toLocaleLowerCase("pt-BR")} por idade</title>
        <desc id={descriptionId}>
          Sete curvas de referência, de escore Z menos três a mais três. A curva Z zero é destacada.
          {marker
            ? ` A criança está em ${formatAge(marker.ageMonths)}, com ${formatNumber(marker.measurement)} ${unit} e escore Z ${formatNumber(marker.zScore, 2)}.`
            : ` O marcador da criança não está disponível: ${model.unavailableReason ?? "sem resultado válido"}.`}
        </desc>

        <defs>
          <linearGradient id={`${titleId}-plot`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b3856" stopOpacity="0.5" />
            <stop offset="1" stopColor="#041a2d" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id={`${titleId}-marker`}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.28" stopColor="#76fff0" />
            <stop offset="1" stopColor="#09b9d7" />
          </radialGradient>
          <filter id={`${titleId}-glow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id={`${titleId}-clip`}>
            <rect x={PLOT.left} y={PLOT.top} width={plotWidth} height={plotHeight} rx="12" />
          </clipPath>
        </defs>

        <rect
          className="growth-plot-background"
          x={PLOT.left}
          y={PLOT.top}
          width={plotWidth}
          height={plotHeight}
          rx="12"
          fill={`url(#${titleId}-plot)`}
        />

        {geometry.yTicks.map((value) => {
          const position = geometry.y(value);
          return (
            <g className="growth-grid" key={`y-${value}`} aria-hidden="true">
              <line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={position} y2={position} />
              <text x={PLOT.left - 10} y={position + 4} textAnchor="end">{formatNumber(value)}</text>
            </g>
          );
        })}

        {geometry.xTicks.map((value) => {
          const position = geometry.x(value);
          return (
            <g className="growth-grid" key={`x-${value}`} aria-hidden="true">
              <line x1={position} x2={position} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} />
              <text x={position} y={HEIGHT - PLOT.bottom + 24} textAnchor="middle">{formatNumber(value, 0)}</text>
            </g>
          );
        })}

        <text className="growth-axis-label" x={PLOT.left + plotWidth / 2} y={HEIGHT - 10} textAnchor="middle">
          Idade (meses)
        </text>
        <text
          className="growth-axis-label"
          x="15"
          y={PLOT.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 15 ${PLOT.top + plotHeight / 2})`}
        >
          {unit}
        </text>

        <g clipPath={`url(#${titleId}-clip)`} aria-hidden="true">
          {geometry.paths.map((path) => (
            <path className={curveClass(path.zScore)} d={path.d} key={path.zScore} vectorEffect="non-scaling-stroke" />
          ))}
          {marker ? (
            <g className={marker.biologicallyImplausible ? "growth-marker marker-alert" : "growth-marker"}>
              <circle
                className="growth-marker-halo"
                cx={geometry.x(marker.ageMonths)}
                cy={geometry.y(marker.measurement)}
                r="17"
                filter={`url(#${titleId}-glow)`}
              />
              <circle
                className="growth-marker-point"
                cx={geometry.x(marker.ageMonths)}
                cy={geometry.y(marker.measurement)}
                r="7"
                fill={`url(#${titleId}-marker)`}
              />
            </g>
          ) : null}
        </g>
        </svg>
      </div>

      <div className="growth-z-legend" aria-label="Legenda das curvas de escore Z">
        {model.curves.map((curve) => (
          <span className={`z-legend-item z-${curve.zScore < 0 ? `minus-${Math.abs(curve.zScore)}` : curve.zScore}`} key={curve.zScore}>
            <i className={curveClass(curve.zScore)} /> Z {Z_LABELS[curve.zScore]}
          </span>
        ))}
      </div>

      {marker ? (
        <dl className="growth-marker-detail">
          <div><dt>Idade</dt><dd>{formatAge(marker.ageMonths)}</dd></div>
          <div><dt>Medida</dt><dd>{formatNumber(marker.measurement)} {unit}</dd></div>
          <div><dt>Escore Z</dt><dd>{formatNumber(marker.zScore, 2)}</dd></div>
          <div><dt>Percentil</dt><dd>{formatNumber(marker.percentile, 1)}</dd></div>
          <div><dt>Referência</dt><dd>{reference}</dd></div>
        </dl>
      ) : (
        <p className="growth-marker-unavailable" role="status">
          <strong>Curvas disponíveis; marcador não exibido.</strong>
          <span>{model.unavailableReason ?? "Não há um resultado válido para posicionar esta medida."}</span>
        </p>
      )}
    </div>
  );
}

export function GrowthCharts({ models }: { models: readonly GrowthChartModel[] }) {
  const [selected, setSelected] = useState<GrowthChartIndicator | null>(models[0]?.indicator ?? null);

  useEffect(() => {
    if (!models.some((model) => model.indicator === selected)) {
      setSelected(models[0]?.indicator ?? null);
    }
  }, [models, selected]);

  if (models.length === 0) return null;
  const model = models.find((candidate) => candidate.indicator === selected) ?? models[0];
  if (!model) return null;

  const moveTab = (current: GrowthChartIndicator, direction: -1 | 1 | "first" | "last") => {
    const currentIndex = models.findIndex((candidate) => candidate.indicator === current);
    const nextIndex = direction === "first"
      ? 0
      : direction === "last"
        ? models.length - 1
        : (currentIndex + direction + models.length) % models.length;
    const next = models[nextIndex];
    if (!next) return;
    setSelected(next.indicator);
    requestAnimationFrame(() => document.getElementById(`growth-tab-${next.indicator}`)?.focus());
  };

  return (
    <section className="growth-charts" aria-labelledby="growth-charts-title">
      <div className="growth-charts-head">
        <div>
          <span className="eyebrow">CURVAS DE CRESCIMENTO</span>
          <h3 id="growth-charts-title">Posição da criança nas referências WHO</h3>
          <p>Compare a medida atual com as curvas padrão de Z −3 a Z +3.</p>
        </div>
        <span className="growth-live"><i /> medida atual</span>
      </div>

      <div className="growth-tabs" role="tablist" aria-label="Indicador do gráfico">
        {models.map((candidate) => {
          const active = candidate.indicator === model.indicator;
          return (
            <button
              id={`growth-tab-${candidate.indicator}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`growth-panel-${candidate.indicator}`}
              tabIndex={active ? 0 : -1}
              className={active ? "active" : ""}
              onClick={() => setSelected(candidate.indicator)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTab(candidate.indicator, -1);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTab(candidate.indicator, 1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  moveTab(candidate.indicator, "first");
                } else if (event.key === "End") {
                  event.preventDefault();
                  moveTab(candidate.indicator, "last");
                }
              }}
              key={candidate.indicator}
            >
              {INDICATOR_LABELS[candidate.indicator]}
            </button>
          );
        })}
      </div>

      <div
        id={`growth-panel-${model.indicator}`}
        role="tabpanel"
        aria-labelledby={`growth-tab-${model.indicator}`}
        className="growth-tab-panel"
      >
        <GrowthChart model={model} />
      </div>
    </section>
  );
}
