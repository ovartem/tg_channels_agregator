import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export function createFolderIfNotCreated(folderName: string): void {
    const photoDir = join(__dirname, folderName);
    if (!existsSync(photoDir)) {
        mkdirSync(photoDir);
    }
}

export function saveChannelPhoto(file: Buffer | string, folderName: string): string {
    const channelPhotoPath = join(__dirname, folderName, `channel_photo_${Date.now()}.jpg`);
    writeFileSync(channelPhotoPath, file);

    return channelPhotoPath;
}