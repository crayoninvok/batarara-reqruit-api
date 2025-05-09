import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('adminbatara123', 10); // default password

  const admins = [
    {
      email: 'admin1@example.com',
      name: 'Admin One',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      email: 'admin2@example.com',
      name: 'Admin Two',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      email: 'admin3@example.com',
      name: 'Admin Three',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  ];

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        password,
        avatar: admin.avatar,
        role: 'ADMIN',
      },
    });
  }

  console.log('✅ 3 admins have been seeded.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
