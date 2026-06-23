type Props = {
  organization: {
    name: string;
    slug: string;
  };
};

export function OrganizationPanel({ organization }: Props) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Organization</h2>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div className="font-medium">{organization.name}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Slug</div>
          <div className="font-medium">{organization.slug}</div>
        </div>
      </div>
    </div>
  );
}
