import { ProjectSelector } from "../projects/ProjectSelector";
import { getProjects } from "@/lib/api";
import { getCurrentProjectId } from "@/lib/project-cookie";

export async function Header() {
  const [projects, selected] = await Promise.all([
    getProjects(),
    getCurrentProjectId(),
  ]);

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div>
        <div className="text-lg font-semibold">Assertive</div>
        <div className="text-sm text-gray-500">Test Management Platform</div>
      </div>

      <ProjectSelector projects={projects} selected={selected} />
    </header>
  );
}
