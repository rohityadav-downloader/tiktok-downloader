const HREF_REGEX = /<a[^>]+href="([^"]+)"/i

const TIKTOK_HEADERS = {
	"Content-Type": "application/x-www-form-urlencoded",
} as const

const INSTAGRAM_HEADERS = {
	"Content-Type": "application/json",
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

// Instagram downloader function
async function get_instagram_download_url(url: string): Promise<string> {
	const timestamp = Date.now()
	// Generate a session-like timestamp that's slightly older
	const sessionTimestamp = timestamp - Math.floor(Math.random() * 1000000) - 500000
	
	const payload = {
		url: url,
		ts: timestamp,
		_ts: sessionTimestamp,
		_tsc: 0,
		_s: "1e6fc3d4d691a221302e967f29540aed25374d4f3b973adae71330079b907b6b"
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
