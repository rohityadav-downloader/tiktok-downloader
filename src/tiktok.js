import * as cheerio from 'cheerio';
const endpoints = 'https://tiktokio.com/api/v1/tk-htmx';
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
};
export default async function download_url(video_url) {
    const formData = new URLSearchParams({
        prefix: 'dtGslxrcdcG9raW8uY29t',
        vid: video_url,
    });
    try {
        const res = await fetch(endpoints, {
            method: 'POST',
            headers,
            body: formData.toString(),
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const urls = $('.tk-down-link a').toArray();
        return urls[0].attribs.href;
    }
    catch (err) {
        throw err;
    }
}
