declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        DISCORD_TOKEN_DAKOTAS_BOT: string;
        DISCORD_TOKEN_CHEF_WOOF: string;
        DEV_CHAT: string;
        CODING_ASSISTANT_CHAT: string;
        TECH_SCIENCE_CODING_CHAT: string;
        WOOFS_KITCHEN_CHAT: string;
        WOOFS_CLASSROOM_CHAT: string;
        OPENAI_API_KEY: string;
        AWS_REGION: string;
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;
    }
}