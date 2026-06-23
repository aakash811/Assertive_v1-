import { getProject, getApiKeys } from "@/lib/api";
import { ProjectSettings } from "@/components/settings/ProjectSettings";
import { OrganizationPanel } from "@/components/settings/OrganizationPanel";
import { ApiKeysPanel } from "@/components/settings/ApiKeysPanel";
import { MembersPanel } from "@/components/settings/MembersPanel";
import { getOrganization, getOrganizationMembers } from "@/lib/api";

export default async function SettingsPage() {
  const [project, keys, organization, members] = await Promise.all([
    getProject(),
    getApiKeys(),
    getOrganization(),
    getOrganizationMembers(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <ProjectSettings project={project} />
      <ApiKeysPanel initialKeys={keys} />
      <OrganizationPanel organization={organization} />
      <MembersPanel members={members} />
    </div>
  );
}
