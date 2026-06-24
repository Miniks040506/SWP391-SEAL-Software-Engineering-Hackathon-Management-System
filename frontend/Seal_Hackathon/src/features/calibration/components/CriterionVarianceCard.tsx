import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { CriterionDistributionResponse } from "@/types/calibration.types";

interface CriterionVarianceCardProps {
    data: CriterionDistributionResponse[];
}

const getVarianceColor = (stdDev: number | null | undefined) => {
    if (stdDev === null || stdDev === undefined) return "#cbd5e1"; // slate-300
    if (stdDev < 1.0) return "#10b981"; // emerald-500 (Low)
    if (stdDev < 2.0) return "#f59e0b"; // amber-500 (Medium)
    return "#ef4444"; // red-500 (High)
};

const getVarianceLabel = (stdDev: number | null | undefined) => {
    if (stdDev === null || stdDev === undefined) return "N/A";
    if (stdDev < 1.0) return "Low Variance";
    if (stdDev < 2.0) return "Medium Variance";
    return "High Variance";
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as CriterionDistributionResponse;
        const stdDev = data.standardDeviation;
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 font-bold text-slate-900 dark:text-white">{label}</p>
                <div className="flex flex-col gap-1 text-sm">
                    <p className="flex items-center justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Std Deviation:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {stdDev?.toFixed(2) ?? "N/A"}
                        </span>
                    </p>
                    <p className="flex items-center justify-between gap-4">
                        <span className="text-slate-500 dark:text-slate-400">Level:</span>
                        <span 
                            className="font-bold" 
                            style={{ color: getVarianceColor(stdDev) }}
                        >
                            {getVarianceLabel(stdDev)}
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export const CriterionVarianceCard = ({ data }: CriterionVarianceCardProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No variance data available.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Variance by Criterion</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Standard deviation of judge scores per criterion.
                </p>
            </div>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
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
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9", opacity: 0.5 }} />
                        <Bar 
                            dataKey="standardDeviation" 
                            radius={[4, 4, 0, 0]} 
                            barSize={40}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getVarianceColor(entry.standardDeviation)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
