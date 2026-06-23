"use server";

import { setCurrentProjectId } from "@/lib/project-cookie";

export async function selectProject(projectId: string) {
  await setCurrentProjectId(projectId);
}
