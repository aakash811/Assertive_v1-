"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { overrideTestCaseStatus } from "@/lib/api";
import { Button } from "@/components/common/ui";

type Props = {
  testCaseId: string;
};

export function OverrideStatusModal({ testCaseId }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("PASSED");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);

      await overrideTestCaseStatus(
        testCaseId,
        status as "PASSED" | "FAILED" | "SKIPPED",
        comment,
      );

      alert("Status updated");
      setOpen(false);
      router.refresh();
    } catch {
      alert("Unable to update status.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        Override Status
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-950">
          Override Status
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          This override will be cleared on the next automated run.
        </p>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-gray-700">Reason</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why this status is being overridden"
            className="mt-1 min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Current selection: {status}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={loading || !comment.trim()}
            variant="primary"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
