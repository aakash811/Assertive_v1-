import { metadataStore } from "./store";
import type { Priority, TestType } from "./metadata";

function getOrCreate(key: string) {
  let metadata = metadataStore.get(key);

  if (!metadata) {
    metadata = {
      tags: [],
      fields: {},
    };

    metadataStore.set(key, metadata);
  }

  return metadata;
}

export const assertive = {
  id(testName: string, value: string) {
    getOrCreate(testName).id = value;
  },

  owner(testName: string, value: string) {
    getOrCreate(testName).owner = value;
  },

  priority(testName: string, value: Priority) {
    getOrCreate(testName).priority = value;
  },

  type(testName: string, value: TestType) {
    getOrCreate(testName).type = value;
  },

  tags(testName: string, ...tags: string[]) {
    getOrCreate(testName).tags.push(...tags);
  },

  field(testName: string, key: string, value: string) {
    getOrCreate(testName).fields[key] = value;
  },
};
