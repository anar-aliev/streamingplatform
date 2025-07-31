import { Prisma, PrismaClient } from '../../../generated/prisma/client';
import { BadRequestException, Logger } from '@nestjs/common';
import { CATEGORIES } from './data/categories.data';
import { USERNAMES } from './data/users.data';
import { hash } from 'argon2';
import { STREAMS } from './data/streams.data';

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
});

async function main() {
  try {
    Logger.log('Starting database seeding...');

    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.socialLinks.deleteMany(),
      prisma.stream.deleteMany(),
      prisma.category.deleteMany(),
    ]);

    await prisma.category.createMany({
      data: CATEGORIES,
    });

    Logger.log('Categories created successfully');

    const categories = await prisma.category.findMany();

    const categoriesBySlug = Object.fromEntries(
      categories.map((category) => [category.slug, category]),
    );

    await prisma.$transaction(async (tx) => {
      for (const username of USERNAMES) {
        const randomCategory =
          categoriesBySlug[
            Object.keys(categoriesBySlug)[
              Math.floor(Math.random() * Object.keys(categoriesBySlug).length)
            ]
          ];

        const userExists = await tx.user.findUnique({
          where: {
            username,
          },
        });

        if (!userExists) {
          const createdUser = await tx.user.create({
            data: {
              email: `${username}@gmail.com`,
              password: await hash('12345678'),
              username,
              displayName: username,
              avatar: `/channels/${username}.webp`,
              isEmailVerified: true,
              socialLinks: {
                createMany: {
                  data: [
                    {
                      title: 'Telegram',
                      url: `https://t.me/${username}`,
                      position: 1,
                    },
                    {
                      title: 'Instagram',
                      url: `https://www.instagram.com/${username}`,
                      position: 2,
                    },
                  ],
                },
              },
            },
          });

          const randomTitles = STREAMS[randomCategory.slug];
          const randomTitle =
            randomTitles[Math.floor(Math.random() * randomTitles.length)];

          await tx.stream.create({
            data: {
              title: randomTitle,
              thumbnailUrl: `/streams/${createdUser.username}.webp`,
              user: {
                connect: {
                  id: createdUser.id,
                },
              },
              category: {
                connect: {
                  id: randomCategory.id,
                },
              },
            },
          });

          Logger.log(`User "${createdUser.username}" created successfully`);
        }
      }
    });

    Logger.log('Database seeding completed successfully');
  } catch (error) {
    Logger.error(error);
    throw new BadRequestException('Failed to seed database');
  } finally {
    Logger.log('Closing database connection...');
    await prisma.$disconnect();
    Logger.log('Database connection closed successfully');
  }
}

main();
