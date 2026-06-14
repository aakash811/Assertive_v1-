import { getTestCases } from "@/lib/api";
import { TestCasesClient } from "@/components/test-cases/TestCasesClient";

export default async function TestCasesPage() {
  const result = await getTestCases();

  return <TestCasesClient items={result.items} />;
}
