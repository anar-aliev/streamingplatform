import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import * as Upload from 'graphql-upload/Upload.js';
import { StorageService } from 'src/modules/libs/storage/storage.service';
import type { User } from 'generated/prisma';
import sharp from 'sharp';
import { ChangeInfoInput } from './inputs/change-info.input';

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
}
