import { organizationRepository } from "../repositories/organization.repository";

export const organizationService = {
  getCurrent(organizationId: string) {
    return organizationRepository.findById(organizationId);
  },

  getMembers(organizationId: string) {
    return organizationRepository.findMembers(organizationId);
  },
};
