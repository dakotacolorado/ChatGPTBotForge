import { type ChatCompletionRequestMessage } from 'openai/api'
import { type OpenAIApi } from 'openai'

/**
 * Sends the chat history to OpenAI Chat GPT and gets the bot's response for the next message.
 */
export async function getChatCompletion (
  client: OpenAIApi,
  messages: ChatCompletionRequestMessage[]
): Promise<string> {
  console.debug('Sending request to OpenAI...')
  const completion = await client.createChatCompletion({
    model: 'gpt-3.5-turbo-0301',
    messages
  })

  // return the first response
  const response = completion.data.choices[0]
  console.debug(`Response received with finish reason: ${response.finish_reason}`)
  return response.message.content
}

/**
 * Ask GPT a yes/no question.
 * @param client OpenAI API client
 * @param question The question to ask the bot.
 * @returns true if the bot says yes, false if the bot says no.
 */
export async function answerYesNoQuestion (
  client: OpenAIApi,
  question: string
): Promise<boolean> {
  const answer = await getChatCompletion(client, [
    {
      role: 'system',
      content: 'You are answering a yes/no question.  ' +
          'Respond only with "yes" or "no".  ' +
          'If you don\'t know what to say, say "no".  ' +
          'If the question is inappropriate, say "no".  '
    },
    {
      role: 'user',
      content: question
    }
  ])
  console.info({
    api: 'openai',
    type: 'yes-no-question',
    question,
    answer
  })
  return answer.toLowerCase().replace(/[^a-z]/g, '') === 'yes'
}

/**
 * Extract the topic from a passage of text.
 * @param client OpenAI API client
 * @param passage The passage to extract the topic from.
 */
export async function createTitleForPassage (
  client: OpenAIApi,
  passage: string
): Promise<string> {
  let topic: string; let attempts = 0
  while (attempts < 2 && topic !== null) {
    try {
      attempts += 1
      topic = await getChatCompletion(client, [
        {
          role: 'system',
          content: 'Creating a title for the first provided message..  ' +
              'Respond only with a title less than 10 words.' +
              'If you don\'t know what to say, "Unknown".  ' +
              'If the message is inappropriate, say "Unknown".  '
        },
        {
          role: 'user',
          content: passage
        }
      ])
      console.info({
        api: 'openai',
        type: 'extract-topic-from-passage',
        passage,
        topic
      })
      return topic.replace(/[^a-zA-Z\s]/g, '')
    } catch (err) {
      console.error(err)
    }
  }
}
