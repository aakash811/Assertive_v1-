"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectProject } from "@/app/actions/project";
import type { Project } from "@/types/project";

type Props = {
  projects: Project[];
  selected?: string;
};

export function ProjectSelector({ projects, selected }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeProject(projectId: string) {
    startTransition(async () => {
      await selectProject(projectId);

      router.refresh();
    });
  }

  return (
    <select
      value={selected ?? projects[0]?.id}
      disabled={pending}
      onChange={(e) => changeProject(e.target.value)}
      aria-label="Select project"
      className="project-select"
    >
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
}
