import 'dotenv/config'

export const config = {
    tgApiId: Number(process.env.TG_API_ID),
    tgApiHash: process.env.TG_API_HASH as string,
    tgSessionString: process.env.TG_SESSION_STRING ?? '',
    gptApiKey: process.env.GPT_API_KEY,
    daysToParse: Number(process.env.DAYS_TO_PARSE),
    channelName: process.env.CHANNEL_NAME ?? 'me',
}