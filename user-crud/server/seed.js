import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', role: 'Admin', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', role: 'Editor', status: 'Active' },
  { name: 'Carol White', email: 'carol@example.com', phone: '555-0103', role: 'Viewer', status: 'Inactive' },
  { name: 'David Lee', email: 'david@example.com', phone: '555-0104', role: 'Editor', status: 'Active' },
  { name: 'Eva Martinez', email: 'eva@example.com', phone: '555-0105', role: 'Admin', status: 'Active' },
];

async function main() {
  await prisma.user.deleteMany();
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log(`Seeded ${users.length} users.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
