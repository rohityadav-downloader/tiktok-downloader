import fs from 'fs';
import { pipeline } from 'stream/promises';
export default async function download(url, filename) {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to download. Status: ${response.status}`);
    }
    await pipeline(response.body, fs.createWriteStream(filename));
}
