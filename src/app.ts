import {ChefWoof} from "./dakotas-bots/ChefWoof";
import {ProfessorWoof} from "./dakotas-bots/ProfessorWoof";
require('dotenv').config()

new ChefWoof(process.env.OPENAI_API_KEY, process.env.DISCORD_TOKEN_CHEF_WOOF,  process.env.WOOFS_KITCHEN_CHAT)
const professor = new ProfessorWoof(process.env.OPENAI_API_KEY, process.env.DISCORD_TOKEN_DAKOTAS_BOT,  process.env.WOOFS_CLASSROOM_CHAT)
professor.scheduleQuestion("SQL", Math.floor(Math.random()*6 + 5).toString(), 6 * 60 * 60 * 1000) // 6 hours in milliseconds