import { Tag } from "@/types/test-case";

type Props = {
  tags: Tag[];
};

export function TagsPanel({ tags = [] }: Props) {
  if (!tags.length) {
    return <div className="rounded-lg border p-4">No tags available</div>;
  }
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Tags</h2>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="rounded-full border px-3 py-1 text-sm"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}
