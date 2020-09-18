const puppeteer = require("puppeteer");
const Categories = require('./FinnCategories.json');
(async () => {
    let i2 = 0;

    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    const linkIds = Categories.map(category => category.linkId);
    await page.goto("https://www.finn.no/job/fulltime/search.html");
    await page.waitFor(1000);
    const click1 = await page.waitForSelector('#__next > main > div.grid > section > ul:nth-child(12) > li:nth-child(16) > button');
    await click1.click();
    await page.waitFor(1000);
    let checkboxText = await page.$$eval('#__next > main > div.grid > section > ul:nth-child(12) > li > div > label', links => {
        // Make sure the book to be scraped is in stock
        // Extract the links from the data
        links = links.map(el => el.textContent)
        return links;
    })
    let checkboxID = await page.$$eval('#__next > main > div.grid > section > ul:nth-child(12) > li > div > input[type=checkbox]', links => {
        // Make sure the book to be scraped is in stock
        // Extract the links from the data
        links = links.map(el => el.getAttribute("id"))
        return links;
    })
    // var categories = await page.$$eval('#__next > main > div.grid > section > ul:nth-child(12)', list => {
    //     links = list.map(data => data.id)
    //     // links1 = list.map(el => el.querySelector('a').href)
    //     return links;
    // });
    // const attr = await page.$$eval("#__next > main > div.grid > section > ul:nth-child(12) > li", el => el.map(x => x.getAttribute("id")));

    // let categories = await page.$eval('#__next > main > div.grid > section > ul:nth-child(12) > li:nth-child(1)', text => text.outerHTML);
    let nextPageExists = false
    console.log(checkboxID)
    for (let i = 0; i < checkboxID.length; i++) {
        // console.log(nextPageExists)
        console.log('#' + checkboxID[i])

        // nextPageExists = true

        const username = await page.waitForSelector('#' + checkboxID[i]);
        await username.click();
        await page.waitFor(1000);

        while ((await page.$$('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a')).length < 1) {
            console.log('test')
            break
        }
        // if ((await page.$$('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a')).length < 1) {
        //     nextPageExists = false
        //     // console.log(nextPageExists)

        //     await username.click();
        //     await page.waitFor(1000);
        //     break
        // }
        await username.click();
        await page.waitFor(1000);

        // // console.log((await page.$$('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a')).length)
        // // if ((await page.$$('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a')).length === 0) {
        // //     nextPageExists = false
        // // }
        // let sida = 0;
        // while (nextPageExists = true)

        // sida++
        // console.log(sida)
        // if (sida === 1) {
        //     const username2 = await page.waitForSelector('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a');
        //     await username2.click();
        //     await page.waitFor(1000);
        // }
        // console.log('Finns')

        // const username2 = await page.waitForSelector('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a.button.button--pill.button--has-icon.button--icon-right');
        // await username2.click();
        // await page.waitFor(1000);

    }
    var urls = await page.$$eval('article', list => {
        links = list.map(el => el.querySelector('a').href)
        return links;
    });


    /*     for (let i = 0; i < Categories.length; i++) {
            do {
                i2++;
    
                await page.goto(`https://www.finn.no/job/fulltime/search.html?${linkIds[i]}&page=${i2}`)
                console.log(page.url())
                await page.waitFor(3000);
                if ((await page.$$('a[class="button button--pill button--has-icon button--icon-right"]')).length === 0) {
                    nextPageExists = false
                }
            } while (nextPageExists === true)
        } */
})();
// console.log(linkIds[0])
// console.log(JSON.stringify(Categories))