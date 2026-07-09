import { EmptyState, SectionCard } from "@/components/common/ui";
import { Tag } from "@/types/test-case";

type Props = {
  tags: Tag[];
};

export function TagsPanel({ tags = [] }: Props) {
  if (!tags.length) {
    return (
      <EmptyState
        title="No tags available"
        description="Tags synced from inventory will appear here."
      />
    );
  }

  return (
    <SectionCard title="Tags">
      <div className="flex flex-wrap gap-2 p-5">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex h-7 items-center rounded-full border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700"
          >
            {tag.name}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
