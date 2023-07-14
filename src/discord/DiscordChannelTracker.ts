import Discord, {Channel} from "discord.js";


/**
 * Asynchronously handles a Discord message.
 */
export type HandleMessage = (message: Discord.Message) => Promise<void>

export class DiscordChannelTracker {

    /** Discord channel to track */
    channel

    /**
     * Tracks a Discord channel for messages.
     * @param discordToken Discord bot token
     * @param channelId Channel to track
     * @param handleMessage Handle messages sent to the channel
     */
    constructor(
        discordToken: string,
        channelId: string,
        handleMessage: HandleMessage
    ) {
        console.log(`Starting to track Discord channel ${channelId}.`)

        const discordClient = new Discord.Client({
            intents: [
                Discord.GatewayIntentBits.Guilds,
                Discord.GatewayIntentBits.GuildMessages,
                Discord.GatewayIntentBits.GuildMessageTyping,
                Discord.GatewayIntentBits.GuildMembers,
                Discord.GatewayIntentBits.GuildModeration,
                Discord.GatewayIntentBits.MessageContent
            ]
        })

        discordClient.on(Discord.Events.ClientReady, async () => {
            console.log(`Discord bot '${discordClient.user.username}' listening to channel '${channelId}'.`)
            this.channel = await discordClient.channels.fetch(channelId)
        })

        discordClient.on(
            Discord.Events.MessageCreate,
            async (message: Discord.Message) => {
                // ignore messages sent by the bot
                if (discordClient.user.username !== message.author.username) {
                    // only respond to messages in the channel we're tracking
                    if (channelId === message.channelId) {
                        console.log(`'${discordClient.user.username}' received message from ${message.author.username} in channel ${message.channelId}`)
                        await handleMessage(message)
                    }
                }
            }
        )

        void discordClient.login(discordToken)
    }


    /**
     * Sends a message to a Discord channel.
     * @param channel Channel to send message to
     * @param message Message to send
     */
    async sendMessageToChannel (
        channel: Discord.Channel | Discord.ThreadChannel,
        message: string
    ): Promise<void> {
        if (channel instanceof Discord.TextChannel || channel instanceof Discord.ThreadChannel) {
            if (message !== '') {
                // split the response message if it's larger than 4000 characters
                if (message.length > 2000) {
                    console.log(`Sending large response in multiple messages. ${message.length}`)
                    const chunks = message.match(/(.|[\r\n]){1,2000}/g)
                    console.log(chunks)
                    for (const chunk of chunks) {
                        await channel.send(chunk)
                    }
                } else {
                    await channel.send(message)
                }
            } else {
                console.log('Skipping empty message')
            }
        } else {
            throw new TypeError('Channel is not of type TextChannel or ThreadChannel')
        }
    }

    /**
     * Creates a thread in a text channel.
     * @param channel Text channel to create thread in
     * @param threadName Name of thread to create
     */
    async createThreadInChannel (
        channel: Discord.Channel,
        threadName: string
    ): Promise<Discord.ThreadChannel> {
        console.assert(channel instanceof Discord.TextChannel)
        if (!(channel instanceof Discord.TextChannel)) {
            throw new TypeError('Channel is not of type TextChannel')
        } else {
            // check if thread was already created
            const existingThread = channel.threads.cache.find(thread => thread.name === threadName)
            if (existingThread) {
                return existingThread
            } else {
                return await channel.threads.create({ name: threadName })
            }
        }
    }
}