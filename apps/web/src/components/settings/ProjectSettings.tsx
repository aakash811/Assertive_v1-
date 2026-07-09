"use client";

import { useState } from "react";
import { updateProject } from "@/lib/api";
import { Button, SectionCard } from "@/components/common/ui";

type Props = {
  project: {
    name: string;
  };
};

export function ProjectSettings({ project }: Props) {
  const [name, setName] = useState(project.name);
  const [saved, setSaved] = useState(false);

  async function save() {
    await updateProject(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Project" description="Update the current project name.">
      <div className="space-y-4 p-5">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:ring-blue-950"
          />
        </label>

        <div className="flex items-center gap-3">
          <Button onClick={save} variant="primary">
            Save
          </Button>
          {saved && (
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Saved
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
