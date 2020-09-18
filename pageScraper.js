const fs = require('fs');
const Jobs = require('./Jobs.Model');

const scraperObject = {
    // url: 'https://www.finn.no/job/fulltime/search.html?industry=65',
    async scraper(browser, category) {
        let page = await browser.newPage();
        // await page.goto(this.url);
        // const hrefs = await page.$$eval('a', as => as.map(a => a.href));
        let urls1 = [];
        let chevronExists = true
        let industry = 'industry=65'
        var sitePersonel = {};
        var employees = []
        sitePersonel.employees = employees;
        // while (chevronExists)
        while (chevronExists === true) {
            for (let i = 1; i < 15; i++) {
                await page.goto(`https://www.finn.no/job/fulltime/search.html?${industry}&page=${i}`,
                    {
                        waitUntil: "domcontentloaded",
                        timeout: 90000,
                    })
                urls1.push(page.url())
                var urls = await page.$$eval('article', list => {
                    links = list.map(el => el.querySelector('a').href)
                    return links;
                });

                // Loop through each of those links, open a new page instance and get the relevant data from them
                let pagePromise = (link) => new Promise(async (resolve, reject) => {

                    let dataObj = {};
                    let idfromurl = link
                    let finnId = idfromurl.match(/[0-9]+/)
                    console.log(finnId[0])
                    let newPage = await browser.newPage();
                    await newPage.goto(link);
                    dataObj['jobID'] = finnId[0]
                    dataObj['jobTitle'] = await newPage.$eval('h1[class="u-t2 u-word-break"]', text => text.textContent);
                    dataObj['jobTitleInfo'] = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > section:nth-child(4)', text => text.innerText);
                    dataObj['jobDescription'] = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > div.import-decoration > section', text => text.innerText);
                    dataObj['jobSector'] = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > section:nth-child(9)', text => text.innerText);
                    try {
                        dataObj['jobApplyLink'] = await newPage.$eval('a[class="button button--cta u-size1of1"]', text => text.href);
                    } catch (err) {
                        console.log('Existerar ej', finnId)
                    }
                    dataObj['jobLink'] = link;

                    // dataObj['easyApply'] = await newPage.$eval('.instock.availability', text => {
                    //     // Strip new line and tab spaces
                    //     text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
                    //     // Get the number of stock available
                    //     let regexp = /^.*\((.*)\).*$/i;
                    //     let stockAvailable = regexp.exec(text)[1].split(' ')[0];
                    //     return stockAvailable;
                    // });
                    const list1 = await page.$eval("body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > section:nth-child(4) > dl", (elm) => {
                        const children = elm.children;
                        let list = {};
                        let temp;

                        for (child of children) {
                            if (child.tagName === "DT") {
                                temp = child.innerText;
                                list[temp] = [];
                            } else {
                                list[temp].push(child.innerText);
                            }
                        }

                        for (key of Object.keys(list)) if (list[key].length === 1) list[key] = list[key][0];

                        return list;
                    });

                    const list2 = await page.$eval("dl.definition-list.u-mt16", (elm) => {
                        const children = elm.children;
                        let list = {};
                        let temp;

                        for (child of children) {
                            if (child.tagName === "DT") {
                                temp = child.innerText;
                                list[temp] = [];
                            } else {
                                list[temp].push(child.innerText);
                            }
                        }

                        for (key of Object.keys(list)) if (list[key].length === 1) list[key] = list[key][0];

                        return list;
                    });
                    const list = await page.$eval("dl.definition-list.definition-list--inline", (elm) => {
                        const children = elm.children;
                        let list = {};
                        let temp;

                        for (child of children) {
                            if (child.tagName === "DT") {
                                temp = child.innerText;
                                list[temp] = [];
                            } else {
                                list[temp].push(child.innerText);
                            }
                        }

                        for (key of Object.keys(list)) if (list[key].length === 1) list[key] = list[key][0];

                        return list;
                    });
                    resolve(dataObj);
                    await newPage.close();
                });

                for (link in urls) {

                    let currentPageData = await pagePromise(urls[link]);
                    sitePersonel.employees.push(currentPageData);
                    fs.writeFile("finndata.json", JSON.stringify(sitePersonel), 'utf8', function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        // console.log("The data has been scraped and saved successfully! View it at './data.json'");
                    });
                    // scrapedData.push({ currentPageData });

                }


                if ((await page.$$('a[class="button button--pill button--has-icon button--icon-right"]')).length === 0) {
                    chevronExists = false
                }
                // console.log(urls)

            }
            // console.log(urls1)
        }
        /*       // console.log(hrefs)
      
              var jobTitle = await page.$eval('.ads__unit__content > h2 > a', text => text.textContent)
              // console.log(jobTitle)
              numberOfAds = (await page.$$('article[class="ads__unit"]'))
              let arr = [];
              for (let i = 0; i < numberOfAds.length; i++) {
                  arr.push([i]);
              }
              // console.log(arr)
              var jobDescription = await page.$eval('.ads__unit__content__keys', text => text.textContent)
              // console.log(jobDescription)
      
              var easyApply = await page.$eval('span[class="status status--success u-mb8"]', text => text.textContent)
              // console.log(easyApply)
      
              var urls = await page.$$eval('article', list => {
                  links = list.map(data => data.textContent)
                  links1 = list.map(el => el.querySelector('a').href)
                  return links1;
              });
              // console.log(urls)
      
      
      
              var jobDescription1 = await page.$$eval('article', list => {
                  links = list.map(data => data.textContent)
                  return links;
              });
              // console.log(jobDescription1)
      
              var easyApply1 = await page.$$eval('article', list => {
                  links = list.map(data => data.textContent)
                  return links;
              });
              // console.log(easyApply1)
              // let urls = await page.$$eval('main > ', links => {
              //     // Make sure the book to be scraped is in stock
              //     links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
              //     // Extract the links from the data
              //     links = links.map(el => el.querySelector('h3 > a').href)
              //     return links;
              // });
              // console.log(urls) */

        await browser.close()
    }
}

module.exports = scraperObject;