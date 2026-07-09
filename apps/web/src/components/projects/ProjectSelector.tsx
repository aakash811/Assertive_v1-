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
      className="h-9 max-w-52 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
    >
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
}
