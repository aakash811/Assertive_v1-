import { HistoryItem } from "@/types/test-case";

type Props = {
  items: HistoryItem[];
};

function getBadgeClass(action: string) {
  switch (action) {
    case "STATUS_CHANGED":
      return "bg-blue-100 text-blue-700";

    case "MANUAL_OVERRIDE":
      return "bg-red-100 text-red-700";

    case "TEST_DISCOVERED":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getIcon(action: string) {
  switch (action) {
    case "UPDATED":
      return "✏️";

    case "MANUAL_OVERRIDE":
      return "⚠️";

    case "STATUS_CHANGED":
      return "🔄";

    case "STALE":
      return "📦";

    case "RESTORED":
      return "♻️";

    default:
      return "•";
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

export function HistoryTimeline({ items }: Props) {
  if (!items.length) {
    return <div className="rounded-lg border p-4">No data available</div>;
  }
  return (
    <div className="rounded-lg border bg-emerald-500 p-4">
      <details open>
        <summary className="mb-4 cursor-pointer text-lg font-semibold">
          History
        </summary>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border-l-2 pl-4">
              <div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeClass(item.action)}`}
                >
                  {getIcon(item.action)} {item.action}
                </span>
              </div>

              {item.changes && (
                <div className="mt-2 text-sm text-gray-600">
                  {item.changes.from && item.changes.to ? (
                    <>
                      {item.changes.from}
                      {" → "}
                      {item.changes.to}
                    </>
                  ) : item.changes.status ? (
                    <>Status → {item.changes.status}</>
                  ) : null}
                </div>
              )}

              {item.comment && (
                <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
                  {item.comment}
                </div>
              )}

              {item.changedBy && (
                <div className="flex items-center gap-2">
                  <div className=" flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                    👤
                  </div>

                  <div>{item.changedBy ?? "System"}</div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {getRelativeTime(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
