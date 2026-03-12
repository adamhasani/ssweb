const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Cuma nerima POST bos');
    const { url } = req.body;
    if (!url) return res.status(400).send('Linknya mana?');

    try {
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1920, height: 1080 }, // Mode laptop 1080p
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        
        const page = await browser.newPage();
        
        // Cuma nunggu struktur web muncul, maksimal 8 detik biar Vercel gak ngamuk
        await page.goto(url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 8000 
        });
        
        const screenshot = await page.screenshot({ encoding: 'base64' });
        await browser.close();

        res.status(200).json({ image: `data:image/png;base64,${screenshot}` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Vercel ngos-ngosan atau webnya keberatan, gagal jepret.');
    }
}
