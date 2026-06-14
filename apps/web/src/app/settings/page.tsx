import { getProject, getApiKeys } from "@/lib/api";

import { ProjectSettings } from "@/components/settings/ProjectSettings";
import { ApiKeysPanel } from "@/components/settings/ApiKeysPanel";

export default async function SettingsPage() {
  const [project, keys] = await Promise.all([getProject(), getApiKeys()]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <ProjectSettings project={project} />

      <ApiKeysPanel initialKeys={keys} />
    </div>
  );
}
