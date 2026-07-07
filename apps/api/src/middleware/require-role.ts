// import { createMiddleware } from "hono/factory";
// import {
//   ORGANIZATION_ROLES,
//   type OrganizationRole,
//   ERROR_CODES,
// } from "@assertive/shared";
// import { AppError } from "../lib/app-error";
// import type { HonoVariables } from "../types/hono";

// const hierarchy: Record<OrganizationRole, number> = {
//   [ORGANIZATION_ROLES.MEMBER]: 1,
//   [ORGANIZATION_ROLES.ADMIN]: 2,
//   [ORGANIZATION_ROLES.OWNER]: 3,
// };

// export function requireRole(role: OrganizationRole) {
//   return createMiddleware<{
//     Variables: HonoVariables;
//   }>(async (c, next) => {
//     const current = c.get("organizationRole");

//     if (hierarchy[current as OrganizationRole] < hierarchy[role]) {
//       throw new AppError(
//         ERROR_CODES.PERMISSION_DENIED,
//         "Insufficient organization role",
//         403,
//       );
//     }

//     await next();
//   });
// }
