import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    ErrorBar,
} from "recharts";
import type { CriterionDistributionResponse } from "@/types/calibration.types";
import { CHART_COLORS } from "../../constants/calibrationUi";
import { formatScore } from "../../utils/format";

interface CalibrationDistributionChartProps {
    data: CriterionDistributionResponse[];
}

type ChartDatum = CriterionDistributionResponse & {
    /** [belowMean, aboveMean] offsets for the min–max error band. */
    meanRange?: [number, number];
};

type TooltipProps = {
    active?: boolean;
    payload?: ReadonlyArray<{ payload: CriterionDistributionResponse }>;
    label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const delta =
            data.mean != null && data.benchmarkScore != null
                ? data.mean - data.benchmarkScore
                : null;
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 font-bold text-slate-900 dark:text-white">{label}</p>
                <div className="flex flex-col gap-1 text-sm tabular-nums">
                    <p className="flex justify-between gap-6">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Benchmark</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatScore(data.benchmarkScore)}</span>
                    </p>
                    <p className="flex justify-between gap-6">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Judge mean</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatScore(data.mean)}</span>
                    </p>
                    {delta !== null && (
                        <p className="flex justify-between gap-6">
                            <span className="text-slate-500 dark:text-slate-400">Deviation</span>
                            <span className={`font-bold ${Math.abs(delta) < 0.5 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {delta > 0 ? "+" : ""}{formatScore(delta)}
                            </span>
                        </p>
                    )}
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <p className="flex justify-between gap-6">
                        <span className="text-slate-500 dark:text-slate-400">Range (min–max)</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatScore(data.min)} – {formatScore(data.max)}
                        </span>
                    </p>
                    <p className="flex justify-between gap-6">
                        <span className="text-slate-500 dark:text-slate-400">Std deviation</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatScore(data.standardDeviation, 2)}</span>
                    </p>
                    <p className="flex justify-between gap-6">
                        <span className="text-slate-500 dark:text-slate-400">Judges</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{data.judgeCount}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export const CalibrationDistributionChart = ({ data }: CalibrationDistributionChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No data available to display chart.
            </div>
        );
    }

    // Scores are on a 0–10 scale by default; extend the axis only if data exceeds it.
    const maxScore = Math.ceil(
        Math.max(
            10,
            ...data.map((d) => Math.max(d.benchmarkScore ?? 0, d.max ?? 0, d.mean ?? 0)),
        ),
    );

    const chartData: ChartDatum[] = data.map((d) => ({
        ...d,
        meanRange:
            d.mean != null && d.min != null && d.max != null
                ? [d.mean - d.min, d.max - d.mean]
                : undefined,
    }));

    return (
        <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                    barGap={6}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} className="dark:opacity-20" />
                    <XAxis
                        dataKey="criteriaName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: CHART_COLORS.tick, fontSize: 12, fontWeight: 600 }}
                        dy={8}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: CHART_COLORS.tick, fontSize: 12 }}
                        domain={[0, maxScore]}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.4 }} />
                    <Legend
                        wrapperStyle={{ paddingTop: "16px", fontSize: 13, fontWeight: 600 }}
                        iconType="circle"
                        iconSize={9}
                    />
                    <Bar
                        dataKey="benchmarkScore"
                        name="Benchmark"
                        fill={CHART_COLORS.benchmark}
                        radius={[5, 5, 0, 0]}
                        barSize={28}
                        animationDuration={400}
                    />
                    <Bar
                        dataKey="mean"
                        name="Judge Mean"
                        fill={CHART_COLORS.judge}
                        radius={[5, 5, 0, 0]}
                        barSize={28}
                        animationDuration={400}
                    >
                        <ErrorBar
                            dataKey="meanRange"
                            width={6}
                            strokeWidth={1.5}
                            stroke="#1d4ed8"
                            direction="y"
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
