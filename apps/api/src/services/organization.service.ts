import { prisma } from "@autonomiq/database";

export const createOrganization = async (input: { name: string; userId: string }) => {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const organization = await prisma.organization.create({
    data: {
      name: input.name,
      slug: `${slug}-${Date.now()}`.slice(0, 60),
      memberships: {
        create: {
          userId: input.userId,
          role: "OWNER",
        },
      },
    },
    include: {
      memberships: true,
    },
  });

  return organization;
};

export const listOrganizationsForUser = async (userId: string) => {
  return prisma.organization.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
    include: {
      memberships: true,
    },
  });
};
