# Web Crawler Experimentation

This is a basic web crawler.

```
npm run start
```

### Todo:

-   Some sort of progress output:
    -   deepest layer currently active (out of how many?)
    -   how many links crawled?
    -   how links many currently queued to be crawled?
-   Use workers so it can do multi-threaded crawling
-   Test: make sure pages are deduped (even with hashes)
-   Collect crawled content into a text document or PDF!
