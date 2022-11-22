import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ExpressReceiver } from '@slack/bolt';
import { RollbarLogger } from 'nestjs-rollbar';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/all.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: {
      commands: '/slack/command'
    },
  });
  const httpAdapter = app.get(HttpAdapterHost);

  const rollbarLogger = app.get(RollbarLogger);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, rollbarLogger));

  const appModule = app.get(AppModule);
  appModule.initSlackEvents(receiver);

  app.use(receiver.router);

  await app.listen(process.env.port);
}
bootstrap();
