import { type OpenAIApi } from 'openai'
import { type ChatCompletionRequestMessage } from 'openai/api'

export class PromptClient {
  readonly openAIClient: OpenAIApi

  /**
     * Simple chat completion interface that uses OpenAI's GPT API.
     * @param openAIClient The OpenAI API client.
     */
  constructor (openAIClient: OpenAIApi) {
    this.openAIClient = openAIClient
  }

  /**
     * Get the completion to the provided chat messages.
     */
  async getChatCompletion (messages: ChatCompletionRequestMessage[]): Promise<string> {
    if (JSON.stringify(messages).length > 10 ** 5) throw new Error('Request to GPT is too long.')
    if (messages.length === 0) throw new Error('Request to GPT is empty.')

    console.debug('Sending request to OpenAI...')
    let completion
    let attempts = 0
    const maxAttempts = 2
    while (attempts < maxAttempts && completion !== null) {
      try {
        attempts += 1
        completion = await this.openAIClient.createChatCompletion({ model: 'gpt-3.5-turbo-0301', messages })
      } catch (err) {
        console.error(`Request attempt ${attempts} to OpenAI failed with error ${err}`)
        if (attempts === maxAttempts) {
          throw err
        }
      }
    }
    // return the first response
    const response = completion.data.choices[0]
    console.debug(`Response received with finish reason: ${response.finish_reason}`)
    return response.message.content
  }
}
