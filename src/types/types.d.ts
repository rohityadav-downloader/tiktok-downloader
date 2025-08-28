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

interface InstagramDownloadUrl {
	url: string
	name: string
	type: string
	ext: string
}

interface InstagramApiResponse {
	url: InstagramDownloadUrl[]
	meta: {
		title: string
		source: string
		shortcode: string
		like_count: number
		comment_count: number
		taken_at: number
		username: string
	}
	thumb: string
	hosting: string
	timestamp: number
}
