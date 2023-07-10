import {ChefWoof} from "./dakotas-bots/ChefWoof";
require('dotenv').config()

new ChefWoof(process.env.OPENAI_API_KEY, process.env.DISCORD_TOKEN_CHEF_WOOF,  process.env.WOOFS_KITCHEN_CHAT)
new ChefWoof(process.env.OPENAI_API_KEY, process.env.DISCORD_TOKEN_DAKOTAS_BOT,  process.env.DEV_CHAT)