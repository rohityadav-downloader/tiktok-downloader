const API_BASE = "https://api.telegram.org/bot"

export class TelegramBot {
	private baseUrl: string

	constructor(token: string) {
		this.baseUrl = `${API_BASE}${token}`
	}

	async send_message(chatId: string | number, text: string): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/sendMessage`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chat_id: chatId,
					text: text,
				}),
			})

			const data = (await response.json()) as { result: { message_id: number } }
			return data.result.message_id
		} catch (error) {
			throw new Error(`Send message failed: ${(error as Error).message}`)
		}
	}

	async send_video(chatId: string | number, link: string): Promise<void> {
		const form_data = new FormData()
		form_data.append("chat_id", chatId)
		form_data.append("video", link)

		try {
			const response = await fetch(`${this.baseUrl}/sendVideo`, {
				method: "POST",
				body: form_data,
			})

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}
		} catch (error) {
			throw new Error(`Send video failed: ${(error as Error).message}`)
		}
	}
}
