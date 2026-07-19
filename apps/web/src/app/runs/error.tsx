"use client";

import { useEffect } from "react";
import { Button } from "@/components/common/ui";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RunsError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Runs failed to load
      </h2>
      <p className="max-w-md text-center text-sm text-gray-600">
        {error.message ?? "Please check your connection and try again."}
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
