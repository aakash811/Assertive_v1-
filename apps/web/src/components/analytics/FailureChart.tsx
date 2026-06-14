type Props = {
  failureRate: number;
};

export function FailureChart({ failureRate }: Props) {
  return (
    <div className="rounded-lg border bg-slate-600 p-6">
      <h2 className="mb-4 text-lg font-semibold">Failure Rate</h2>

      <div className="mb-2 text-3xl font-bold">{failureRate}%</div>

      <div className="h-4 rounded bg-gray-200">
        <div
          className="h-full rounded bg-red-500"
          style={{
            width: `${failureRate}%`,
          }}
        />
      </div>
    </div>
  );
}
