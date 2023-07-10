import {ChefWoof} from "../../src/dakotas-bots/ChefWoof";

describe(
    'ChefWoofChatBot', () => {

        let chefWoof;
        beforeAll(() => {
            chefWoof = new ChefWoof(process.env.OPENAI_API_KEY, process.env.DISCORD_TOKEN_DAKOTAS_BOT, process.env.DEV_CHAT)
        })

        describe('isMessageAboutCooking', () => {
                [
                    // test common knowledge
                    {
                        question: "Healthy dinner recipe?",
                        answer: true
                    },
                    {
                        question: "Is up the same as down?",
                        answer: false
                    },
                    {
                        question: "",
                        answer: false
                    }
                ].forEach( qa => {
                    it(`${qa.question} => ${qa.answer ? 'yes' : 'no'}`, async () => {
                        await expect(chefWoof.isMessageAboutCooking(qa.question)).resolves.toBe(qa.answer)
                    })}
                )
            }
        )
    }
)