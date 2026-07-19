import type { Member } from "@/types/organization";
import { Button, EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  members: Member[];
};

export function MembersPanel({ members }: Props) {
  return (
    <SectionCard
      title="Members"
      description="View organization members and roles."
    >
      <div className="space-y-4 p-5">
        {!members.length ? (
          <EmptyState
            title="No members yet"
            description="Members will appear here when the organization has users."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {member.user.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {member.user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{member.role}</td>
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
