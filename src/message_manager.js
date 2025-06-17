import axios from 'axios';

export async function send_message(botToken, userId, messageText) {
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: userId,
            text: messageText,
        });
        return response.data.result.message_id;

    } catch (error) {
        console.error('Error sending message:', error?.response?.data || error.message);
    }
}

export async function delete_message(botToken, chatId, messageIds) {
    const deletePromises = messageIds.map(id =>
        axios.post(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
            chat_id: chatId,
            message_id: id,
        }).catch(error => {
            console.error(`Failed to delete message ${id}:`, error?.response?.data || error.message);
        })
    );
    await Promise.all(deletePromises);
}
