import Discord, {TextChannel} from "discord.js";

/**
 * Regularly delete the messages in a Discord channel
 * @param discordToken
 * @param channelId
 * @param hours
 * @param period Period at which to delete messages (in minutes)
 */
export function continuallyDeleteMessages (
    discordToken: string,
    channelId: string,
    hours: number,
    period: number
){
    // interval in ms = (period in minutes) * (1 minute in ms)
    const interval = period * 60 * 1000;

    const intervalId = setInterval(() => {
        deleteMessages(
            discordToken,
            channelId,
            hours,
        );

        // After runtime, clear the interval
        setTimeout(() => {
            clearInterval(intervalId);
            console.log("Function execution stopped.");
        }, interval);
    }, interval);
}


/**
 * Delete the messages in a Discord Channel that are older than the given numbers of hours.
 * @param discordToken Discord bot token
 * @param channelId Channel to track
 * @param hours Hours to wait before deleting a message
 */
export function deleteMessages (
    discordToken: string,
    channelId: string,
    hours: number
): void {
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
        const channel = await discordClient.channels.fetch(channelId) as TextChannel;

        const messages = await channel.messages.fetch();
        const twentyXHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

        const messagesToDelete = messages.filter(
            message => message.createdTimestamp < twentyXHoursAgo.getTime());

        messagesToDelete.forEach(async message => {
            try {
                await message.delete();
                console.log(`Deleted message with ID ${message.id}`);
            } catch (error) {
                console.error(`Error deleting message with ID ${message.id}: ${error}`);
            }
        });

    })

    void discordClient.login(discordToken)
}
