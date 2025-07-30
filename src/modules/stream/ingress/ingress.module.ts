import { Module } from '@nestjs/common';
import { IngressService } from './ingress.service';
import { IngressResolver } from './ingress.resolver';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IngressResolver, IngressService],
})
export class IngressModule {}
