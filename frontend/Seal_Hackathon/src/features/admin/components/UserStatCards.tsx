function StatCard({
  label,
  count,
  sub,
  accent,
  loading,
}: {
  label: string;
  count: number;
  sub: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`text-xs font-extrabold uppercase tracking-widest ${accent}`}>
        {label}
      </div>
      <div className="mt-1 text-3xl font-black text-slate-800">
        {loading ? (
          <span className="inline-block h-8 w-10 animate-pulse rounded bg-slate-100" />
        ) : (
          count
        )}
      </div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

export function UserStatCards({
  adminStats,
  studentStats,
  mentorStats,
  judgeStats,
}: {
  adminStats: { totalElements: number } | undefined;
  studentStats: { totalElements: number } | undefined;
  mentorStats: { totalElements: number } | undefined;
  judgeStats: { totalElements: number } | undefined;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        label="Administrators"
        count={adminStats?.totalElements ?? 0}
        sub="Active"
        accent="text-red-500"
        loading={!adminStats}
      />
      <StatCard
        label="Students"
        count={studentStats?.totalElements ?? 0}
        sub="Registered"
        accent="text-green-600"
        loading={!studentStats}
      />
      <StatCard
        label="Mentors"
        count={mentorStats?.totalElements ?? 0}
        sub="Assigned"
        accent="text-pink-600"
        loading={!mentorStats}
      />
      <StatCard
        label="Judges"
        count={judgeStats?.totalElements ?? 0}
        sub="Invited"
        accent="text-yellow-600"
        loading={!judgeStats}
      />
    </div>
  );
}