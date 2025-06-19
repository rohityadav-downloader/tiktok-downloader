import get_download_link from "./playwright.js";
import express from 'express'
import axios from 'axios'
import * as fs from 'fs'
import download_file from "./file_download.js";
import keepTyping from "./uploading_video_action.js";
import { send_message, delete_message } from "./message_manager.js";

const app = express();
app.use(express.json());
const bot_token = process.env.BOT_TOKEN;


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/', async (req, res) => {
    const tiktok_link = req.body.message.text;
    const user_id = req.body.message.chat.id;
    let filename = 'download.mp4';

    if (!tiktok_link.includes('tiktok')) {
        send_message(bot_token, req.body.message.chat.id, 'Please send a valid TikTok link.');
        return res.sendStatus(200);
    }

    let id3 = send_message(bot_token, user_id, 'Getting download link...');

    let video_url = await get_download_link(tiktok_link);
    if (!video_url) {
        send_message(bot_token, user_id, 'Download link not found. Please try again later.');
        return res.sendStatus(200);
    }
    let id1 = await send_message(bot_token, user_id, 'Download Link Found!');
    await download_file(video_url, filename);
    let id2 = await send_message(bot_token, user_id, 'Sending video...');
    const stopTyping = keepTyping(bot_token, user_id);
    axios.post(`https://api.telegram.org/bot${bot_token}/sendVideo`, {
        chat_id: user_id,
        video: fs.createReadStream(filename),
    }, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }).then(() => {
        stopTyping();
        delete_message(bot_token, user_id, [id1, id2, id3]);
    }).catch((error) => {
        send_message(bot_token, user_id, error?.response?.data || error.message);
    }).finally(() => {
        fs.unlinkSync(filename);
    });
    res.sendStatus(200);
})

app.listen(process.env.PORT || 3000, () => console.log('Running on port ' + (process.env.PORT || 3000)));
