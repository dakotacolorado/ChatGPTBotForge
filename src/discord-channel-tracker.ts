import Discord from 'discord.js'
import type ChatBot from './open-ai-chat-bot'

export default class DiscordChannelTrackerBot {
  /**
   * Track a Discord channel for messages.
   * @param token Discord bot token
   * @param channelId Channel to track
   * @param chatBot Chat bot to respond to messages
   */
  constructor (token: string, channelId: string, chatBot: ChatBot) {
    console.log(`Discord bot starting up for channel ${channelId}...`)

    const client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.MessageContent
      ]
    })

    this.setupClientReadyAction(client, channelId)

    this.setupMessageCreateAction(client, channelId, chatBot)

    client.login(token)
  }

  /**
   * Sets up a listener for when the client is ready.
   * @param client Discord client
   * @param channelId
   */
  setupClientReadyAction (client: Discord.Client, channelId: string) {
    client.on(Discord.Events.ClientReady, () => {
      // console.log(client)
      console.log(`Discord bot '${client.user.username}' listening to channel '${channelId}'.`)
    })
  }

  /**
   * Sets up a tracker for Discord channels to read and respond to messages.
   * @param client Discord client
   * @param channelId Channel to track
   * @param chatBot Chat bot that handles the messages
   */
  private async setupMessageCreateAction (client: Discord.Client, channelId: string, chatBot: ChatBot) {
    client.on(Discord.Events.MessageCreate, async (message: Discord.Message) => {
      console.log(`'${client.user.username}' received message from ${message.author.username} in channel ${message.channelId}`)
      // ignore messages sent by the bot
      if (client.user.username != message.author.username) {
        // only respond to messages in the channel we're tracking
        if (message.channelId == channelId) {
          const response = await chatBot.respondToMessage(message)
          if (response) {
            // split the response message if it's larger than 4000 characters
            if (response.length > 2000) {
              console.log(`Sending large response in multiple messages. ${response.length}`)
              const chunks = response.match(/(.|[\r\n]){1,2000}/g)
              console.log(chunks)
              for (const chunk of chunks) {
                message.channel.send(chunk)
              }
            } else {
              message.channel.send(response)
            }
          }
        }
      }
    })
  }
}
