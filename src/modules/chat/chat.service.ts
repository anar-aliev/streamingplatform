import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SendMessageInput } from './input/send-message.input';
import { ChangeChatSettingsInput } from './input/change-chat-settings.input';
import type { User } from 'generated/prisma';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  public async findByStream(streamId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        streamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    return messages;
  }

  public async sendMessage(userId: string, input: SendMessageInput) {
    const { text, streamId } = input;

    const stream = await this.prisma.stream.findUnique({
      where: {
        id: streamId,
      },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (!stream.isLive) {
      throw new BadRequestException('Stream is not live');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        text,
        user: {
          connect: {
            id: userId,
          },
        },
        stream: {
          connect: {
            id: streamId,
          },
        },
      },
      include: {
        stream: true,
      },
    });

    return message;
  }

  public async changeSettings(user: User, input: ChangeChatSettingsInput) {
    const { isChatEnabled, isChatFollowersOnly, isChatPremiumFollowersOnly } =
      input;

    await this.prisma.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        isChatEnabled,
        isChatFollowersOnly,
        isChatPremiumFollowersOnly,
      },
    });

    return true;
  }
}
