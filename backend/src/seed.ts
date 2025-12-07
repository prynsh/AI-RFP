import { prisma } from "./clients/PrismaClient.js";



async function seedingDB() {
  console.log('Start seeding the database...')

  const vendorData = [
    { name: 'Tech Solutions Inc.', email: 'prynsshh@gmail.com' },
    { name: 'Global Supply Co.', email: 'priyansh2112@gmail.com' },
  ];

  const vendors = await prisma.$transaction(
    vendorData.map((vendor) => 
      prisma.vendors.create({
        data: vendor,
      })
    )
  );

  console.log(`Seeding finished. Created ${vendors.length} vendor records.`);
}

seedingDB()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })