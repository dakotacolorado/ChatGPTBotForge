import { answerYesNoQuestion } from './tools/answerYesNoQuestion'
import { type OpenAIApi } from 'openai'
import { PromptClient } from './PromptClient'
import { createTitleForPassage } from './tools/createTitleForPassage'
import { answerQuestionWithASingleWord } from './tools/answerQuestionWithASingleWord'

export class PromptToolkit {
  readonly promptClient: PromptClient

  constructor (openAIClient: OpenAIApi) {
    this.promptClient = new PromptClient(openAIClient)
  }

  async answerYesNoQuestion (question: string): Promise<boolean> {
    return await answerYesNoQuestion(this.promptClient, question)
  }

  async createTitleForPassage (passage: string): Promise<boolean> {
    return await createTitleForPassage(this.promptClient, passage)
  }

  async answerQuestionWithASingleWord (question: string, wordLength: number): Promise<boolean> {
    return await answerQuestionWithASingleWord(this.promptClient, question, wordLength)
  }
}
