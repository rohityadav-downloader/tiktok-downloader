import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
export async function send_message(botToken, userId, messageText) {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: userId,
                text: messageText,
            }),
        });
        const data = (await response.json());
        let msg_id = data.result.message_id;
        return msg_id;
    }
    catch (error) {
        throw new Error(`Failed to send message: ${error.message}`);
    }
}
export async function delete_message(botToken, chatId, messageIds) {
    const deletePromises = messageIds.map((id) => fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: id,
        }),
    }).catch((error) => {
        throw new Error(`Failed to delete message ${id}:`, error.message);
    }));
    await Promise.all(deletePromises);
}
export async function send_video(botToken, chatId) {
    try {
        const formData = new FormData();
        formData.append('chat_id', chatId.toString());
        formData.append('video', fs.createReadStream('download.mp4'));
        await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        });
        await fs.promises.unlink('download.mp4');
    }
    catch (error) {
        throw new Error(`Failed to send video: ${error.message}`);
    }
}
export function keepTyping(botToken, chatId) {
    const interval = setInterval(() => {
        fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                action: 'upload_video',
            }),
        }).catch((error) => {
            throw new Error(`Failed to send typing action: ${error.message}`);
        });
    }, 4000);
    return () => clearInterval(interval);
}
