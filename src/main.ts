import { createServer, IncomingMessage, ServerResponse } from "http"
import { TelegramBot } from "./telegram.js"
import { get_download_url } from "./url_finder.js"

const bot = new TelegramBot("7980104953:AAGkwteBiJcSngSbbllnFiQRqxeRA8SWNg8")

async function handleRequest(
	req: IncomingMessage,
	res: ServerResponse
): Promise<void> {
	const url = req.url || "/"
	const method = req.method || "GET"

	switch (url) {
		case "/":
			res.writeHead(200, { "Content-Type": "application/json" })
			res.end(
				JSON.stringify({
					status: "ok",
					service: "running",
				})
			)
			break

		case "/webhook":
			if (method === "POST") {
				res.writeHead(200)
				res.end()
				let body: TelegramUpdate | null = null
				try {
					body = (await getRequestBody(req)) as TelegramUpdate
					const user_id = body.message.chat.id
					bot.send_message(user_id, "Searching for video...")
					const messageText = body.message.text
					const download_link = await get_download_url(messageText)
					await bot.send_video(user_id, download_link)
				} catch (error) {
					if (body?.message?.chat?.id) {
						try {
							const errorMsg = error instanceof Error ? error.message : "Failed to download video"
							await bot.send_message(body.message.chat.id, `Error: ${errorMsg}`)
						} catch {
						}
					}
				}
			} else {
				res.writeHead(405)
				res.end("Method Not Allowed")
			}
			break

		default:
			res.writeHead(404, { "Content-Type": "text/plain" })
			res.end("Not Found")
	}
}

function getRequestBody(req: IncomingMessage): Promise<any> {
	return new Promise((resolve, reject) => {
		let body = ""
		req.on("data", (chunk) => {
			body += chunk
		})
		req.on("end", () => {
			try {
				resolve(JSON.parse(body))
			} catch (e) {
				reject(e)
			}
		})
		req.on("error", reject)
	})
}

const server = createServer(handleRequest)
server.listen(3000, () => {
	console.log(`Server running on http://localhost:3000`)
})
