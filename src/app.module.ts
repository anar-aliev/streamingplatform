import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { AccountModule } from './modules/auth/account/account.module';
import { SessionModule } from './modules/auth/session/session.module';
import { MailModule } from './modules/libs/mail/mail.module';
import { VerificationModule } from './modules/auth/verification/verification.module';
import { RecoveryModule } from './modules/auth/recovery/recovery.module';
import { TotpModule } from './modules/auth/totp/totp.module';
import { DeactivateModule } from './modules/auth/deactivate/deactivate.module';
import { CronModule } from './modules/cron/cron.module';
import { StoradgeModule } from './modules/libs/storadge/storadge.module';
import { StorageModule } from './modules/libs/storage/storage.module';
import { ProfileModule } from './modules/auth/profile/profile.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AccountModule,
    SessionModule,
    MailModule,
    VerificationModule,
    RecoveryModule,
    TotpModule,
    DeactivateModule,
    CronModule,
    StoradgeModule,
    StorageModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
