// const axios = require("axios");
// const cheerio = require("cheerio");

// const getAirbnbData = async (startId, endId) => {
//   const airbnbData = [];
//   for (let id = startId; id <= endId; id++) {
//     const URL = `https://www.airbnb.com/rooms/${id}`;
//     try {
//       const response = await axios.get(URL);
//       const $ = cheerio.load(response.data);
//       const price = $(`meta[name="description"]`).attr('content');
//       const neighborhood = $("._1gw6tte").text().trim();
//       const occupancyRate = $("._s2zlfo").text().trim();
//       airbnbData.push({ id, price, neighborhood, occupancyRate });
//     } catch (error) {
//       console.error(`Unable to retrieve data for listing ID: ${id}`);
//     }
//   }

//   return airbnbData;
// };

// getAirbnbData(30351100, 30351195).then((data) => console.log(data));


// const puppeteer = require('puppeteer');

// (async () => {
//   // Launch the browser
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   // Go to the page
//   await page.goto('YOUR_URL_HERE', { waitUntil: 'networkidle0' }); // Replace YOUR_URL_HERE with your target URL

//   // Extract the data
//   const apartments = await page.evaluate(() => {
//     const results = [];

//     // Select all apartment cards
//     const apartmentCards = document.querySelectorAll('[data-testid="house-card-container"]');

//     apartmentCards.forEach((card) => {
//       // Extract the data you need. For example:
//       const title = card.querySelector('a[title]').getAttribute('title');
//       const link = card.querySelector('a[title]').getAttribute('href');
//       const price = card.querySelector('[data-testid="house-card-rent"]').innerText;
//       // ... any other data points you want

//       results.push({ title, link, price });
//     });

//     return results;
//   });

//   console.log(apartments);

//   await browser.close();
// })();

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

let existingPrices = []; // Define and initialize existingPrices here

// Check if the data file exists
if (fs.existsSync('apartment_prices.json')) {
  // Load data from the file
  const data = fs.readFileSync('apartment_prices.json', 'utf8');
  existingPrices = JSON.parse(data); // Assign the loaded data to existingPrices
} else {
  // Initialize an empty array if the file doesn't exist
  existingPrices = [];
}

// Define a function to search apartments
const searchApartments = async () => {
  try {
    const baseUrl = 'https://www.quintoandar.com.br/comprar/imovel/copacabana-rio-de-janeiro-rj-brasil/apartamento/2-quartos';

    // Define the number of pages you want to scrape
    const totalPages = 10; // Adjust as needed

    const apartmentPrices = [];

    for (let page = 1; page <= totalPages; page++) {
      const url = `${baseUrl}?page=${page}`;
      const response = await axios.get(url);

      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);

        // Use the class selector to locate apartment price elements
        $('p.sc-iBkjds.OiFQE.sc-ftvSup.etNEqI.CozyTypography span').each((index, element) => {
          const price = $(element).text();
          apartmentPrices.push(price);
        });
      }
    }

    // Save the data to a JSON file
    fs.writeFileSync('apartment_prices.json', JSON.stringify(apartmentPrices));

    return apartmentPrices;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Call the searchApartments function
searchApartments().then((newPrices) => {
  console.log('New Apartment Prices:', newPrices);

  // Combine the new prices with the existing data
  const combinedPrices = [...existingPrices, ...newPrices];

  // Save the combined data to the file
  fs.writeFileSync('apartment_prices.json', JSON.stringify(combinedPrices));
});
