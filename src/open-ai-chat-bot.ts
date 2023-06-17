import type Discord from 'discord.js'
import { type ChatCompletionRequestMessage } from 'openai/api'
import { Configuration, OpenAIApi } from 'openai'
import { type DocumentClient } from 'aws-sdk/clients/dynamodb'

export default class OpenAIChatBot {
  private readonly openAIClient: OpenAIApi

  private readonly chatHistory: ChatCompletionRequestMessage[] = []

  private requestRetryCount = 0

  /**
   * Start a chat-bot with OpenAI.ChatGPT.
   *
   * The chat-bot needs a backstory.  What's its name?  Where did they come from?  What are they like?
   * @param openAIKey The OpenAI API key
   * @param background Provide the chat-bot with a backstory
   * @param dynamoDBClient AWS SDK DynamoDB client
   * @param chatTableName Name of the table in DynamoDB to save chat history
   * @param chatId Unique ID for the chat
   */
  constructor (
    openAIKey: string,
    background: string,
    private readonly dynamoDBClient: DocumentClient,
    private readonly chatTableName: string,
    private readonly chatId: string
  ) {
    this.dynamoDBClient.get({
      TableName: this.chatTableName,
      Key: { id: `Chat-${this.chatId}` }
    }).promise().then(
      response => {
        console.log(`Chat history loaded from DynamoDB for ${this.chatId}.`)
        throw Error('Not implemented')
        response.Item.chatHistory.forEach(msg => this.chatHistory.push(msg))
      }
    ).catch(() => {
      console.error(`No chat history saved to DynamoDB for ${this.chatId}.`)
      this.chatHistory.push({
        role: 'system',
        content: background
      })
    })

    this.openAIClient = new OpenAIApi(new Configuration({ apiKey: openAIKey }))
  }

  /**
     * Reads incoming messages and returns a response from the chat-bot.
     * @param message The incoming message
     */
  public async respondToMessage (message: Discord.Message) {
    console.log(`Bot handling message from ${message.author.username}`)

    // save the new message
    this.chatHistory.push({
      role: 'user',
      name: message.author.username.replace(/[^\w]/g, ''),
      content: message.content
    })
    await this.saveChatToDynamoDB()

    const response = await this.getResponseFromOpenAI()

    if (response === 'No response.') {

    } else {
      // save the response
      this.chatHistory.push({
        role: 'assistant',
        content: response
      })
      return response
    }
  }

  /**
     * Sends the chat history to OpenAI Chat GPT and gets the bot's response.
     */
  private async getResponseFromOpenAI () {
    console.log('Sending request to OpenAI...')
    try {
      const completion = await this.openAIClient.createChatCompletion({
        model: 'gpt-3.5-turbo-0301',
        messages: this.chatHistory
      })

      // just select the first response
      const response = completion.data.choices[0]
      console.log(`Response received with finish reason: ${response.finish_reason}`)
      await this.saveChatToDynamoDB()
      return response.message.content
    } catch (e) {
      console.log(`Error while sending request to OpenAI: ${e}`)
      this.requestRetryCount += 1
      if (this.requestRetryCount < 3) {
        await new Promise(f => setTimeout(f, 1000)) // wait 1 second
        console.log('Retrying request to OpenAI...')
        return this.getResponseFromOpenAI()
      } else {
        console.log('Request to OpenAI failed 3 times.')
        return 'No response.'
      }
    }
  }

  /**
   * Saves the chat history to DynamoDB.
   */
  private async saveChatToDynamoDB () {
    try {
      await this.dynamoDBClient.put({
        TableName: this.chatTableName,
        Item: {
          id: `Chat-${this.chatId}`,
          chatHistory: this.chatHistory
        }
      }).promise()
      console.log('Chat history saved to DynamoDB.')
    } catch (error) {
      console.error('Error saving chat history to DynamoDB.', error)
    }
  }
}
