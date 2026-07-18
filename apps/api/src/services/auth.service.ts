import * as crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { signJwt } from "../lib/jwt";
import type { OrganizationRole } from "@assertive/shared";

const SCRYPT_SALT_LENGTH = 16;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_P = 1;
const SCRYPT_R = 8;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SCRYPT_SALT_LENGTH).toString("hex");

  return `scrypt:${salt}:${crypto
    .scryptSync(password, salt, SCRYPT_KEY_LENGTH)
    .toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored.startsWith("scrypt:")) {
    return false;
  }

  const [algorithm, salt, hash] = stored.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
}

export type AuthResult = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: OrganizationRole;
    organizationId: string;
  };
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: {
          include: {
            org: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    if (!verifyPassword(password, user.passwordHash)) {
      throw new Error("Invalid email or password");
    }

    const membership = user.memberships[0];

    if (!membership) {
      throw new Error("No organization membership found");
    }

    const token = signJwt({
      sub: user.id,
      organizationId: membership.orgId,
      role: membership.role as OrganizationRole,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: membership.role as OrganizationRole,
        organizationId: membership.orgId,
      },
    };
  },

  async register(
    email: string,
    password: string,
    name: string,
    organizationName: string,
  ): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        memberships: {
          create: {
            org: {
              create: {
                name: organizationName,
                slug: email.split("@")[0],
              },
            },
            role: "owner",
          },
        },
      },
      include: {
        memberships: {
          include: {
            org: true,
          },
        },
      },
    });

    const membership = user.memberships[0];

    const token = signJwt({
      sub: user.id,
      organizationId: membership.orgId,
      role: membership.role as OrganizationRole,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: membership.role as OrganizationRole,
        organizationId: membership.orgId,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        memberships: {
          include: {
            org: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const membership = user.memberships[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: membership?.role ?? "member",
      organizationId: membership?.orgId ?? null,
    };
  },
};
