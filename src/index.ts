import { TgService } from "./tgClient/TgService";
import { combineMessagesByChannels, combineMessagesForDifferentChannels, getAllChannelsByNames, getInitialMessage, getMessagesData, IChannelMessageSummaryData } from "./tgClient/tgUtils";
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

    const combinedMessages: string[] = [getInitialMessage()];

    for (const channel of filteredChannels) {
        // const file = await tgService.getPhoto(channel);
        // const channelPhotoPath = saveChannelPhoto(file, imagesFolderName);

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
        combinedMessages.push(...combineMessagesByChannels(channelMessagesToPost));
    }

    for (const message of combineMessagesForDifferentChannels(combinedMessages)) {
        await tgService.sendMessage(message);
        console.log(`Posted combined message:\n${message}`);
    }

    await tgService.disconnect();
}

main();