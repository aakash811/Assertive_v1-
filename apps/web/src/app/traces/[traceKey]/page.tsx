import { headers } from "next/headers";

type Props = {
  params: Promise<{
    traceKey: string;
  }>;
};

export default async function TracePage({ params }: Props) {
  const { traceKey } = await params;

  const h = await headers();

  const host = h.get("host")!;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const traceUrl = `${protocol}://${host}/api/assertive/traces/${traceKey}`;

  return (
    <iframe
      className="h-screen w-full border-0"
      src={`https://trace.playwright.dev/?trace=${encodeURIComponent(traceUrl)}`}
    />
  );
}
