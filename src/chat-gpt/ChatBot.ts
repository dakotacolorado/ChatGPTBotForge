import type Discord from 'discord.js'
import { type ChatCompletionRequestMessage } from 'openai/api'
import { Configuration, OpenAIApi } from 'openai'
import QueryBot from "./QueryBot";

export default class ChatBot extends QueryBot {
  private readonly botType: string
  private readonly chatHistory: ChatCompletionRequestMessage[]

  /**
   * Start a chat-bot to handle Discord messages.
   *
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
    super(openAIClient ?? new OpenAIApi(new Configuration({ apiKey: openAIKey })))
    this.botType = botType ?? 'AI language model'
    this.chatHistory = chatHistory ?? [{ role: 'system', content: background }]
  }

  /**
   * Resets the chat-bot history to its initial state.
   */
  public resetBot (): ChatBot {
    return new ChatBot('', '', this.botType, this.openAIClient, this.chatHistory.slice(0, 1))
  }

  /**
   * Records a message and returns a response from the chat-bot.
   * @param message The incoming message
   * @param user The user who sent the message
   */
  public async respondToMessage(message: string, user: string = 'null'): Promise<string> {
    // save the new message
    this.chatHistory.push({ role: 'user', name: user, content: message })

    const response = await this.getChatCompletion(this.chatHistory)

    if (response !== 'No response.') {
      // save the response
      this.chatHistory.push({ role: 'assistant', content: response })
      return response.replace('AI language model', this.botType)
          .replace('an AI language model', `a ${this.botType}`)
    }
  }

  public async respondToDiscordMessage (message: Discord.Message): Promise<string> {
    console.log(`Bot handling message from ${message.author.username}`)
    return await this.respondToMessage(
        message.content,
        message.author.username.replace(/[^\w]/g, '')
    )
  }
}
