import { MetadataTestCase } from "@/types/test-case";

type Props = {
  testCase: MetadataTestCase;
};

export function MetadataPanel({ testCase }: Props) {
  return (
    <div className="rounded-lg border bg-amber-700 p-4">
      <h2 className="mb-4 text-lg font-semibold">Metadata</h2>

      <dl className="space-y-2">
        <div>
          <dt>Owner</dt>
          <dd>{testCase.owner ?? "-"}</dd>
        </div>

        <div>
          <dt>Priority</dt>
          <dd>{testCase.priority ?? "-"}</dd>
        </div>

        <div>
          <dt>Type</dt>
          <dd>{testCase.testType ?? "-"}</dd>
        </div>

        <div>
          <dt>Sync State</dt>
          <dd>{testCase.syncState ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
