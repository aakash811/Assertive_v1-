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
                  {item.action}
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
                <div className="text-xs text-gray-500">By {item.changedBy}</div>
              )}

              <div className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
