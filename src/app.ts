import {
  DEV_CHAT,
  DISCORD_TOKEN, DISCORD_TOKEN_CHEF_WOOF,
  OPENAI_API_KEY, WOOFS_KITCHEN_CHAT
} from '../config/dev'

import { startWoofsKitchenApp } from './woofs-kitchen/woofs-kitchen-app'

startWoofsKitchenApp(DISCORD_TOKEN_CHEF_WOOF, OPENAI_API_KEY, WOOFS_KITCHEN_CHAT)

startWoofsKitchenApp(DISCORD_TOKEN, OPENAI_API_KEY, DEV_CHAT)
