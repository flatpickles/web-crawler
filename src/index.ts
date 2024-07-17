import { Crawler } from './Crawler.js';

const crawler = new Crawler();
const allCrawledLinks: string[] = [];
const allFoundLinks: string[] = [];

await crawler.crawl(
    'https://example.com',
    (result) => {
        allCrawledLinks.push(result.url);
        allFoundLinks.push(...result.links);
    },
    2,
);

console.log('we made it');
console.log(allFoundLinks);
