import DiscordChatBot from "../chat-gpt/DiscordChatBot";
import Discord from "discord.js";
import {DiscordChannelTracker} from "../discord/DiscordChannelTracker";
import {glob} from "glob";
import {readFileSync} from "fs";

export async function readFiles (): Promise<string[][]> {
    const files = await glob('**/*.ts', { ignore: ['node_modules/**', 'config/**', '.idea/**', 'package-lock.json', 'tst/**'] })
    console.log(files)
    return files.map(filename => [
        filename,
        readFileSync(filename, 'utf8')
    ])
}

/**
 * Read all the files in the directory into a map of [file name, file content]
 * @param files The path to the directory to read
 */
function formatFilesToMarkdown (files: string[][]): string {
    return files.map(f => `\n\n### Filename: ${f[0]} \n\n \`\`\`\n${f[1]}\n\`\`\``).join('\n')
}

export class CodingAssistant {

    protected readonly discordToken: string
    /** Discord Chat Bot that responds to messages */
    protected readonly discordChatBot: DiscordChatBot

    /** Discord Channel Tracker that tracks messages */
    protected readonly discordChannelTracker: DiscordChannelTracker

    protected readonly background: string;

    /**
     * Coding assistant bot that has access to the codebase and give recommendations.
     * @param openAIKey OpenAI API key
     * @param discordToken Discord token
     * @param channelId Discord channel id to track messages for
     * @param files Files to read into the codebase. Each file should be a [file name, file content] pair.
     */
    constructor(
        openAIKey: string,
        discordToken: string,
        channelId: string,
        files: string[][]
    ) {
        const background = `You are an assistant for working on the following codebase:\n\n${formatFilesToMarkdown(files)}`

        this.discordToken = discordToken
        this.discordChatBot = new DiscordChatBot(openAIKey, background, 'Chef');
        this.discordChannelTracker = new DiscordChannelTracker(discordToken, channelId, (m) => this.handleMessage(m))
    }

    async handleMessage(message: Discord.Message) {
        // skip messages not about code changes or features
        if (!await this.isMessageAskingForFeature(message.content)) { return }

        const threadBot = this.discordChatBot.resetBot()

        const response = await threadBot.respondToDiscordMessage(message)

        const threadTopic = await this.discordChatBot.createTitleForPassage(response)

        // skip messages about unknown topics
        if (threadTopic.toLowerCase() === 'unknown') { return }

        const thread = await this.discordChannelTracker.createThreadInChannel(message.channel, threadTopic)

        new DiscordChannelTracker(this.discordToken, thread.id, async (message: Discord.Message) => {
            await this.discordChannelTracker.sendMessageToChannel(thread, await threadBot.respondToDiscordMessage(message))})

        await this.discordChannelTracker.sendMessageToChannel(thread, response)
    }

    /**
     * Determines if a message is asking for a code change or feature
     * @param message Discord message
     * @returns true if the message is asking for a code change or feature, false otherwise.
     */
    async isMessageAskingForFeature (message: string): Promise<boolean> {
        return await this.discordChatBot.answerYesNoQuestion(
            `Yes or no, does the message '${message}' ask for help in either creating a feature or making a code change?`
        )
    }
}