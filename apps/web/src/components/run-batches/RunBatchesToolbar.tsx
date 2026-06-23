type Props = {
  q: string;
  environment: string;
  triggeredBy: string;
  onQ: (value: string) => void;
  onEnvironment: (value: string) => void;
  onTriggeredBy: (value: string) => void;
};

export function RunBatchesToolbar({
  q,
  environment,
  triggeredBy,
  onQ,
  onEnvironment,
  onTriggeredBy,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder="Search branch or commit"
        className="rounded border p-2"
      />

      <input
        value={environment}
        onChange={(e) => onEnvironment(e.target.value)}
        placeholder="Environment"
        className="rounded border p-2"
      />

      <input
        value={triggeredBy}
        onChange={(e) => onTriggeredBy(e.target.value)}
        placeholder="Triggered By"
        className="rounded border p-2"
      />
    </div>
  );
}
