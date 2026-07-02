import Link from "next/link";

type Props = {
  traceKey: string;
};

export function TraceViewer({ traceKey }: Props) {
  return (
    <Link
      href={`/traces/${traceKey}`}
      target="_blank"
      rel="noreferrer"
      className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
    >
      View Trace
    </Link>
  );
}
