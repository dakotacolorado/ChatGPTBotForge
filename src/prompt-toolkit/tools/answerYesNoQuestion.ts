import { type PromptClient } from '../PromptClient'

export const answerYesNoQuestion = async (promptClient: PromptClient, question: string): Promise<boolean> => {
  const answer = await promptClient.getChatCompletion([
    {
      role: 'system',
      content:
                `You are answering a yes/no question.
Strictly respond with only "yes" or "no".  
Add no other text to your response.`
    },
    {
      role: 'user',
      content: question
    }
  ])
  console.log({
    api: 'openai',
    type: 'yes-no-question',
    question,
    answer
  })
  return answer.toLowerCase().replace(/[^a-z]/g, '') === 'yes'
}
