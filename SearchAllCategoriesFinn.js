const puppeteer = require('puppeteer-extra');
const JobsModel = require("./test.model");
const mongoose = require("mongoose");
var uri = "mongodb://localhost:27017/jobhunter";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
const connection = mongoose.connection;
connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});
(async () => {

    const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
    puppeteer.use(AdblockerPlugin())
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        args: ["--disable-setuid-sandbox"],
        'ignoreHTTPSErrors': true
    });
    const page = await browser.newPage();
    await page.goto("https://www.finn.no/job/fulltime/search.html");
    await page.waitFor(1000);
    const click1 = await page.waitForSelector('#__next > main > div.grid > section > ul:nth-child(12) > li:nth-child(16) > button');
    await click1.click();
    await page.waitFor(1000);
    let checkboxText = await page.$$eval('#__next > main > div.grid > section > ul:nth-child(12) > li > div > label', links => {

        // Checkbox labeltext
        links = links.map(el => el.textContent)
        return links;
    })
    let checkboxID = await page.$$eval('#__next > main > div.grid > section > ul:nth-child(12) > li > div > input[type=checkbox]', links => {
        // Checkbox html id

        links = links.map(el => el.getAttribute("id"))
        return links;
    })

    let nextPageExists = false
    console.log(checkboxID.length)
    for (let i = 1; i < checkboxID.length; i++) {
        // console.log(nextPageExists)
        console.log('#' + checkboxID[i])
        let x = 1;
        // nextPageExists = true

        const username = await page.waitForSelector('#' + checkboxID[i]);
        await username.click();
        await page.waitFor(1000);

        if ((await page.$$('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a')).length < 1) {
            var urls = await page.$$eval('article', list => {
                links = list.map(el => el.querySelector('a').href)
                return links;
            });
            for (let i = 0; i < urls.length; i++) {
                let newPage = await browser.newPage();
                await newPage.goto(urls[i]);
                console.log(newPage.url())
                let idfromurl = newPage.url()
                let finnId = idfromurl.match(/[0-9]+/)
                let list1;
                if ((await newPage.$$('dl.definition-list')).length === 0) {
                    list1 = null
                } else {

                    list1 = await newPage.$eval("dl.definition-list", (elm) => {
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
                }
                let list2;
                if ((await newPage.$$('dl.definition-list.u-mt16')).length === 0) {
                    list2 = null
                } else {
                    list2 = await newPage.$eval("dl.definition-list.u-mt16", (elm) => {
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
                }
                let list;

                if ((await newPage.$$('dl.definition-list.definition-list--inline')).length === 0) {
                    list = null
                } else {
                    list = await newPage.$eval("dl.definition-list.definition-list--inline", (elm) => {
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
                }

                let jobdescript = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > div.import-decoration > section', text => text.innerText)
                let jobApplyLink1
                if ((await newPage.$$('a[class="button button--cta u-size1of1"]')).length === 0) {
                    jobApplyLink1 = null
                } else {
                    jobApplyLink1 = await newPage.$eval('a[class="button button--cta u-size1of1"]', text => text.href)
                }
                // console.log(finnId)
                var object = {
                    _id: finnId[0],
                    jobLink: newPage.url(),
                    jobTitle: list1['Arbeidsgiver'],
                    jobApplyLink: jobApplyLink1,
                    jobPosition: list1['Stillingstittel'],
                    jobLatestDate: list1['Frist'],
                    jobFormOfEmployment: list1['Ansettelsesform'],
                    jobNetwork: list['Nettverk'],
                    jobSector: list['Sektor'],
                    jobCity: list['Sted'],
                    jobBranch: list['Bransje'],
                    jobAlternativePositions: list['Stillingsfunksjon'],
                    jobContactInfo: JSON.stringify(list2),
                    jobDescription: jobdescript,
                };
                JobsModel.create(object, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                    }
                });
                await newPage.close();

            }
        }
        if ((await page.$$('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a')).length === 1) {
            do {
                x++;
                if (x = 1) {
                    var urls = await page.$$eval('article', list => {
                        links = list.map(el => el.querySelector('a').href)
                        return links;
                    });
                    for (let i = 0; i < urls.length; i++) {
                        let newPage = await browser.newPage();
                        await newPage.goto(urls[i]);
                        console.log(newPage.url())
                        let idfromurl = newPage.url()
                        let finnId = idfromurl.match(/[0-9]+/)
                        let list1;
                        if ((await newPage.$$('dl.definition-list')).length === 0) {
                            list1 = null
                        } else {

                            list1 = await newPage.$eval("dl.definition-list", (elm) => {
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
                        }
                        let list2;
                        if ((await newPage.$$('dl.definition-list.u-mt16')).length === 0) {
                            list2 = null
                        } else {
                            list2 = await newPage.$eval("dl.definition-list.u-mt16", (elm) => {
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
                        }
                        let list;

                        if ((await newPage.$$('dl.definition-list.definition-list--inline')).length === 0) {
                            list = null
                        } else {
                            list = await newPage.$eval("dl.definition-list.definition-list--inline", (elm) => {
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
                        }

                        let jobdescript = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > div.import-decoration > section', text => text.innerText)
                        let jobApplyLink1
                        if ((await newPage.$$('a[class="button button--cta u-size1of1"]')).length === 0) {
                            jobApplyLink1 = null
                        } else {
                            jobApplyLink1 = await newPage.$eval('a[class="button button--cta u-size1of1"]', text => text.href)
                        }
                        // console.log(finnId)
                        var object = {
                            _id: finnId[0],
                            jobLink: newPage.url(),
                            jobTitle: list1['Arbeidsgiver'],
                            jobApplyLink: jobApplyLink1,
                            jobPosition: list1['Stillingstittel'],
                            jobLatestDate: list1['Frist'],
                            jobFormOfEmployment: list1['Ansettelsesform'],
                            jobNetwork: list['Nettverk'],
                            jobSector: list['Sektor'],
                            jobCity: list['Sted'],
                            jobBranch: list['Bransje'],
                            jobAlternativePositions: list['Stillingsfunksjon'],
                            jobContactInfo: JSON.stringify(list2),
                            jobDescription: jobdescript,
                        };
                        JobsModel.create(object, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(result);
                            }
                        });
                        await newPage.close();

                    }
                    const username2 = await page.waitForSelector('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a');
                    await username2.click();

                    await page.waitFor(1000);
                    while (nextPageExists = true) {
                        var urls = await page.$$eval('article', list => {
                            links = list.map(el => el.querySelector('a').href)
                            return links;
                        });
                        for (let i = 0; i < urls.length; i++) {
                            let newPage = await browser.newPage();
                            await newPage.goto(urls[i]);
                            console.log(newPage.url())
                            let idfromurl = newPage.url()
                            let finnId = idfromurl.match(/[0-9]+/)
                            let list1;
                            if ((await newPage.$$('dl.definition-list')).length === 0) {
                                list1 = null
                            } else {

                                list1 = await newPage.$eval("dl.definition-list", (elm) => {
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
                            }
                            let list2;
                            if ((await newPage.$$('dl.definition-list.u-mt16')).length === 0) {
                                list2 = null
                            } else {
                                list2 = await newPage.$eval("dl.definition-list.u-mt16", (elm) => {
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
                            }
                            let list;

                            if ((await newPage.$$('dl.definition-list.definition-list--inline')).length === 0) {
                                list = null
                            } else {
                                list = await newPage.$eval("dl.definition-list.definition-list--inline", (elm) => {
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
                            }

                            let jobdescript = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > div.import-decoration > section', text => text.innerText)
                            let jobApplyLink1
                            if ((await newPage.$$('a[class="button button--cta u-size1of1"]')).length === 0) {
                                jobApplyLink1 = null
                            } else {
                                jobApplyLink1 = await newPage.$eval('a[class="button button--cta u-size1of1"]', text => text.href)
                            }
                            // console.log(finnId)
                            var object = {
                                _id: finnId[0],
                                jobLink: newPage.url(),
                                jobTitle: list1['Arbeidsgiver'],
                                jobApplyLink: jobApplyLink1,
                                jobPosition: list1['Stillingstittel'],
                                jobLatestDate: list1['Frist'],
                                jobFormOfEmployment: list1['Ansettelsesform'],
                                jobNetwork: list['Nettverk'],
                                jobSector: list['Sektor'],
                                jobCity: list['Sted'],
                                jobBranch: list['Bransje'],
                                jobAlternativePositions: list['Stillingsfunksjon'],
                                jobContactInfo: JSON.stringify(list2),
                                jobDescription: jobdescript,
                            };
                            JobsModel.create(object, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });
                            await newPage.close();
                        }

                        if ((await page.$$('a[class="button button--pill button--has-icon button--icon-right"]')).length === 0) {
                            nextPageExists = false
                            break
                        }
                        var urls = await page.$$eval('article', list => {
                            links = list.map(el => el.querySelector('a').href)
                            return links;
                        });
                        for (let i = 0; i < urls.length; i++) {
                            let newPage = await browser.newPage();
                            await newPage.goto(urls[i]);
                            console.log(newPage.url())
                            let idfromurl = newPage.url()
                            let finnId = idfromurl.match(/[0-9]+/)
                            let list1;
                            if ((await newPage.$$('dl.definition-list')).length === 0) {
                                list1 = null
                            } else {

                                list1 = await newPage.$eval("dl.definition-list", (elm) => {
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
                            }
                            let list2;
                            if ((await newPage.$$('dl.definition-list.u-mt16')).length === 0) {
                                list2 = null
                            } else {
                                list2 = await newPage.$eval("dl.definition-list.u-mt16", (elm) => {
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
                            }
                            let list;

                            if ((await newPage.$$('dl.definition-list.definition-list--inline')).length === 0) {
                                list = null
                            } else {
                                list = await newPage.$eval("dl.definition-list.definition-list--inline", (elm) => {
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
                            }

                            let jobdescript = await newPage.$eval('body > main > div > div.grid > div.grid__unit.u-r-size2of3 > div > div.import-decoration > section', text => text.innerText)
                            let jobApplyLink1
                            if ((await newPage.$$('a[class="button button--cta u-size1of1"]')).length === 0) {
                                jobApplyLink1 = null
                            } else {
                                jobApplyLink1 = await newPage.$eval('a[class="button button--cta u-size1of1"]', text => text.href)
                            }
                            // console.log(finnId)
                            var object = {
                                _id: finnId[0],
                                jobLink: newPage.url(),
                                jobTitle: list1['Arbeidsgiver'],
                                jobApplyLink: jobApplyLink1,
                                jobPosition: list1['Stillingstittel'],
                                jobLatestDate: list1['Frist'],
                                jobFormOfEmployment: list1['Ansettelsesform'],
                                jobNetwork: list['Nettverk'],
                                jobSector: list['Sektor'],
                                jobCity: list['Sted'],
                                jobBranch: list['Bransje'],
                                jobAlternativePositions: list['Stillingsfunksjon'],
                                jobContactInfo: JSON.stringify(list2),
                                jobDescription: jobdescript,
                            };
                            JobsModel.create(object, function (err, result) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });
                            await newPage.close();

                        }
                        const username2 = await page.waitForSelector('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a.button.button--pill.button--has-icon.button--icon-right');
                        await username2.click();
                        await page.waitFor(1000);

                    }
                    break
                }
                const username2 = await page.waitForSelector('#__next > main > div.grid > div.grid__unit.u-r-size2of3 > nav > a.button.button--pill.button--has-icon.button--icon-right');
                await username2.click();
                await page.waitFor(1000);

            } while (nextPageExists = true)

            console.log('slut')
        }

        await username.click();
        await page.waitFor(1000);

    }
    var urls = await page.$$eval('article', list => {
        links = list.map(el => el.querySelector('a').href)
        return links;
    });

})();
