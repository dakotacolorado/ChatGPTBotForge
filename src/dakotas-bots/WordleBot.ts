import QueryBot from "../chat-gpt/QueryBot";
import {Website} from "../website/Website";
import ChatBot from "../chat-gpt/ChatBot";
import {range} from "discord.js";

const WORDLE_BOT_PROMPT = `
You play wordle.  
Try to win as quickly as possible.
Here are the rules for Wordle.  

"""
How To Play
Guess the Wordle in 6 tries.

Each guess must be a valid 5-letter word.

Examples
[
    '1st letter, A, absent', 
    '2nd letter, P, absent', 
    '3rd letter, P, absent', 
    '4th letter, L, correct',
    '5th letter, E, present in another position'
],

L is in the word and in the correct spot.
E is in the word but in the wrong spot.
A is not in the word in any spot.
"""

You will be provided with the wordle results as a list of arrays, as shown above.  

When asked to "Guess the first word." respond with a single lower case five letter word.  

When asked to "Guess a word" respond with a single lower case five letter word that you think is in the correct word.  
`
const WORDLE_BOT_TYPE = 'Wordle enthusiast'

const WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html"

/**
 * Interface with NYT Wordle game
 */
export class WordleBot {
    chatBot: ChatBot
    website = new Website(WORDLE_URL)

    constructor (openAIKey: string, discordToken: string, channelId: string) {
        this.chatBot = new ChatBot(openAIKey, WORDLE_BOT_PROMPT, WORDLE_BOT_TYPE);
        this.website = new Website(WORDLE_URL)
    }

    async startWordleGame() {
        await this.website.initialize()
        await this.website.click(".purr-blocker-card__button")
        // await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        await this.website.click(".Welcome-module_button__ZG0Zh")
        await this.website.click(".Modal-module_closeIcon__TcEKb")

        const guessWord = async (word: string) => {
            console.log(`Guessing word: ${word}`)
            for (const letter of word.toLowerCase().slice(0,5)) {
                await this.website.click(`.Key-module_key__kchQI[data-key="${letter}"]`)
            }
            await this.website.click(`.Key-module_key__kchQI[data-key="↵"]`);
        }

        let word = await this.chatBot.respondToMessage("Guess the first word.")
        await guessWord(word)


        const readBoard = async (website: Website) => {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            console.log("Reading board...")
            return await website.page.evaluate(() => {
                const rowElements = document.querySelectorAll('.Row-module_row__pwpBq');
                const rowsData = [];

                for (const rowElement of rowElements) {
                    const tileElements = rowElement.querySelectorAll('.Tile-module_tile__UWEHN');
                    const rowLabels = Array.from(tileElements).map(tileElement => tileElement.getAttribute('aria-label'));
                    rowsData.push(rowLabels);
                }

                return rowsData;
            });
        }

        for(const i of range(6)){
            console.log(i)
            const rows = await readBoard(this.website)
            console.log(rows)
            word = await this.chatBot.answerQuestionWithASingleWord(`Guess another word. ${rows}`, 5)
            await guessWord(word)
        }

        await this.website.close()




    }

    /**
     * Play the Wordle on a schedule and share the result to the chat.
     * @param frequency frequency to ask question (in milliseconds)
     */
    playWordleOnSchedule(frequency: number): void {
        setInterval(async () => {
            await this.playWordle()
        }, frequency)
    }
    async playWordle(){
        await this.startWordleGame()
    }





}

