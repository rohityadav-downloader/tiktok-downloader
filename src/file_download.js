import { request } from "undici"

const DOWNLOAD_HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	Accept: "video/mp4,video/*,*/*;q=0.9",
	"Accept-Encoding": "identity",
	Connection: "keep-alive",
}

export async function getVideoStream(url) {
	try {
		const { statusCode, body } = await request(url, {
			method: "GET",
			headers: DOWNLOAD_HEADERS,
		})

		if (statusCode !== 200 && statusCode !== 206) {
			throw new Error(`Download failed with status: ${statusCode}`)
		}

		return body
	} catch (error) {
		throw new Error(`Stream failed: ${error.message}`)
	}
}
