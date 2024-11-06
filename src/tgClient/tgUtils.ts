import { Api } from "telegram";
import { TotalList } from "telegram/Helpers";
import { Dialog } from "telegram/tl/custom/dialog";
import { config } from "../../config";

const MAX_MESSAGE_LENGTH = 4096;

export interface IChannelMessageSummaryData {
    channelName: string;
    summary: string;
    link: string;
}

export function getAllChannelsByNames(dialogs: TotalList<Dialog>, names: string[]): TotalList<Dialog> {
    const channels = dialogs.filter((dialog) => dialog.isChannel && !dialog.isGroup && names.includes(dialog.name as string));
    return channels;
}

function getAllUnreadChannels(dialogs: TotalList<Dialog>): TotalList<Dialog> {
    const channels = dialogs.filter((dialog) => dialog.isChannel && !dialog.isGroup && dialog.unreadCount > 0);
    return channels;
}

export function getAllUnreadChannelsByNames(channels: TotalList<Dialog>, names: string[]): TotalList<Dialog> {
    const filteredChannels = getAllUnreadChannels(channels)
        .filter(channel => names.includes(channel.name as string));
    return filteredChannels;
}

export function getMessagesData(channel: Dialog, messages: TotalList<Api.Message>): {
    channelName: string,
    messageOriginalTxt: string,
    messageLink: string,
}[] {
    const messagesData = messages
        // filter out empty messages
        .filter(message => !!message.message)
        .map(message => {
            const entity = channel.entity as Api.Channel;
            const messageId = message.id;
            const channelUsername = entity.username ? entity.username : `c/${entity.id}`;

            // Generate the message link
            const messageLink = `https://t.me/${channelUsername}/${messageId}`;
            return {
                channelName: channel.name as string,
                messageOriginalTxt: message.message,
                messageLink,
            }
        });

    return messagesData;
}

export function getInitialMessage(): string {
    return `     <b>YetAnotherNews 🇺🇦:\n головне з тестування за ${config.daysToParse} дні! 👇</b>\n\n`;
}

function formatMessage(data: IChannelMessageSummaryData): string {
    return `🎯: ${data.summary}\n🔗 <a href="${data.link}">Читати детальніше</a> \n\n`;// 
}

export function combineMessages(messages: IChannelMessageSummaryData[]): string[] {
    const combinedMessages: string[] = [];
    let currentMessage = '';
    const channelName = messages.length > 0 ? messages[0].channelName : ''; // Get channel name from the first message

    // Заголовок з назвою каналу
    let channelContent = `<b>${channelName}</b>\n\n`;
    currentMessage = channelContent;
    for (const message of messages) {
        if (message.summary === '' || message.summary.includes('гумор')) {
            continue;
        }

        const formattedMessage = formatMessage(message);

        // Перевірка, щоб додавання повідомлення не перевищувало максимальну довжину
        if ((currentMessage + formattedMessage).length > MAX_MESSAGE_LENGTH) {
            // Зберігаємо поточне повідомлення і починаємо нове з назвою каналу
            combinedMessages.push(currentMessage);
            currentMessage = `${channelContent}${formattedMessage}`;
        } else {
            currentMessage += formattedMessage;
        }
    }

    // Додаємо останнє повідомлення, якщо воно не порожнє
    if (currentMessage) {
        combinedMessages.push(currentMessage);
    }

    return combinedMessages;
}


