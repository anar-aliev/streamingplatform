import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { FiltersInput } from './inputs/filters.input';
import { StorageService } from '../libs/storage/storage.service';
import type { Prisma } from 'generated/prisma';
import type { User } from 'generated/prisma';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import * as Upload from 'graphql-upload/Upload.js';
import sharp from 'sharp';
import { GenerateStreamTokenInput } from './inputs/generate-stream-token.input';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class StreamService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  public async findAll(input: FiltersInput = {}) {
    const { take, skip, searchTerm } = input;
    const whereClause = searchTerm
      ? this.findBySearchTermFilter(searchTerm)
      : undefined;

    const streams = await this.prismaService.stream.findMany({
      take: take ?? 12,
      skip: skip ?? 0,
      where: {
        user: {
          isDeactivated: false,
        },
        ...whereClause,
      },
      include: {
        user: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return streams;
  }

  private findBySearchTermFilter(searchTerm: string): Prisma.StreamWhereInput {
    return {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        {
          user: {
            username: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    };
  }

  public async generateToken(input: GenerateStreamTokenInput) {
    const { userId, channelId } = input;

    let self: { id: string; username: string };

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      self = { id: user.id, username: user.username };
    } else {
      self = {
        id: userId,
        username: `Watcher ${Math.floor(Math.random() * 1000)}`,
      };
    }

    const channel = await this.prismaService.user.findUnique({
      where: {
        id: channelId,
      },
    });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const isHost = self.id === channel.id;

    const token = new AccessToken(
      this.configService.getOrThrow<string>('LIVEKIT_API_KEY'),
      this.configService.getOrThrow<string>('LIVEKIT_API_SECRET'),
      {
        identity: isHost ? `Host-${self.id}` : self.id.toString(),
        name: self.username,
      },
    );

    token.addGrant({
      room: channel.id,
      roomJoin: true,
      canPublish: false,
    });

    return { token: token.toJwt() };
  }

  private async findUserId(user: User) {
    const stream = await this.prismaService.stream.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  public async changeStreamInfo(user: User, input: ChangeStreamInfoInput) {
    const { title, categoryId } = input;
    await this.prismaService.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        title,
        categoryId,
      },
    });
    return true;
  }

  public async changeThumbnail(user: User, file: Upload) {
    const stream = await this.findUserId(user);
    if (stream.thumbnailUrl) {
      await this.storageService.remove(stream.thumbnailUrl);
    }

    const chunks: Buffer[] = [];
    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const filename = `streams/${user.username}.webp`;

    if (file.filename && file.filename.endsWith('.gif')) {
      const processedBuffer = await sharp(buffer, { animated: true })
        .resize(1280, 720)
        .webp()
        .toBuffer();

      await this.storageService.upload(processedBuffer, filename, 'image/webp');
    } else {
      const processedBuffer = await sharp(buffer)
        .resize(1280, 720)
        .webp()
        .toBuffer();

      await this.storageService.upload(processedBuffer, filename, 'image/webp');
    }
    await this.prismaService.stream.update({
      where: { userId: user.id },
      data: { thumbnailUrl: filename },
    });

    return true;
  }

  public async removeThumbnail(user: User) {
    const stream = await this.findUserId(user);
    if (!stream.thumbnailUrl) {
      return;
    }
    await this.storageService.remove(stream.thumbnailUrl);

    await this.prismaService.stream.update({
      where: { userId: user.id },
      data: { thumbnailUrl: null },
    });

    return true;
  }

  public async findRandom() {
    const total = await this.prismaService.stream.count({
      where: {
        user: {
          isDeactivated: false,
        },
      },
    });

    const randomIndexes = new Set<number>();
    while (randomIndexes.size < 4) {
      const randomIndex = Math.floor(Math.random() * total);
      randomIndexes.add(randomIndex);
    }

    const streams = await this.prismaService.stream.findMany({
      where: {
        user: {
          isDeactivated: false,
        },
      },
      include: {
        user: true,
        category: true,
      },
      take: total,
      skip: 0,
    });

    return Array.from(randomIndexes).map((index) => streams[index]);
  }
}
