"use client";

import { useState } from "react";
import { createApiKey, revokeApiKey } from "@/lib/api";
import { ApiKey } from "@/types/api-key";
import { Button, EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  initialKeys: ApiKey[];
};

export function ApiKeysPanel({ initialKeys }: Props) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      return;
    }

    const result = await createApiKey(name);
    alert(`Copy now:\n\n${result.key}`);

    setKeys((prev) => [
      {
        id: result.id,
        name,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setName("");
  }

  async function handleDelete(id: string) {
    await revokeApiKey(id);
    setKeys((prev) => prev.filter((key) => key.id !== id));
  }

  return (
    <SectionCard
      title="API Keys"
      description="Create and revoke keys used by the CLI and reporter."
    >
      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            aria-label="API key name"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-950 sm:w-72"
          />

          <Button onClick={handleCreate} variant="primary">
            Create
          </Button>
        </div>

        {!keys.length ? (
          <EmptyState
            title="No API keys created"
            description="Create a key to connect the Assertive CLI or reporter."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {key.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {key.isActive ? "Active" : "Revoked"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {new Date(key.createdAt)
                        .toISOString()
                        .replace("T", " ")
                        .slice(0, 19)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        onClick={() => handleDelete(key.id)}
                        variant="danger"
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
