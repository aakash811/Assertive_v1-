import { tagRepository } from "../repositories/tag.repository";

export const tagService = {
  create: tagRepository.create,

  list(projectId: string) {
    return tagRepository.findMany(projectId);
  },

  assign(testCaseId: string, tagId: string) {
    return tagRepository.assign(testCaseId, tagId);
  },

  remove(testCaseId: string, tagId: string) {
    return tagRepository.remove(testCaseId, tagId);
  },
};
