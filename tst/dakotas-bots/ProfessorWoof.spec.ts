import {CodingAssistant} from "../../src/dakotas-bots/CodingAssistant";
import {ProfessorWoof} from "../../src/dakotas-bots/ProfessorWoof";

describe(
    'ProfessorWoof', () => {

        let bot;
        beforeAll(() => {
            bot = new ProfessorWoof(
                process.env.OPENAI_API_KEY,
                process.env.DISCORD_TOKEN_DAKOTAS_BOT,
                process.env.DEV_CHAT
            )
        })

        describe('isMessageAskingForATest', () => {
                [
                    {
                        question: "Give me a level 10 difficulty SQL question.",
                        answer: true
                    },
                    {
                        question: "Give me a level 10 difficulty SQL test.",
                        answer: true
                    }
                ].forEach( qa => {
                    it(`${qa.question} => ${qa.answer ? 'yes' : 'no'}`, async () => {
                        await expect(bot.isMessageAskingForATest(qa.question)).resolves.toBe(qa.answer)
                    })}
                )
            }
        )
    }
)