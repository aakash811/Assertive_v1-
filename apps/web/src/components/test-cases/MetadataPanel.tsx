import { SectionCard } from "@/components/common/ui";
import { SyncStateBadge } from "@/components/common/SyncStateBadge";
import { MetadataTestCase } from "@/types/test-case";

type Props = {
  testCase: MetadataTestCase;
};

export function MetadataPanel({ testCase }: Props) {
  return (
    <SectionCard title="Metadata">
      <dl className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm font-medium text-gray-600">Owner</dt>
          <dd className="mt-1 text-sm text-gray-950">{testCase.owner ?? "-"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-600">Priority</dt>
          <dd className="mt-1 text-sm text-gray-950">
            {testCase.priority ?? "-"}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-600">Type</dt>
          <dd className="mt-1 text-sm text-gray-950">
            {testCase.testType ?? "-"}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-600">Sync State</dt>
          <dd className="mt-1">
            <SyncStateBadge state={testCase.syncState ?? "STALE"} />
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
