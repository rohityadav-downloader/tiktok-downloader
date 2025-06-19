import download from './file_download.js';
import { delete_message, keepTyping, send_message, send_video, } from './message_manager.js';
import download_url from './tiktok.js';
import express from 'express';
const app = express();
app.use(express.json());
const token = '7980104953:AAGkwteBiJcSngSbbllnFiQRqxeRA8SWNg8';
app.get('/', (_, res) => {
    res.send('Hello, World!');
});
app.post('/', async (req, res) => {
    const tiktok_link = req.body.message.text;
    const user_id = req.body.message.chat.id;
    if (!tiktok_link || !tiktok_link.includes('tiktok.com')) {
        send_message(token, user_id, 'Please provide a valid TikTok link.');
        res.sendStatus(200);
        return;
    }
    let id1 = await send_message(token, user_id, 'Getting Link...');
    let url = await download_url(tiktok_link);
    let id2 = await send_message(token, user_id, 'Link Found...');
    let id3 = await send_message(token, user_id, 'Downloading Video...');
    await download(url, 'download.mp4');
    let stop_typing = keepTyping(token, user_id);
    let id4 = await send_message(token, user_id, 'Download complete! Sending...');
    await send_video(token, user_id);
    await delete_message(token, user_id, [id1, id2, id3, id4]);
    stop_typing();
    res.sendStatus(200);
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
