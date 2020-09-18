const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto("https://arbeidsplassen.nav.no/stillinger", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
    });
    // let something = await newPage.$eval('#treff > div.SearchResults > div:nth-child(1) > a > div > div.col.col-xs-12.col-md-8 >', text => text.innerHTML);
    // var jobTitle = await page.$eval('.SearchResultItem__link', text => text.textContent)
    await page.waitFor('#treff > div.SearchResults'); // <-- add this line
    const hrefs = await page.$$eval('a', as => as.map(a => a.href));

    var urls = await page.$$eval('#treff > div.SearchResults', list => {
        links = list.map(data => data.outerHTML)
        links1 = list.map(el => el.querySelector('a').href)
        return links;
    });

    // const hrefs = await page.$$eval('a', as => as.map(a => a.href));
    console.log(hrefs)
    // const username = await page.waitForSelector('#search-form-fritekst-input');
    // await username.click();
    // await page.keyboard.sendCharacter('Prio Bygg & Sanering As');
    // await page.keyboard.press('Enter');
})();
