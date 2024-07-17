import axios from 'axios';
import * as cheerio from 'cheerio';

export type CrawlerResult = {
    url: string;
    html: string;
    links: string[];
};

// Prevent overwhelming the server
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Clean a URL to prevent redirects and other issues
function cleanUrl(url: string, baseUrl?: string): string {
    try {
        const urlObj = baseUrl ? new URL(url, baseUrl) : new URL(url);
        urlObj.hash = ''; // Remove URL fragments
        return urlObj.href.replace(/^http:/, 'https:'); // Normalize to https
    } catch (error) {
        console.error(`Invalid URL: ${url}`);
        return '';
    }
}

export class Crawler {
    #visitedUrls = new Set<string>();

    constructor() {}

    /**
     * Crawl a URL and call a callback function with the result. This function will call itself
     * recursively on included links until the recursionDepth is 0.
     * @param url - The URL to crawl
     * @param callback - The callback function to call with the result
     * @param recursionDepth - The recursion depth
     */
    async crawl(
        url: string,
        callback: (result: CrawlerResult) => void,
        recursionDepth = 0,
    ) {
        // Make sure we're above water
        if (recursionDepth < 0) {
            throw new Error('Recursion depth is less than 0');
        }

        // Don't crawl the same URL twice
        const cleanedUrl = cleanUrl(url);
        if (this.#visitedUrls.has(cleanedUrl)) {
            return;
        }
        this.#visitedUrls.add(cleanedUrl);

        // Crawl the URL
        const $ = await this.#fetchPage(cleanedUrl);
        const links = this.#extractLinks($, cleanedUrl);
        callback({ url: cleanedUrl, html: $.html(), links });

        // Call the crawl function for each link
        if (recursionDepth > 0) {
            for (const link of links) {
                await sleep(100); // Await sleep to properly delay
                await this.crawl(link, callback, recursionDepth - 1); // Await the recursive call
            }
        }
    }

    clearState() {
        this.#visitedUrls.clear();
    }

    async #fetchPage(url: string): Promise<cheerio.Root> {
        try {
            const response = await axios.get(url);
            return cheerio.load(response.data);
        } catch (error) {
            console.error(`Error fetching ${url}: ${error}`);
            throw error;
        }
    }

    #extractLinks($: cheerio.Root, baseUrl: string): string[] {
        const links: string[] = [];
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                const cleanedUrl = cleanUrl(href, baseUrl);
                if (cleanedUrl) {
                    links.push(cleanedUrl);
                }
            }
        });
        return links;
    }
}
