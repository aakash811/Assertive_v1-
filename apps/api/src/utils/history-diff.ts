import { Prisma } from "@prisma/client";

function normalize(value: unknown) {
  return value ?? null;
}

export function generateMetadataDiff(
  previous: {
    title?: string | null;
    owner?: string | null;
    priority?: string | null;
    testType?: string | null;
    filePath?: string | null;
    customFields?: Prisma.JsonValue | null;
  },

  current: {
    title?: string;
    owner?: string;
    priority?: string;
    testType?: string;
    filePath?: string;
    customFields?: Record<string, string>;
  },
): Prisma.JsonObject {
  const changes: Prisma.JsonObject = {};
  const previousTitle = normalize(previous.title);
  const currentTitle = normalize(current.title);
  const previousOwner = normalize(previous.owner);
  const currentOwner = normalize(current.owner);
  const previousPriority = normalize(previous.priority);
  const currentPriority = normalize(current.priority);
  const previousTestType = normalize(previous.testType);
  const currentTestType = normalize(current.testType);
  const previousFilePath = normalize(previous.filePath);
  const currentFilePath = normalize(current.filePath);
  const previousCustomFields = previous.customFields ?? {};
  const currentCustomFields = current.customFields ?? {};

  if (previousTitle !== currentTitle) {
    changes.title = {
      from: previousTitle,
      to: currentTitle,
    };
  }

  if (previousOwner !== currentOwner) {
    changes.owner = {
      from: previousOwner,
      to: currentOwner,
    };
  }

  if (previousPriority !== currentPriority) {
    changes.priority = {
      from: previousPriority,
      to: currentPriority,
    };
  }

  if (previousTestType !== currentTestType) {
    changes.testType = {
      from: previousTestType,
      to: currentTestType,
    };
  }

  if (previousFilePath !== currentFilePath) {
    changes.filePath = {
      from: previousFilePath,
      to: currentFilePath,
    };
  }

  if (
    JSON.stringify(previousCustomFields) !== JSON.stringify(currentCustomFields)
  ) {
    changes.customFields = {
      from: previousCustomFields,
      to: currentCustomFields,
    };
  }

  return changes;
}
