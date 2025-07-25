import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as Upload from 'graphql-upload/Upload.js';
import { StorageService } from 'src/modules/libs/storage/storage.service';
import type { User } from 'generated/prisma';
import sharp from 'sharp';
import { ChangeInfoInput } from './inputs/change-info.input';
import {
  ReorderSocialLinksInput,
  SocialLinkInput,
} from './inputs/social-link.input';

@Injectable()
export class ProfileService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  public async changeAvatar(user: User, file: Upload) {
    if (user.avatar) {
      await this.storageService.remove(user.avatar);
    }
    const chunks: Buffer[] = [];
    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const filename = `channels/${user.username}.webp`;

    if (file.filename && file.filename.endsWith('.gif')) {
      const processedBuffer = await sharp(buffer, { animated: true })
        .resize(512, 512)
        .webp()
        .toBuffer();

      await this.storageService.upload(processedBuffer, filename, 'image/webp');
    } else {
      const processedBuffer = await sharp(buffer)
        .resize(512, 512)
        .webp()
        .toBuffer();

      await this.storageService.upload(processedBuffer, filename, 'image/webp');
    }
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { avatar: filename },
    });

    return true;
  }

  public async removeAvatar(user: User) {
    if (!user.avatar) {
      return;
    }
    await this.storageService.remove(user.avatar);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { avatar: null },
    });

    return true;
  }

  public async changeProfileInfo(user: User, input: ChangeInfoInput) {
    const { username, displayName, bio } = input;

    const usernameExists = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExists && username !== user.username) {
      throw new ConflictException('Username already exists');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { username, displayName, bio },
    });

    return true;
  }

  public async findSocialLinks(user: User) {
    const socialLinks = await this.prismaService.socialLinks.findMany({
      where: { userId: user.id },
      orderBy: { position: 'asc' },
    });

    return socialLinks;
  }

  public async createSocialLink(user: User, input: SocialLinkInput) {
    const { title, url } = input;
    const lastSocialLink = await this.prismaService.socialLinks.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = lastSocialLink ? lastSocialLink.position + 1 : 1;

    await this.prismaService.socialLinks.create({
      data: {
        title,
        url,
        position: newPosition,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    return true;
  }

  public async reorderSocialLinks(list: ReorderSocialLinksInput[]) {
    if (!list.length) {
      return;
    }

    const updatedPromises = list.map(async (socialLink) => {
      return await this.prismaService.socialLinks.update({
        where: {
          id: socialLink.id,
        },
        data: {
          position: socialLink.position,
        },
      });
    });

    await Promise.all(updatedPromises);
    return true;
  }

  public async updateSocialLink(id: string, input: SocialLinkInput) {
    const { title, url } = input;

    await this.prismaService.socialLinks.update({
      where: {
        id,
      },
      data: {
        title,
        url,
      },
    });
    return true;
  }

  public async deleteSocialLink(id: string) {
    await this.prismaService.socialLinks.delete({
      where: {
        id,
      },
    });
    return true;
  }
}
