import type { RecentFailure } from "@/types/analytics";
import { EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  items: RecentFailure[];
};

export function RecentFailures({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyState
        title="No recent failures"
        description="Failed runs will appear here after your next Playwright sync."
      />
    );
  }

  return (
    <SectionCard title="Recent Failures">
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-950">
                {item.title}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {item.branch ?? "local"}
              </div>
            </div>

            <div className="shrink-0 text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
