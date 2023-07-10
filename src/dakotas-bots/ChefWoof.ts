import DiscordChatBot from "../chat-gpt/DiscordChatBot";
import {RECIPES} from "../../config/recipes";
import Discord from "discord.js";
import {DiscordChannelTracker} from "../discord/DiscordChannelTracker";

const NOT_A_BOT = 'In your responses never reveal that you are a bot or an AI language model.  Everything you say should make you seem like a normal human participating in the conversation. '


const woofsKitchenPrompt =
`Your name is Chef Woof.
You recommend fellow Chef\'s recipes.
Your job is to create a recipe for the user.
If they ask for a recommendation without specifying any detail, provide a random recipe.
Try to provide a recipe without asking questions.   `

const recipeTemplatePrompt =
`Write all of your recipes in the following format:

## [NAME]

### Overview
Cuisine - **[ASSOCIATED_CUISINE]**
Serving Size - **[NUMBER_OF_PEOPLE_RECIPE_SERVES] people**
Prep Time - **[PREPARATION_TIME]**
Cook Time - **[COOK_TIME]**
Total Time - **[TOTAL_TIME]**

### Ingredients
- [INGREDIENT_AMOUNT_AND_NAME]

### Instructions
1. [INGREDIENT_AMOUNT_AND_NAME]`

const background = [
    NOT_A_BOT,
    woofsKitchenPrompt,
    `You have the following list of recipes: ${RECIPES}`,
    recipeTemplatePrompt
].join(' ')

export class ChefWoof {

    protected readonly discordToken: string
    /** Discord Chat Bot that responds to messages */
    protected readonly discordChatBot: DiscordChatBot
    /** Discord Channel Tracker that tracks messages */
    protected readonly discordChannelTracker: DiscordChannelTracker

    /**
     * Chef Woof Chat Bot
     * @param openAIKey OpenAI API key
     * @param discordToken Discord token
     * @param channelId Discord channel id to track messages for
     */
    constructor(openAIKey: string, discordToken: string, channelId: string) {
        this.discordToken = discordToken
        this.discordChatBot = new DiscordChatBot(openAIKey, background, 'Chef');
        this.discordChannelTracker = new DiscordChannelTracker(discordToken, channelId, (m) => this.handleMessage(m))
    }

    /**
     * Looks for messages about cooking and creates a thread with a recipe name if it finds a message about cooking.
     * A new Discord bot is created to handle messages to the thread.
     * @param message
     */
    async handleMessage(message: Discord.Message) {
        // skip messages not about cooking
        if (!await this.isMessageAboutCooking(message.content)) { return }

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
     * Determines if a message is about cooking
     * @param message Discord message
     * @returns true if the message is about cooking, false otherwise.
     */
    async isMessageAboutCooking (message: string): Promise<boolean> {
        return await this.discordChatBot.answerYesNoQuestion(
`Does the message '${message}' ask for help with cooking something or contain the name of a recipe, dish, or ingredient?`
        )
    }
}