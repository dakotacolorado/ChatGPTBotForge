import {
  AWS_CREDENTIALS,
  AWS_REGION,
  DEV_CHAT,
  DISCORD_TOKEN,
  DISCORD_TOKEN_STEVE,
  OPENAI_API_KEY,
  TALK_WITH_JOSE
} from '../config/dev'
import DiscordChannelTrackerBot from './discord-channel-tracker'
import OpenAIChatBot from './open-ai-chat-bot'
import { CASUAL_GROUP_CHAT, DAKOTAS_BOT_FILES, JOSE_MONTANA, NOT_A_BOT } from './prompts/training-prompts'
import readFiles from './prompts/file-reader'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

readFiles('.').then(
  files => {
    const ddbClient = new DocumentClient({
      credentials: AWS_CREDENTIALS,
      region: AWS_REGION
    })

    const joseMontana = new OpenAIChatBot(
      OPENAI_API_KEY,
      NOT_A_BOT +
            CASUAL_GROUP_CHAT +
            JOSE_MONTANA +
            DAKOTAS_BOT_FILES(files),
      ddbClient,
      'talk-with-jose-chat',
      TALK_WITH_JOSE
    )
    new DiscordChannelTrackerBot(DISCORD_TOKEN_STEVE, TALK_WITH_JOSE, joseMontana)

    const basicBot = new OpenAIChatBot(
      OPENAI_API_KEY,
      NOT_A_BOT +
            CASUAL_GROUP_CHAT,
      ddbClient,
      'dakotas-bot-test-chat',
      DEV_CHAT
    )
    new DiscordChannelTrackerBot(DISCORD_TOKEN, DEV_CHAT, basicBot)
  }
)
