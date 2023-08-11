import {Configuration, OpenAIApi} from "openai";
import QueryBot from "../../src/chat-gpt/QueryBot";

describe(
    'PlainChatBot', () => {

        let chatBot;
        beforeAll(() => {
            console.log("API key ", process.env.OPENAI_API_KEY)
            chatBot = new QueryBot(new OpenAIApi(new Configuration({apiKey: process.env.OPENAI_API_KEY})))
        })

        describe('getChatCompletion', () => {
                it('should fail for too large of a request', async () => {
                        const CONTENT_LENGTH =  10**5;
                        await expect(async () => await chatBot.getChatCompletion([{
                            role: "system",
                            content: Array(CONTENT_LENGTH).fill('0').join(''),
                        }])).rejects.toThrow('Request to GPT is too long.');
                    })
                it('should fail for an empty request', async () => {
                        await expect(
                            async () => await chatBot.getChatCompletion([])
                        ).rejects.toThrow('Request to GPT is empty');
                    })
            }
        )

        describe('answerYesNoQuestion', () => {
                [
                    // test common knowledge
                    {
                        q: "Is the sky blue?",
                        a: true
                    },
                    {
                        q: "Is up the same as down?",
                        a: false
                    },
                    // test vocabulary
                    {
                        q: "Is shit a bad word?",
                        a: true
                    },
                    {
                        q: "Is ass a bad word?",
                        a: false
                    },
                    {
                        q: "Is awesome a synonym for great?",
                        a: true
                    },
                    {
                        q: "Is sad an antonym for happy?",
                        a: true
                    },
                    // test basic math
                    {
                        q: "Is the following statement true? x^2 + y^2 + 2*x*y + 1 = (x+1) * (y+1)",
                        a: true
                    },
                    // test comprehension
                    {
                        q: "Is the following sentence about dogs? 'I hate cats.'",
                        a: false
                    },
                    {
                        q:
`Can we assume that Glass met David Bowie from the following passage?
Reviving the practice of using elements of popular music in classical composition, an approach
that had been in hibernation in the United States during the 1960s, composer Philip Glass (born
1937) embraced the ethos of popular music in his compositions. Glass based two symphonies
on music by rock musicians David Bowie and Brian Eno, but the symphonies' sound is
distinctively his. Popular elements do not appear out of place in Glass's classical music, which
from its early days has shared certain harmonies and rhythms with rock music. Yet this use of
popular elements has not made Glass a composer of popular music. His music is not a version
of popular music packaged to attract classical listeners; it is high art for listeners steeped in
rock rather than the classics`,
                        a: true
                    },
                ].forEach( qa => {
                    it(`${qa.q} => ${qa.a ? 'yes' : 'no'}`, async () => {
                        await expect(chatBot.answerYesNoQuestion(qa.q)).resolves.toBe(qa.a)
                    })}
                )
            }
        )

        describe('createTitleForPassage', () => {
                [
                    {
                        t: [
                            'Reviving Pop for Classical Glasss Approach',
                            'Glass RockInfluenced High Art Composer',
                            'Glass blurs rock and classical genres',
                            'Philip Glass Rock Music in Classical Composition',
                            'Philip Glass Classical Music with Pop Elements',
                            'Philip Glass and Pop Music in Classical Composition'
                        ],
                        p:
`Reviving the practice of using elements of popular music in classical composition, an approach
that had been in hibernation in the United States during the 1960s, composer Philip Glass (born
1937) embraced the ethos of popular music in his compositions. Glass based two symphonies
on music by rock musicians David Bowie and Brian Eno, but the symphonies' sound is
distinctively his. Popular elements do not appear out of place in Glass's classical music, which
from its early days has shared certain harmonies and rhythms with rock music. Yet this use of
popular elements has not made Glass a composer of popular music. His music is not a version
of popular music packaged to attract classical listeners; it is high art for listeners steeped in
rock rather than the classics`
                    },
                ].forEach( tp => {
                    it(tp.t[0], async () => {
                        await expect(chatBot.answerYesNoQuestion(
`Is the title '${await chatBot.createTitleForPassage(tp.p)}' similar to any of the titles '${tp.t.join('\', \'')}'`
                        )).resolves.toBe(true)
                    })}
                )
            }
        )
    }
)