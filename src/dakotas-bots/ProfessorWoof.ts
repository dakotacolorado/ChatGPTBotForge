import DiscordChatBot from "../chat-gpt/DiscordChatBot";
import Discord from "discord.js";
import {DiscordChannelTracker} from "../discord/DiscordChannelTracker";


const professorWoofPrompt =
`Your name is Professor Woof.
Your job is to ask questions to students and help them learn the correct answers.    
You will be given a topic and a difficulty score from 1-10.  
You will create a question about that topic domain with difficulty proportional to the score.
If no score is provided, chose one between 1-10.
Try to make the difficulty 10 problems advanced professional level difficulty. 
`

// TODO: Create a common utility set for all the bots.  Too much duplicate code...

const background = [
    professorWoofPrompt,
].join(' ')

export class ProfessorWoof {

    protected readonly discordToken: string
    /** Discord Chat Bot that responds to messages */
    protected readonly discordChatBot: DiscordChatBot
    /** Discord Channel Tracker that tracks messages */
    protected readonly discordChannelTracker: DiscordChannelTracker

    /**
     * Professor Woof Chat Bot
     * @param openAIKey OpenAI API key
     * @param discordToken Discord token
     * @param channelId Discord channel id to track messages for
     */
    constructor(openAIKey: string, discordToken: string, channelId: string) {
        this.discordToken = discordToken
        this.discordChatBot = new DiscordChatBot(openAIKey, background, 'Professor');
        this.discordChannelTracker = new DiscordChannelTracker(discordToken, channelId, (m) => this.handleMessage(m))
    }

    /**
     * Looks for messages about asking for a test and creates a thread with a test name if it finds one.
     * A new Discord bot is created to handle messages to the thread.
     * @param message
     */
    async handleMessage(message: Discord.Message) {

        // skip messages not asking for tests
        if (!await this.isMessageAskingForATest(message.content)) { return }

        const threadBot = this.discordChatBot.resetBot()

        const quizQuestion = await threadBot.respondToDiscordMessage(message)

        const threadTopic = await this.discordChatBot.createTitleForPassage(quizQuestion)

        // skip messages about unknown topics
        if (threadTopic.toLowerCase() === 'unknown') { return }

        // create a new thread in the channel
        const thread = await this.discordChannelTracker.createThreadInChannel(message.channel, threadTopic)

        this.setupChannelTrackerForThread(thread, threadBot, quizQuestion)

        await this.discordChannelTracker.sendMessageToChannel(thread, quizQuestion)
    }

    /**
     * Determines if a message is asking for a test
     * @param message Discord message
     * @returns true if the message is about cooking, false otherwise.
     */
    async isMessageAskingForATest (message: string): Promise<boolean> {
        return await this.discordChatBot.answerYesNoQuestion(
`Yes or No.  Does the message '${message}' requesting any of the following: a question, a test, or a quiz?`
        )
    }

    /**
     * Determines if an answer is correct
     * @param question question asked
     * @param answer attempted answer for question
     * @returns true if the answer is correct, false otherwise.
     */
    async isAnswerCorrect (question: string, answer: string): Promise<boolean> {
        return await this.discordChatBot.answerYesNoQuestion(
            `Given the question '${question}' is the answer '${answer}' close to correct?`
        )
    }

    scheduleQuestion(topic: string, level: string, frequency: number) {
        setInterval(async () => {
            console.log(`Starting scheduled question for ${topic} level ${level} at ${new Date()}`)

            const threadBot = this.discordChatBot.resetBot()

            const quizQuestion = await threadBot.respondToStringMessage(`Level ${level} '${topic}' test.`)

            const threadTopic = await this.discordChatBot.createTitleForPassage(quizQuestion)

            const thread = await this.discordChannelTracker.createThreadInChannel(this.discordChannelTracker.channel, threadTopic)

            this.setupChannelTrackerForThread(thread, threadBot, quizQuestion)

            await this.discordChannelTracker.sendMessageToChannel(thread, quizQuestion)

        }, frequency); // 10 hours in milliseconds
    }

    setupChannelTrackerForThread(thread: Discord.ThreadChannel, threadBot: DiscordChatBot, quizQuestion: string){
        let foundCorrectAnswer = false
        let attempts = 0
        const MAX_ATTEMPTS = 3
        // track that channel with the thread bot
        new DiscordChannelTracker(this.discordToken, thread.id, async (message: Discord.Message) => {
            if(!foundCorrectAnswer){
                attempts += 1
                foundCorrectAnswer = await this.isAnswerCorrect(quizQuestion, message.content)
                if (foundCorrectAnswer) {
                    await this.discordChannelTracker.sendMessageToChannel(thread, "Correct :white_check_mark:")
                } else if(attempts >= MAX_ATTEMPTS) {
                    await this.discordChannelTracker.sendMessageToChannel(thread, `Failed. Max attempts reached. (${attempts}/${MAX_ATTEMPTS})`)
                    foundCorrectAnswer = true
                } else {
                    await this.discordChannelTracker.sendMessageToChannel(thread, `Incorrect (${attempts}/${MAX_ATTEMPTS}) :x:`)
                }
            } else {
                await this.discordChannelTracker.sendMessageToChannel(thread, await threadBot.respondToDiscordMessage(message))
            }
        })
    }
}