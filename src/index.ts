import { TgService } from "./tgClient/TgService";
import { combineMessages, getAllChannelsByNames, getInitialMessage, getMessagesData, IChannelMessageSummaryData } from "./tgClient/tgUtils";
import { gptGetMessageSummary } from "./tgClient/GptService";
import { config } from "../config";
import { createFolderIfNotCreated, saveChannelPhoto } from "./imageUtils/imageUtils";
import { channelsNames } from "../channelsList";

const startDate = new Date();
startDate.setDate(startDate.getDate() - config.daysToParse);

async function main() {
    const imagesFolderName = "channelPhoto";
    createFolderIfNotCreated(imagesFolderName);

    // Connect to Telegram
    const tgService = new TgService();
    await tgService.connect();

    const channels = await tgService.getDialogs();

    const filteredChannels = getAllChannelsByNames(channels, channelsNames);

    // Send initial message to the channel
    const initialMessage = getInitialMessage();
    await tgService.sendMessage(initialMessage);

    for (const channel of filteredChannels) {
        const file = await tgService.getPhoto(channel);
        const channelPhotoPath = saveChannelPhoto(file, imagesFolderName);

        const messages = await tgService.getChannelMessagesFromDate(channel, startDate);
        if (messages.length === 0) { continue; }
        // TODO: add forwarding info
        const channelMessagesToPost: IChannelMessageSummaryData[] = [];
        const messagesData = getMessagesData(channel, messages);
        for (const messageData of messagesData) {
            const summarisedTxt = await gptGetMessageSummary(messageData.messageOriginalTxt);
            channelMessagesToPost.push({
                channelName: messageData.channelName,
                summary: summarisedTxt,
                link: messageData.messageLink,
            });
        }
        const combinedMessages = combineMessages(channelMessagesToPost);
        for (const message of combinedMessages) {
            await tgService.sendFile(message, channelPhotoPath);
            console.log(`Posted combined message:\n${message}`);
        }
    }

    await tgService.disconnect();
}

main();