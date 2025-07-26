import { getVideoStream } from "./file_download.js"
import { TelegramBot } from "./message_manager.js"
import { getTikTokDownloadUrl } from "./tiktok.js"
import express from "express"

const app = express()
app.use(express.json())

const token = "7980104953:AAGkwteBiJcSngSbbllnFiQRqxeRA8SWNg8"
const bot = new TelegramBot(token)

const TIKTOK_REGEX =
	/(?:https?:\/\/)?(?:www\.)?(?:vm\.)?tiktok\.com\/[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=]*/i

app.get("/", (_, res) => {
	res.status(200).json({
		status: "TikTok Downloader API",
		version: "2.0.0",
	})
})

app.post("/", async (req, res) => {
	res.status(200).end()

	const message = req.body?.message
	if (!message?.text || !message?.chat?.id) return

	const tiktokLink = message.text.trim()
	const userId = message.chat.id

	if (!TIKTOK_REGEX.test(tiktokLink)) {
		bot.sendMessage(userId, "❌ Please provide a valid TikTok link.")
		return
	}

	processDownloadRequest(userId, tiktokLink).catch(() => {
		bot.sendMessage(userId, "❌ An error occurred. Please try again.")
	})
})

async function processDownloadRequest(userId, tiktokLink) {
	let statusMessageId

	try {
		statusMessageId = await bot.sendMessage(
			userId,
			"🔍 Processing TikTok link..."
		)

		const downloadUrlPromise = getTikTokDownloadUrl(tiktokLink)

		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error("Timeout")), 10000)
		)

		const downloadUrl = await Promise.race([downloadUrlPromise, timeoutPromise])

		await bot.editMessage(userId, statusMessageId, "📤 Streaming video...")

		const videoStream = await getVideoStream(downloadUrl)
		await bot.sendVideo(userId, videoStream)

		await bot.deleteMessage(userId, statusMessageId)
	} catch (error) {
		if (statusMessageId) {
			await bot.editMessage(
				userId,
				statusMessageId,
				"❌ Download failed. Please try another link."
			)
			setTimeout(() => bot.deleteMessage(userId, statusMessageId), 5000)
		} else {
			await bot.sendMessage(
				userId,
				"❌ Download failed. Please try another link."
			)
		}
	}
}

app.listen(3000, () => {
	process.stdout.write("TikTok Downloader running on port 3000\n")
})

process.on("SIGTERM", () => {
	process.exit(0)
})
