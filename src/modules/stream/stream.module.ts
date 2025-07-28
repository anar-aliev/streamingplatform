import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamResolver } from './stream.resolver';
import { StorageModule } from '../libs/storage/storage.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  providers: [StreamResolver, StreamService],
  imports: [StorageModule, PrismaModule],
})
export class StreamModule {}
