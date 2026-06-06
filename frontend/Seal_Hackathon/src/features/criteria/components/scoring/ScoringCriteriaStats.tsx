type ScoringCriteriaStatsProps = {
    total: number;
    technical: number;
    soft: number;
};

function StatCard({
    label,
    value,
    accentClass = "text-slate-950 dark:text-white"
} : {
    label: string; 
    value: number;
    accentClass?: string 
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {label}
            </p>
            <p className={`mt-2 text-3xl font-black ${accentClass}`}>
                {value}
            </p>
        </div>
    );
}

export function ScoringCriteriaStats({
    total,
    technical,
    soft,
}: ScoringCriteriaStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="Total templates" value={total} />
            <StatCard label="Technical on page" value={technical} accentClass="text-blue-600" />
            <StatCard label="Soft on page" value={soft} accentClass="text-violet-600" />
        </div>
    );
}