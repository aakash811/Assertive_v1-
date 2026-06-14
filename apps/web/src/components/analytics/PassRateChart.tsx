type Props = {
  passRate: number;
};

export function PassRateChart({ passRate }: Props) {
  return (
    <div className="rounded-lg border bg-green-300 p-6">
      <h2 className="mb-4 text-lg font-semibold">Pass Rate</h2>

      <div className="mb-2 text-3xl font-bold">{passRate}%</div>

      <div className="h-4 rounded bg-gray-200">
        <div
          className="h-full rounded bg-green-500"
          style={{
            width: `${passRate}%`,
          }}
        />
      </div>
    </div>
  );
}
