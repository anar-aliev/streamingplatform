import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  providers: [ChatResolver, ChatService],
  imports: [PrismaModule],
})
export class ChatModule {}
