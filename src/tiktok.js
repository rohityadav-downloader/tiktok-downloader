import { load } from "cheerio"
import { Agent, request } from "undici"

const agent = new Agent({
	connections: 2,
	pipelining: 1,
	keepAliveTimeout: 30000,
	keepAliveMaxTimeout: 60000,
	headersTimeout: 5000,
	bodyTimeout: 8000,
})

const ENDPOINT = "https://tiktokio.com/api/v1/tk-htmx"
const REQUEST_HEADERS = {
	"Content-Type": "application/x-www-form-urlencoded",
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	"Accept-Language": "en-US,en;q=0.5",
	"Accept-Encoding": "identity",
	Connection: "keep-alive",
	"Upgrade-Insecure-Requests": "1",
}

const urlCache = new Map()
const MAX_CACHE_SIZE = 100

function addToCache(key, value) {
	if (urlCache.size >= MAX_CACHE_SIZE) {
		const firstKey = urlCache.keys().next().value
		urlCache.delete(firstKey)
	}
	urlCache.set(key, value)
}

export async function getTikTokDownloadUrl(videoUrl) {
	const cacheKey = videoUrl.split("?")[0]
	if (urlCache.has(cacheKey)) {
		return urlCache.get(cacheKey)
	}

	const formData = new URLSearchParams({
		prefix: "dtGslxrcdcG9raW8uY29t",
		vid: videoUrl,
	})

	try {
		const { statusCode, body } = await request(ENDPOINT, {
			method: "POST",
			headers: REQUEST_HEADERS,
			body: formData.toString(),
			dispatcher: agent,
		})

		if (statusCode !== 200) {
			throw new Error(`HTTP ${statusCode}`)
		}

		let html = ""
		for await (const chunk of body) {
			html += chunk.toString()
		}

		const $ = load(html, {
			xml: false,
			decodeEntities: false,
			lowerCaseAttributeNames: false,
		})

		let downloadUrl = null

		const downloadLink = $(".tk-down-link a")[0]
		if (downloadLink?.attribs?.href) {
			downloadUrl = downloadLink.attribs.href
		}

		if (!downloadUrl) {
			const fallbackSelectors = [
				"a[download]",
				"a[href*='.mp4']",
				"a[href*='download']",
				"a[href*='video']",
			]

			for (const selector of fallbackSelectors) {
				const link = $(selector)[0]
				if (link?.attribs?.href) {
					downloadUrl = link.attribs.href
					break
				}
			}
		}

		if (!downloadUrl) {
			throw new Error("Download link not found")
		}

		addToCache(cacheKey, downloadUrl)
		return downloadUrl
	} catch (error) {
		throw new Error(`Failed to get download URL: ${error.message}`)
	}
}

process.on("exit", () => {
	agent.destroy()
})
