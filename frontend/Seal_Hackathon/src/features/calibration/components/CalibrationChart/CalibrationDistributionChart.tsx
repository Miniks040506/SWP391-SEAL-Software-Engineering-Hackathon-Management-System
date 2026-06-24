import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Line,
} from "recharts";
import type { CriterionDistributionResponse } from "@/types/calibration.types";

interface CalibrationDistributionChartProps {
    data: CriterionDistributionResponse[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as CriterionDistributionResponse;
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 font-bold text-slate-900 dark:text-white">{label}</p>
                <div className="flex flex-col gap-1 text-sm">
                    <p className="flex justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Benchmark:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{data.benchmarkScore ?? "N/A"}</span>
                    </p>
                    <p className="flex justify-between gap-4">
                        <span className="text-blue-500">Judge Mean:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{data.mean?.toFixed(1) ?? "N/A"}</span>
                    </p>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <p className="flex justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Min Score:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{data.min ?? "N/A"}</span>
                    </p>
                    <p className="flex justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Max Score:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{data.max ?? "N/A"}</span>
                    </p>
                    <p className="flex justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Std Deviation:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{data.standardDeviation?.toFixed(2) ?? "N/A"}</span>
                    </p>
                    <p className="flex justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Judge Count:</span>
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

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="criteriaName" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dy={10}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.5 }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    
                    <Bar 
                        dataKey="mean" 
                        name="Judge Mean Score" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="benchmarkScore" 
                        name="Benchmark Score" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
