import axios from 'axios';

export default function keepTyping(botToken, chatId) {
    const interval = setInterval(() => {
        axios.post(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
            chat_id: chatId,
            action: 'upload_video'
        });
    }, 4000);

    return () => clearInterval(interval);
}