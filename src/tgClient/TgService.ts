import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { TotalList } from "telegram/Helpers";
import { Dialog } from "telegram/tl/custom/dialog";
import { Entity } from "telegram/define";
import { config } from "../../config";
const input = require("input");

export class TgService {
    client: TelegramClient;
    constructor() {
        const stringSession = new StringSession(config.tgSessionString);
        this.client = new TelegramClient(stringSession, config.tgApiId, config.tgApiHash, {
            connectionRetries: 5,
        });
    }

    /**
     * Necessary to run this locally to get TG_SESSION_STRING
     */
    async clientStart(): Promise<void> {
        await this.client.start({
            phoneNumber: async () => await input.text("Please enter your phone number: "),
            password: async () => await input.text("Please enter your password: "),
            phoneCode: async () => await input.text("Please enter the code you received: "),
            onError: (err) => console.error(err),
        });
        console.log("You should now be connected.");
        console.log("TG_SESSION_STRING:")
        console.log(this.client.session.save()); // Save this string to avoid logging in again
        await this.client.sendMessage("me", { message: "Hello!" });
    }

    /**
     * Use this method when TG_SESSION_STRING is 
     */
    async connect(): Promise<void> {
        await this.client.connect();

        console.log("Client connected!");
    }

    async disconnect(): Promise<void> {
        await this.client.disconnect();
        console.log('Client disconnected!');
    }

    async getEntity(entityLike: Entity): Promise<Entity> {
        const entity = await this.client.getEntity(entityLike);
        return entity;
    }

    async getDialogs(): Promise<TotalList<Dialog>> {
        const dialogs = await this.client.getDialogs({});
        return dialogs;
    }

    async getPhoto(entity: Dialog): Promise<Buffer | string> {
        const photoData = await this.client.downloadProfilePhoto(entity as any, {
            isBig: false,
        });
        return photoData as Buffer | string;
    }

    async getChannelMessagesFromDate(channel: Dialog, startDate: Date): Promise<TotalList<Api.Message>> {
        const messages = await this.client.getMessages(channel as any, {
            limit: 30,
        });
        console.log('Messages retrived successfully');
        const filteredMessages = messages.filter(message => {
            const sentDuringPeriod = message.date > Math.floor(startDate.getTime() / 1000);
            return sentDuringPeriod;
        });
        return filteredMessages;
    }

    async getChannelUnreadMessages(channel: Dialog): Promise<TotalList<Api.Message>> {
        const messages = await this.client.getMessages(channel as any, {
            limit: channel.unreadCount,
        });
        return messages;
    }

    async sendMessage(message: string): Promise<void> {
        await this.client.sendMessage(config.channelName, { message, parseMode: "html", linkPreview: false });
        console.log(`Posted combined message:\n${message}`);
    }

    async sendFile(message: string, imagePath: string): Promise<void> {
        await this.client.sendFile(config.channelName, { caption: message, parseMode: "html", file: imagePath, forceDocument: false });
        console.log(`Posted combined message and image:\n${message}`);
    }
}