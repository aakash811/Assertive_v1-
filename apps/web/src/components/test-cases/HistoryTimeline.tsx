import { EmptyState, SectionCard } from "@/components/common/ui";
import { HistoryItem } from "@/types/test-case";

type Props = {
  items: HistoryItem[];
};

function getBadgeClass(action: string) {
  switch (action) {
    case "MANUAL_OVERRIDE":
      return "border-red-200 bg-red-50 text-red-700";

    case "STATUS_CHANGED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-gray-200 bg-gray-100 text-gray-700";
  }
}

function getRelativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) {
    return "just now";
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function renderValue(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function HistoryTimeline({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyState
        title="No history available"
        description="Status changes and manual overrides will appear here."
      />
    );
  }

  return (
    <SectionCard title="History">
      <div className="space-y-5 p-5">
        {items.map((item) => (
          <div key={item.id} className="border-l-2 border-gray-200 pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium ${getBadgeClass(item.action)}`}
              >
                {item.action}
              </span>
              <span className="text-xs text-gray-500">
                {getRelativeTime(item.createdAt)}
              </span>
            </div>

            {item.changes ? (
              <div className="mt-2 text-sm text-gray-700">
                {"from" in item.changes && "to" in item.changes ? (
                  <>
                    {renderValue(item.changes.from)} -&gt;{" "}
                    {renderValue(item.changes.to)}
                  </>
                ) : null}

                {"status" in item.changes ? (
                  <>Status -&gt; {renderValue(item.changes.status)}</>
                ) : null}
              </div>
            ) : null}

            {item.comment ? (
              <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {item.comment}
              </div>
            ) : null}

            {item.changedBy ? (
              <div className="mt-2 text-xs text-gray-500">
                Changed by {item.changedBy}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
