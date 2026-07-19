import * as crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export type CreateInvitationInput = {
  organizationId: string;
  email: string;
  role: string;
  invitedById: string;
};

export type AcceptInvitationInput = {
  token: string;
  userId: string;
};

export const invitationService = {
  async create(input: CreateInvitationInput) {
    const existing = await prisma.invitation.findFirst({
      where: {
        organizationId: input.organizationId,
        email: input.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "An active invitation already exists for this email",
        409,
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return prisma.invitation.create({
      data: {
        email: input.email,
        role: input.role,
        token,
        organizationId: input.organizationId,
        invitedById: input.invitedById,
        expiresAt,
      },
    });
  },

  async accept(input: AcceptInvitationInput) {
    const invitation = await prisma.invitation.findUnique({
      where: { token: input.token },
      include: { organization: true },
    });

    if (!invitation) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Invalid invitation token",
        404,
      );
    }

    if (invitation.acceptedAt) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "Invitation already accepted",
        409,
      );
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Invitation expired",
        410,
      );
    }

    const membership = await prisma.organizationMember.create({
      data: {
        userId: input.userId,
        orgId: invitation.organizationId,
        role: invitation.role,
      },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return membership;
  },

  async listByOrganization(organizationId: string) {
    return prisma.invitation.findMany({
      where: { organizationId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async revoke(id: string, organizationId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.organizationId !== organizationId) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Invitation not found",
        404,
      );
    }

    await prisma.invitation.delete({
      where: { id },
    });
  },
};
