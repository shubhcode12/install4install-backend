const axios = require("axios");
const cheerio = require("cheerio");

async function getAppDetails(packageId) {
  const url = `https://play.google.com/store/apps/details?id=${packageId}`;

  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Extract the application details
    const title = $('h1[itemprop="name"]').text();
    const developer = $("div.tv4jIf > div.Vbfug > a > span").text().trim();
    const description = $("div.bARER")
      .text()
      .replace(/<br\s*\/?>/gi, "\n")
      .trim();
    const rating = $("div.TT9eCd")
      .attr("aria-label")
      .match(/Rated ([\d.]+) stars/)[1];
    const reviewsCount = $("span.AYi5wd.TBRnV").text();
    const installs = $("div.wVqUob").first().find(".ClM7O").text();
    const contentRating = $('span[itemprop="contentRating"]').text();
    const icon = $('img[itemprop="image"]').attr("src");
    const screenshots = [];
    $("img.T75of.B5GQxf").each((i, element) => {
      const screenshotUrl = $(element).attr("src");
      screenshots.push(screenshotUrl);
    });

    // Return the extracted details
    return {
      title,
      developer,
      description,
      rating,
      reviewsCount,
      installs,
      contentRating,
      icon,
      screenshots
    };
  } catch (error) {
    console.error("Error fetching app details:", error);
    return null;
  }
}

// Example usage
getAppDetails("com.zyapaar.mobile")
  .then((details) => console.log(details))
  .catch((error) => console.error("Error:", error));
