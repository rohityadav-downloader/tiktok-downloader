const HREF_REGEX = /<a[^>]+href="([^"]+)"/i

const HEADERS = {
	"Content-Type": "application/x-www-form-urlencoded",
} as const

export async function get_download_url(url: string): Promise<string> {
	const body = `q=${encodeURIComponent(url)}`

	const response = await fetch("https://savetik.co/api/ajaxSearch", {
		method: "POST",
		headers: HEADERS,
		body,
	})

	const { data } = (await response.json()) as { status: number; data: string }

	const match = HREF_REGEX.exec(data)

	if (match?.[1]) {
		return match[1]
	}

	throw new Error("No download URL found in response")
}
