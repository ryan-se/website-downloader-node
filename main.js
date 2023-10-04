const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const readline = require('readline');

// create input/output terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// parse a HTML paramater and search for links in the file
function getLinks(html) {
    // load the HTML into a cheerio object
    const $ = cheerio.load(html);
    const links = [];

    // search the cheerio object for anchor tags and extract the href value from them
    $('a').each((index, element) => {
        const link = $(element).attr('href');

        // if the link has a href value, push it to the links array
        if (link) {
            links.push(link);
        }
    });

    // return the array of links
    return links;
}

// use a URL parameter to look up website information and save it as a file to the system.
async function downloadWebsite(url) {
    try {
        // look up the website URL and get the HTML from the response data
        const response = await axios.get(url);
        const html = response.data;

        // call getLinks using the found HTML to populate an array of links
        const links = getLinks(html);

        // Get the page title from the HTML
        const pageTitleMatch = html.match(/<title>(.*?)<\/title>/i);
        const pageTitle = pageTitleMatch ? pageTitleMatch[1] : 'unknown';

        // use the page title as aa part of the downloaded file name
        const fileName = `download_${pageTitle}.html`;

        // write the file to the system
        fs.writeFileSync(fileName, html);

        console.log('Website downloaded successfully.');
        console.log('These links were found on the website:');

        // display the array of links, assigning them a number
        links.forEach((link, index) => {
            console.log(`${index + 1}: ${link}`);
        });

        while (true) {
            const answer = await new Promise((resolve) => {
                rl.question('Enter the link number to download that url as well (or 0 to exit): ', (answer) => {
                    resolve(answer);
                });
            });

            const selectedLink = parseInt(answer) - 1;

            if (selectedLink === -1) {
                console.log('Exiting. Thank you for using this program.');
                r1.close();
                return;
            } else if (!isNaN(selectedLink) && selectedLink >= 0 && selectedLink < links.length) {
                const linkAddress = links[selectedLink];
                downloadWebsite(linkAddress);
                return;
            } else {
                console.log('Invalid input. Please enter a valid link number or 0 to exit.');
            }
        }
    } catch (error) {
        console.error('Error downloading website: ', error.message);
        rl.close();
    }
}
// program entry
rl.question('Enter a complete wesbite URL to download the .html file: ', (url) => {
    downloadWebsite(url);
});


// exit cleanup
rl.on(0, () => {
    console.log('Exiting. Thank you for using this program.');
    process.exit(0);
});