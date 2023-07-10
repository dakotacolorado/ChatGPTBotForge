import {CodingAssistant} from "../../src/dakotas-bots/CodingAssistant";

describe(
    'CodingAssistant', () => {

        let codingAssistant;
        beforeAll(() => {
            codingAssistant = new CodingAssistant(
                process.env.OPENAI_API_KEY,
                process.env.DISCORD_TOKEN_DAKOTAS_BOT,
                process.env.DEV_CHAT,
                [[]]
            )
        })

        describe('isMessageAskingForFeature', () => {
                [
                    {
                        question: "Help me modify ChefWoof.ts to add a method isMessageAskingToSaveRecipe",
                        answer: true
                    }
                ].forEach( qa => {
                    it(`${qa.question} => ${qa.answer ? 'yes' : 'no'}`, async () => {
                        await expect(codingAssistant.isMessageAskingForFeature(qa.question)).resolves.toBe(qa.answer)
                    })}
                )
            }
        )
    }
)