import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { StorageModule } from 'src/modules/libs/storage/storage.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';


@Module({
  imports: [StorageModule, PrismaModule],
  providers: [ProfileResolver, ProfileService],
})
export class ProfileModule {}
