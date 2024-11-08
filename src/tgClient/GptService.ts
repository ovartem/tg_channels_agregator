import axios from "axios";
import { config } from "../../config";

export async function gptGetMessageSummary(message: string): Promise<string> {
    const prompt = `Напиши коротке резюме (1-2) речення для наступного повідомлення: "${message}". Не переписуй текст, а коротко опиши основну думку чи висновок. Якщо повідомлення порожнє або гумористичним, поверни порожній рядок без додаткових пояснень.`;
    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
        },
        {
            headers: {
                "Authorization": `Bearer ${config.gptApiKey}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.choices[0].message.content.trim();
}