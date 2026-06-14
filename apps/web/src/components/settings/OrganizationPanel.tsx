const members = [
  {
    email: "owner@example.com",
    role: "owner",
  },
];

export function OrganizationPanel() {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Organization</h2>

      <table className="w-full">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => (
            <tr key={member.email}>
              <td>{member.email}</td>

              <td>{member.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
        Invite Member
      </button>
    </div>
  );
}
