import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SlackModule } from './modules/slack/slack.module';
import { LoggerModule } from 'nestjs-rollbar';
import { App, ExpressReceiver } from '@slack/bolt';
import { SlackService } from './modules/slack/slack.service';
import { SlackController } from './modules/slack/slack.controller';
import { ConfigService } from './shared/config.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      environment: process.env.ROLLBAR_ENVIRONMENT,
      captureUncaught: true,
      captureUnhandledRejections: true,
      ignoreDuplicateErrors: false,
    }),
    SlackModule,
  ],
  controllers: [AppController, SlackController],
  providers: [AppService, SlackService, ConfigService],
})
export class AppModule {
  constructor(private slackService: SlackService) { }

  initSlackEvents(receiver: ExpressReceiver) {
    const boltApp = new App({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      scopes: "",
      authorize: async () => {
        return {
          botToken: process.env.SLACK_ACCESS_TOKEN,
          botId: process.env.SLACK_BOT_ID
        }
      },
      receiver,
    });
    this.slackService.initSlackCommand(boltApp);
  }
}
