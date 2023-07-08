import type Discord from 'discord.js'
import { createThreadInChannel, sendMessageToChannel, trackDiscordChannel } from '../discord/channel-actions'
import ChatGptBot from '../chat-gpt/chat-gpt-bot'
import { isMessageAboutCooking } from './woofs-kitchen-actions'
import { createTitleForPassage } from '../chat-gpt/chat-gpt-actions'
import { OPENAI_API_KEY } from '../../config/dev'
import { NOT_A_BOT } from '../general/general-bot-prompts'
import { RECIPES } from '../../config/recipes'

const woofsKitchenPrompt = 'Your name is Chef Woof. ' +
    'You recommend fellow Chef\'s recipes. ' +
    'Your job is to create a recipe for the user. ' +
    'If they ask for a recommendation without specifying any detail, provide a random recipe. ' +
    'Try to provide a recipe without asking questions.  '

const recipeTemplatePrompt = 'Write all of your recipes in the following format: ' +
    '\n\'\'\'' +
    '\n\n ## [NAME] ' +
    '\n ### Overview' +
    '\n Cuisine - **[ASSOCIATED_CUISINE]**' +
    '\n Serving Size - **[NUMBER_OF_PEOPLE_RECIPE_SERVES] people**' +
    '\n Prep Time - **[PREPARATION_TIME]**' +
    '\n Cook Time - **[COOK_TIME]**' +
    '\n Total Time - **[TOTAL_TIME]**' +
    '\n ### Ingredients ' +
    '\n - [INGREDIENT_AMOUNT_AND_NAME]' +
    '\n ### Instructions ' +
    '\n 1. [INGREDIENT_AMOUNT_AND_NAME]' +
    '\n\'\'\''

const background = [
  NOT_A_BOT,
  woofsKitchenPrompt,
    `You have the following list of recipes: ${RECIPES}`,
    recipeTemplatePrompt
].join(' ')

/**
 * Start the Woofs Kitchen App
 * @param discordToken Discord token
 * @param openaiApikey OpenAI API key
 * @param channelId Discord channel id to track messages for
 */
export function startWoofsKitchenApp (
  discordToken: string,
  openaiApikey: string,
  channelId: string
): void {
  const chatBot = new ChatGptBot(openaiApikey, background, 'Chef')

  trackDiscordChannel(
    discordToken,
    channelId,
    async (message: Discord.Message) => {
      // skip messages not about cooking
      if (!await isMessageAboutCooking(chatBot.openAIClient, message)) { return }

      const threadBot = chatBot.resetBot()

      const response = await threadBot.respondToMessage(message)

      const threadTopic = await createTitleForPassage(chatBot.openAIClient, response)

      // skip messages about unknown topics
      if (threadTopic === 'Unknown') { return }

      const thread = await createThreadInChannel(message.channel, threadTopic)

      trackDiscordChannel(discordToken, thread.id,
        async (message: Discord.Message) => {
          await sendMessageToChannel(thread, await threadBot.respondToMessage(message)
          )
        })
      await sendMessageToChannel(thread, response)
    })
}
