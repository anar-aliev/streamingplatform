import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IS_DEV_ENV } from '../shared/utils/is-dev.utils';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { getGraphQLConfig } from './config/graphql.config';
import { AccountModule } from '../modules/auth/account/account.module';
import { SessionModule } from '../modules/auth/session/session.module';
import { MailModule } from '../modules/libs/mail/mail.module';
import { VerificationModule } from '../modules/auth/verification/verification.module';
import { RecoveryModule } from '../modules/auth/recovery/recovery.module';
import { TotpModule } from '../modules/auth/totp/totp.module';
import { DeactivateModule } from '../modules/auth/deactivate/deactivate.module';
import { CronModule } from '../modules/cron/cron.module';
import { StorageModule } from '../modules/libs/storage/storage.module';
import { ProfileModule } from 'src/modules/auth/profile/profile.module';
import { StreamModule } from 'src/modules/stream/stream.module';
import { LivekitModule } from 'src/modules/libs/livekit/livekit.module';
import { getLiveKitConfig } from './config/livekit.config';
import { IngressModule } from 'src/modules/stream/ingress/ingress.module';
import { CategoryModule } from 'src/modules/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: !IS_DEV_ENV,
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: getGraphQLConfig,
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    LivekitModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getLiveKitConfig,
      inject: [ConfigService],
    }),
    AccountModule,
    SessionModule,
    CronModule,
    MailModule,
    VerificationModule,
    RecoveryModule,
    TotpModule,
    DeactivateModule,
    StorageModule,
    ProfileModule,
    StreamModule,
    IngressModule,
    CategoryModule,
  ],
})
export class CoreModule {}
