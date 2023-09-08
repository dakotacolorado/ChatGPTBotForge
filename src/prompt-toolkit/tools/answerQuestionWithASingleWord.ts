import { type PromptClient } from '../PromptClient'

/**
 * Answer a question with a single word of length wordLength.
 * @param promptClient
 * @param question The question to answer.
 * @param wordLength The length of the word to answer with.
 * @returns The word the bot answers with.
 */
export const answerQuestionWithASingleWord = async (promptClient: PromptClient, question: string, wordLength: number): Promise<string> => {
  const topic = await promptClient.getChatCompletion([
    {
      role: 'system',
      content:
                `Answer this question with a single lowercase word of length ${wordLength}.  
If you don't know what to say, "Unknown".
If the message is inappropriate, say "Unknown".`
    },
    {
      role: 'user',
      content: question
    }
  ]).then(t => t.replace(/[^a-zA-Z\s]/g, ''))

  console.info({
    api: 'openai',
    type: 'answer-question-with-single-word',
    question,
    topic
  })
  return topic
}
