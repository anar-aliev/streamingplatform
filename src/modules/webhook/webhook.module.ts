import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { RawBodyMiddleware } from 'src/shared/middlewares/raw-body.middleware';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  controllers: [WebhookController],
  imports: [PrismaModule],
  providers: [WebhookService],
})
export class WebhookModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes({
      path: 'webhook/livekit',
      method: RequestMethod.POST,
    });
  }
}
