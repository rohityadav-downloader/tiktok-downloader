interface TelegramChat {
	id: number
}

interface TelegramMessage {
	message_id: number
	chat: TelegramChat
	text: string
}

interface TelegramUpdate {
	message: TelegramMessage
}
