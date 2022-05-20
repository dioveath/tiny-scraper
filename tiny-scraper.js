const EventEmitter = require('events');
const fetch = require('node-fetch');
const NodeHTMLParser = require('node-html-parser');

class TinyScraper extends EventEmitter {
    constructor(url, timeout = 2000) {
        super();
        this.url = url;
        this.timeout = timeout;
        this.scrape();        
    }

    scrape() {
        const timer = setTimeout(() => {
            this.emit('timeout');
        }, this.timeout);

        this.getJSON(this.url, (err, data) => {
            if (err) {
                this.emit('error');
            } else {
                this.emit('scrapeSuccess', data);
            }
            clearTimeout(timer);
        });
    }

    getJSON(url, callback) {

        fetch(url)
            .then(res => {
                if(res.status == 404) { 
                    callback(new Error('404'));
                    return false;
                }
            
                this.emit('scrapeStarted', url);                
                return res.text();
            })
            .then(html => {
                if(!html) return;
                const doc = NodeHTMLParser.parse(html);

                const title = doc.querySelector('meta[property="og:title"]').getAttribute('content');
                const image = doc.querySelector('meta[property="og:image"]').getAttribute('content');
                const description = doc.querySelector('meta[property="og:description"]').getAttribute('content');
                const json = {
                    title,
                    image,
                    description
                };
                callback(null, json);
            
            });
    }

}

module.exports = TinyScraper;