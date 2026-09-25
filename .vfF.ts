import { prisma } from './src/config/database';
import jwt from 'jsonwebtoken';

const ep = 'http://localhost:4000/api/v1';

async function main() {
  const user = await prisma.user.findFirst({ include: { memberships: true } });
  const mem = user!.memberships[0];
  const token = jwt.sign(
    { sub: user!.id, orgId: mem!.organizationId, role: mem!.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m', issuer: process.env.JWT_ISSUER }
  );
  const headers = { authorization: `Bearer ${token}` };

  const hit = async (path: string) => {
    try {
      const r = await fetch(`${ep}/${path}`, { headers });
      const b = await r.text();
      console.log(`${r.status}  ${path}  ${b.slice(0, 90)}`);
    } catch (e) {
      console.log(`NETERR ${path}  ${(e as Error).message}`);
    }
  };

  await hit('projects?pageSize=6');
  await hit('projects?pageSize=100');
  const proj = await prisma.project.findFirst({ where: { archivedAt: null } });
  if (proj) await hit(`analytics/dashboard?projectId=${proj.id}`);
  await hit('analytics/dashboard');
  await prisma.$disconnect();
}

void main();
