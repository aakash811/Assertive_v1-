"use client";

import { useState } from "react";
import { updateProject } from "@/lib/api";

type Props = {
  project: {
    name: string;
  };
};

export function ProjectSettings({ project }: Props) {
  const [name, setName] = useState(project.name);

  async function save() {
    await updateProject(name);

    alert("Saved");
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Project</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border p-2"
      />

      <button
        onClick={save}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Save
      </button>
    </div>
  );
}
