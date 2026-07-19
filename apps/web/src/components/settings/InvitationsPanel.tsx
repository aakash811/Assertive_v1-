"use client";

import { useState } from "react";
import type { Invitation } from "@/types/organization";
import { Button, EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  initialInvitations: Invitation[];
};

export function InvitationsPanel({ initialInvitations }: Props) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const created = await fetch("/api/assertive/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role: "member" }),
      }).then((r) => r.json());

      if (!created.success) {
        throw new Error(created.error?.message ?? "Failed to invite");
      }

      setInvitations([created.data, ...invitations]);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setLoading(false);
    }
  }

  async function revoke(id: string) {
    setLoading(true);

    try {
      const result = await fetch(`/api/assertive/invitations/${id}`, {
        method: "DELETE",
      }).then((r) => r.json());

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to revoke");
      }

      setInvitations(invitations.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="Invitations"
      description="Invite new members to the organization."
    >
      <div className="space-y-4 p-5">
        <form onSubmit={invite} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Inviting..." : "Invite"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!invitations.length ? (
          <EmptyState
            title="No pending invitations"
            description="Invite team members to get started."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Expires</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {inv.email}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inv.role}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {inv.acceptedAt ? "Accepted" : "Pending"}
                    </td>
                    <td className="px-4 py-3">
                      {!inv.acceptedAt && (
                        <button
                          onClick={() => revoke(inv.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Revoke
                        </button>
                      )}
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
