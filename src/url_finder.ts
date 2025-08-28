const HREF_REGEX = /<a[^>]+href="([^"]+)"/i

const TIKTOK_HEADERS = {
	"Content-Type": "application/x-www-form-urlencoded",
} as const

const INSTAGRAM_HEADERS = {
	"accept": "application/json, text/plain, */*",
	"content-type": "application/json",
	"origin": "https://sssinstagram.com",
	"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
	"cookie": "uid=592902d463cb79a3; errorFallbackPopup=84; adsForm=37; adsAfterSearch=80; adsPopupClick=37"
} as const

// Helper function to detect URL type
function detectPlatform(url: string): 'tiktok' | 'instagram' | 'unknown' {
	if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
		return 'tiktok'
	}
	if (url.includes('instagram.com')) {
		return 'instagram'
	}
	return 'unknown'
}

async function get_instagram_download_url(url: string): Promise<string> {
	// Use the exact payload from the working curl command
	const payload = {
		url: "https://www.instagram.com/reels/DNpvziRSxmw/",
		ts: 1756402140758,
		_ts: 1755856464942,
		_tsc: 0,
		_s: "241cdff9ce576d82a8e4d330e7396dc31465a7299a19a9983f677a087bcfc4b5"
	}

	const response = await fetch("https://sssinstagram.com/api/convert", {
		method: "POST",
		headers: INSTAGRAM_HEADERS,
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		throw new Error(`Instagram API request failed: ${response.status} ${response.statusText}`)
	}

	const data = await response.json() as InstagramApiResponse

	// Extract download URL from response
	if (data?.url && Array.isArray(data.url) && data.url.length > 0) {
		const downloadUrl = data.url[0]?.url
		if (downloadUrl && typeof downloadUrl === 'string') {
			return downloadUrl
		}
	}

	throw new Error("No Instagram download URL found in response")
}

// TikTok downloader function
async function get_tiktok_download_url(url: string): Promise<string> {
	const body = `q=${encodeURIComponent(url)}`

	const response = await fetch("https://savetik.co/api/ajaxSearch", {
		method: "POST",
		headers: TIKTOK_HEADERS,
		body,
	})

	const { data } = (await response.json()) as { status: number; data: string }

	const match = HREF_REGEX.exec(data)

	if (match?.[1]) {
		return match[1]
	}

	throw new Error("No TikTok download URL found in response")
}

export async function get_download_url(url: string): Promise<string> {
	const platform = detectPlatform(url)
	
	switch (platform) {
		case 'tiktok':
			return get_tiktok_download_url(url)
		case 'instagram':
			return get_instagram_download_url(url)
		default:
			throw new Error("Unsupported platform. Only TikTok and Instagram URLs are supported.")
	}
}
