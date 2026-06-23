import { projectRepository } from "../repositories/project.repository";

export const projectService = {
  getAll(organizationId: string) {
    return projectRepository.findMany({ organizationId });
  },

  getById(id: string) {
    return projectRepository.findById(id);
  },

  create(data: { name: string; slug: string; organizationId: string }) {
    return projectRepository.create(data);
  },

  update(id: string, name: string) {
    return projectRepository.update(id, name);
  },

  remove(id: string) {
    return projectRepository.delete(id);
  },
};
