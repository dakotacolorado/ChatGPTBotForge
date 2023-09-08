import {PromptClient} from "../PromptClient";

/**
 * Extract the topic from a passage of text.
 * @param promptClient
 * @param passage The passage to extract the topic from.
 */
export const createTitleForPassage = async (promptClient: PromptClient, passage: string): Promise<string> => {
  const topic = await promptClient.getChatCompletion([
    {
      role: 'system',
      content:
                `Creating a title for the first provided message.  
Respond only with a title less than 10 words.
If you don't know what to say, "Unknown".
If the message is inappropriate, say "Unknown".`
    },
    {
      role: 'user',
      content: passage
    }
  ]).then(t => t.replace(/[^a-zA-Z\s]/g, ''))

  console.info({
    api: 'openai',
    type: 'extract-topic-from-passage',
    passage,
    topic
  })
  return topic
}
