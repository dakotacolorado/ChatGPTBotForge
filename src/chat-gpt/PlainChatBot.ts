import {OpenAIApi} from "openai";
import {ChatCompletionRequestMessage} from "openai/api";

export default class PlainChatBot {
    readonly openAIClient: OpenAIApi

    /**
     * Simple chat-bot interface that uses OpenAI's GPT-3 API.
     * @param openAIClient The OpenAI API client.
     */
    constructor(openAIClient: OpenAIApi) {
        this.openAIClient = openAIClient
    }
    /**
     * Get the bot's response to the provided chat messages.
     */
    async getChatCompletion(messages: ChatCompletionRequestMessage[]): Promise<string> {
        // TODO: check the GPT API limits
        if (JSON.stringify(messages).length > 10 ** 5) {
            throw new Error(`Request to GPT is too long.`)
        }
        if (messages.length === 0) {
            throw new Error('Request to GPT is empty.')
        }

        console.debug('Sending request to OpenAI...')
        let completion;
        let attempts = 0
        const maxAttempts = 2
        while (attempts < maxAttempts && completion !== null) {
            try {
                attempts += 1
                completion = await this.openAIClient.createChatCompletion({
                    model: 'gpt-3.5-turbo-0301', messages})
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

    /**
     * Ask a yes/no question.
     * @param question The question to ask the bot.
     * @returns true if the bot says yes, false if the bot says no.
     */
    async answerYesNoQuestion (question: string): Promise<boolean> {
        const answer = await this.getChatCompletion([
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

    /**
     * Extract the topic from a passage of text.
     * @param passage The passage to extract the topic from.
     */
    async createTitleForPassage (passage: string): Promise<string> {
            const topic = await this.getChatCompletion([
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

}