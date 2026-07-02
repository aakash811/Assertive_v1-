"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { overrideTestCaseStatus } from "@/lib/api";

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
      alert("Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => setOpen(true)}
      >
        Override Status
      </button>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-100 rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Override Status</h2>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded border p-2"
        >
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="SKIPPED">Skipped</option>
        </select>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Reason"
          className="mt-4 w-full rounded border p-2"
        />

        <div className="mt-4 text-sm">Current → {status}</div>
        <div className="mt-4 rounded bg-yellow-50 p-3 text-sm">
          This override will be cleared on the next automated run.
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={submit}
            disabled={loading || !comment.trim()}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Save
          </button>

          <button
            onClick={() => setOpen(false)}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
