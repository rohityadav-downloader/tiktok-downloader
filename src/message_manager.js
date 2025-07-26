import { promises as fs } from "fs"
import FormData from "form-data"
import { Agent, request } from "undici"

const telegramAgent = new Agent({
	connections: 1,
	pipelining: 1,
	keepAliveTimeout: 30000,
	keepAliveMaxTimeout: 60000,
	headersTimeout: 5000,
	bodyTimeout: 30000,
})

const API_BASE = "https://api.telegram.org/bot"
const COMMON_HEADERS = {
	"Content-Type": "application/json",
	Accept: "application/json",
	"Accept-Encoding": "gzip, deflate, br",
	Connection: "keep-alive",
	"User-Agent": "TikTok-Bot/2.0",
}

export class TelegramBot {
	constructor(token) {
		this.token = token
		this.baseUrl = `${API_BASE}${token}`
	}

	async sendMessage(chatId, text, options = {}) {
		const payload = {
			chat_id: chatId,
			text: text,
			parse_mode: options.parseMode || "HTML",
			disable_web_page_preview: true,
			...options,
		}

		try {
			const { statusCode, body } = await request(
				`${this.baseUrl}/sendMessage`,
				{
					method: "POST",
					headers: COMMON_HEADERS,
					body: JSON.stringify(payload),
					dispatcher: telegramAgent,
				}
			)
			if (statusCode !== 200) {
				throw new Error(`HTTP ${statusCode}`)
			}
			const response = await body.json()

			return response.result?.message_id
		} catch (error) {
			throw new Error(`Send message failed: ${error.message}`)
		}
	}

	async editMessage(chatId, messageId, text, options = {}) {
		const payload = {
			chat_id: chatId,
			message_id: messageId,
			text: text,
			parse_mode: options.parseMode || "HTML",
			...options,
		}

		try {
			await request(`${this.baseUrl}/editMessageText`, {
				method: "POST",
				headers: COMMON_HEADERS,
				body: JSON.stringify(payload),
				dispatcher: telegramAgent,
			})
		} catch {}
	}

	async deleteMessage(chatId, messageId) {
		try {
			await request(`${this.baseUrl}/deleteMessage`, {
				method: "POST",
				headers: COMMON_HEADERS,
				body: JSON.stringify({
					chat_id: chatId,
					message_id: messageId,
				}),
				dispatcher: telegramAgent,
			})
		} catch {}
	}

	async sendVideo(chatId, videoStream, filename = "video.mp4") {
		try {
			const formData = new FormData()
			formData.append("chat_id", chatId.toString())
			formData.append("video", videoStream, {
				filename: filename,
				contentType: "video/mp4",
			})

			const { statusCode } = await request(`${this.baseUrl}/sendVideo`, {
				method: "POST",
				body: formData,
				headers: formData.getHeaders(),
				dispatcher: telegramAgent,
			})

			if (statusCode !== 200) {
				throw new Error(`HTTP ${statusCode}`)
			}
		} catch (error) {
			throw new Error(`Send video failed: ${error.message}`)
		}
	}

	async cleanupFile(filename) {
		try {
			await fs.unlink(filename)
		} catch {}
	}
}

process.on("exit", () => {
	telegramAgent.destroy()
})
