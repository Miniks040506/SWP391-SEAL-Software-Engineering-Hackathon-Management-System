import React from "react";
import { useFormContext } from "react-hook-form";
import type { EventCriteriaResponse } from "@/types/criteria.types";


interface BenchmarkScoreMatrixProps {
    criteria: EventCriteriaResponse[];
}


export const BenchmarkScoreMatrix = ({ criteria }: BenchmarkScoreMatrixProps) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();


    if (!criteria || criteria.length === 0) {
        return (
            <div className="p-4 bg-gray-50 text-gray-500 rounded border text-sm">
                No criteria available for this round.
            </div>
        );
    }


    return (
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
            <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="py-3 px-4 font-semibold text-gray-600">Criterion</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 w-32">Category</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 w-24 text-right">Weight</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 w-48 text-right">Benchmark Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {criteria.map((c) => {
                        const fieldName = `benchmarkScores.${c.id}`;
                        // @ts-ignore - dynamic key
                        const error = errors.benchmarkScores?.[c.id];


                        return (
                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-4 align-middle">
                                    <div className="font-medium text-gray-900">{c.effectiveName}</div>
                                    {c.effectiveDescription && (
                                        <div className="text-xs text-gray-500 mt-1 max-w-md line-clamp-2">
                                            {c.effectiveDescription}
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4 align-middle">
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                        {c.templateCategory || "CUSTOM"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 align-middle text-right text-gray-600">
                                    {c.effectiveWeight}x
                                </td>
                                <td className="py-3 px-4 align-middle text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register(fieldName, { valueAsNumber: true })}
                                                className={`w-20 px-2 py-1.5 text-right border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${error ? "border-red-500 bg-red-50" : "border-gray-300"
                                                    }`}
                                            />
                                            <span className="text-gray-500">/ {c.effectiveMaxScore}</span>
                                        </div>
                                        {error && (
                                            <span className="text-xs text-red-600 font-medium">
                                                {error.message as string}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};



