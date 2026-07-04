import { projectRepository } from "../repositories/project.repository";

export const projectService = {
  getAll(organizationId: string) {
    return projectRepository.findMany({ organizationId });
  },

  getById(id: string, organizationId: string) {
    return projectRepository.findById(id, organizationId);
  },

  create(
    organizationId: string,
    data: {
      name: string;
      slug: string;
    },
  ) {
    return projectRepository.create({
      ...data,
      organizationId,
    });
  },

  update(id: string, name: string, organizationId: string) {
    return projectRepository.update(id, name, organizationId);
  },

  remove(id: string, organizationId: string) {
    return projectRepository.delete(id, organizationId);
  },
};
