import { SectionCard } from "@/components/common/ui";

type Props = {
  organization: {
    name: string;
    slug: string;
  };
};

export function OrganizationPanel({ organization }: Props) {
  return (
    <SectionCard title="Organization" description="Current workspace details.">
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Name
          </div>
          <div className="mt-1 text-sm text-gray-950 dark:text-gray-50">
            {organization.name}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Slug
          </div>
          <div className="mt-1 font-mono text-sm text-gray-950 dark:text-gray-50">
            {organization.slug}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
