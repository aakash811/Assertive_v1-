import { getProject, getApiKeys } from "@/lib/api";
import { ProjectSettings } from "@/components/settings/ProjectSettings";
import { OrganizationPanel } from "@/components/settings/OrganizationPanel";
import { ApiKeysPanel } from "@/components/settings/ApiKeysPanel";
import { MembersPanel } from "@/components/settings/MembersPanel";
import { InvitationsPanel } from "@/components/settings/InvitationsPanel";
import { getOrganization, getOrganizationMembers, getInvitations } from "@/lib/api";
import { PageHeader } from "@/components/common/ui";

export default async function SettingsPage() {
  const [project, keys, organization, members, invitations] = await Promise.all([
    getProject(),
    getApiKeys(),
    getOrganization(),
    getOrganizationMembers(),
    getInvitations(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage project metadata, organization details, members, and API keys."
      />
      <ProjectSettings project={project} />
      <ApiKeysPanel initialKeys={keys} />
      <OrganizationPanel organization={organization} />
      <MembersPanel members={members} />
      <InvitationsPanel initialInvitations={invitations} />
    </div>
  );
}
