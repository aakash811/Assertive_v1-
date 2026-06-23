import { getCurrentProjectId } from "./project-cookie";

export async function getRequestHeaders() {
  const projectId = await getCurrentProjectId();

  return {
    ...(projectId && {
      "x-project-id": projectId,
    }),
  };
}
