"use client";

import { useState } from "react";
import { createApiKey, revokeApiKey } from "@/lib/api";
import { ApiKey } from "@/types/api-key";

type Props = {
  initialKeys: ApiKey[];
};

export function ApiKeysPanel({ initialKeys }: Props) {
  const [keys, setKeys] = useState(initialKeys);

  const [name, setName] = useState("");

  async function handleCreate() {
    const result = await createApiKey(name);

    alert(`Copy now:\n\n${result.key}`);

    window.location.reload();
  }

  async function handleDelete(id: string) {
    await revokeApiKey(id);

    setKeys(keys.filter((key) => key.id !== id));
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">API Keys</h2>

      <div className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name"
          className="rounded border p-2"
        />

        <button
          onClick={handleCreate}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Create
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>

            <th>Status</th>

            <th>Created</th>

            <th></th>
          </tr>
        </thead>

        <tbody>
          {keys.map((key) => (
            <tr key={key.id}>
              <td>{key.name}</td>

              <td>{key.isActive ? "Active" : "Revoked"}</td>

              <td>
                {new Date(key.createdAt)
                  .toISOString()
                  .replace("T", " ")
                  .slice(0, 19)}
              </td>

              <td>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="text-red-500"
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
