import { tagRepository } from "../repositories/tag.repository";

export const tagService = {
  create: tagRepository.create,

  list(projectId: string) {
    return tagRepository.findMany(projectId);
  },

  assign(projectId: string, testCaseId: string, tagId: string) {
    return tagRepository.assign(projectId, testCaseId, tagId);
  },

  remove(projectId: string, testCaseId: string, tagId: string) {
    return tagRepository.remove(projectId, testCaseId, tagId);
  },
  delete(id: string, projectId: string) {
    return tagRepository.delete(id, projectId);
  },
};
