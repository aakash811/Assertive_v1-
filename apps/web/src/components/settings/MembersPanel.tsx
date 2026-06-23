import type { Member } from "@/types/organization";

type Props = {
  members: Member[];
};

export function MembersPanel({ members }: Props) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Members</h2>
      {!members.length ? (
        <div className="text-gray-500">No members yet</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.user.name}</td>
                <td>{member.user.email}</td>
                <td>{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6">
        <button
          disabled
          className="cursor-not-allowed rounded bg-gray-300 px-4 py-2 text-gray-600"
        >
          Invite Member (Coming Soon)
        </button>
      </div>
    </div>
  );
}
