"use server";

import { cookies } from "next/headers";

const KEY = "assertive-project-id";

export async function getCurrentProjectId() {
  return (await cookies()).get(KEY)?.value;
}

export async function setCurrentProjectId(projectId: string) {
  (await cookies()).set(KEY, projectId, {
    path: "/",
  });
}
