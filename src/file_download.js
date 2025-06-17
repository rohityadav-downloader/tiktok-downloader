import axios from 'axios';
import fs from 'fs';

import { pipeline } from 'stream/promises';

export default async function download_file(url, filename) {
    const response = await axios.get(url, { responseType: 'stream' });
    await pipeline(response.data, fs.createWriteStream(filename));
}

