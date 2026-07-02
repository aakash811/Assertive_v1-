import type { RecentFailure } from "@/types/analytics";

type Props = {
  items: RecentFailure[];
};

export function RecentFailures({ items }: Props) {
  if (!items.length) {
    return <div className="rounded-lg border p-6">No recent failures 🎉</div>;
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Recent Failures</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <div className="font-medium">❌ {item.title}</div>

              <div className="text-xs text-gray-500">
                {item.branch ?? "local"}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
