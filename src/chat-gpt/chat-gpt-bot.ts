import type Discord from 'discord.js'
import { type ChatCompletionRequestMessage } from 'openai/api'
import { Configuration, OpenAIApi } from 'openai'
import { getChatCompletion } from './chat-gpt-actions'

export default class ChatGptBot {
  readonly openAIClient: OpenAIApi
  private readonly botType: string
  private readonly chatHistory: ChatCompletionRequestMessage[]

  /**
   * Start a chat-bot with OpenAI.ChatGPT.
   *
   * The chat-bot needs a backstory.  What's its name?  Where did it come from?  What is it like?
   * @param openAIKey The OpenAI API key
   * @param background Provide the chat-bot with a backstory
   * @param botType chat bot type (simple override for 'AI language model' in bot responses)
   * @param openAIClient Provide the chat-bot with an OpenAI client.  If not provided, one will be created.
   * @param chatHistory Provide the chat-bot with a chat history.  If not provided, one will be created.
   */
  constructor (
    openAIKey: string,
    background: string,
    botType?: string,
    openAIClient?: OpenAIApi,
    chatHistory?: ChatCompletionRequestMessage[]
  ) {
    this.openAIClient = openAIClient ?? new OpenAIApi(new Configuration({ apiKey: openAIKey }))
    this.botType = botType ?? 'AI language model'
    this.chatHistory = chatHistory ?? [{ role: 'system', content: background }]
  }

  /**
   * Reads incoming messages and returns a response from the chat-bot.
   * @param message The incoming message
   */
  public async respondToMessage (message: Discord.Message): Promise<string> {
    console.log(`Bot handling message from ${message.author.username}`)

    // save the new message
    const name = message.author.username.replace(/[^\w]/g, '')
    this.chatHistory.push({ role: 'user', name, content: message.content })

    const response = await getChatCompletion(this.openAIClient, this.chatHistory)

    if (response !== 'No response.') {
      // save the response
      this.chatHistory.push({ role: 'assistant', content: response })
      return response.replace('AI language model', this.botType)
        .replace('an AI language model', `a ${this.botType}`)
    }
  }

  public resetBot (): ChatGptBot {
    return new ChatGptBot('', '', this.botType, this.openAIClient, this.chatHistory.slice(0, 1))
  }
}
