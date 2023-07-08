import { type Message } from 'discord.js'
import { type OpenAIApi } from 'openai'
import { answerYesNoQuestion } from '../chat-gpt/chat-gpt-actions'

export async function isMessageAboutCooking (client: OpenAIApi, message: Message): Promise<boolean> {
  return await answerYesNoQuestion(client,
    'Does the following message meet any of the following criteria? ' +
        `\nMessage: \n'''\n${message.content}\n'''\n` +
        '\nCriteria: ' +
        '\n- Does it contain the name a recipe, dish, or ingredient?' +
        '\n- Is it related to cooking?'
  )
}
