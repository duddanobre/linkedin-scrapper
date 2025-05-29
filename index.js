import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const query = process.argv[2] || "UX UI designer junior";
const location = process.argv[3] || "Brasil";
const outputDir = process.argv[4] || "./results";


const baseUrl = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";

const buildSearchUrl = (keywords, location, start = 0) => {
    const encodedKeywords = encodeURIComponent(keywords);
    const encodedLocation = encodeURIComponent(location);
    return `${baseUrl}?keywords=${encodedKeywords}&location=${encodedLocation}&start=${start}`;
};

export const scrapeJobs = async (keywords, location, pages = 3) => {
    console.log(`🔍 Searching for jobs: "${keywords}" in "${location}"...`);
    let allJobs = [];

    for (let i = 0; i < pages; i++) {
        const start = i * 25;
        const url = buildSearchUrl(keywords, location, start);

        try {
            const { data } = await axios.get(url, {
                headers: { "User-Agent": "Mozilla/5.0" },
            });

            const $ = cheerio.load(data);

            $("li").each((_, element) => {
                const title = $(element).find("h3").text().trim();
                const company = $(element).find(".base-search-card__subtitle").text().trim();
                const location = $(element).find(".job-search-card__location").text().trim();
                const link = $(element).find("a").attr("href");

                if (link && title && company) {
                    allJobs.push({ title, company, location, link });
                }
            });
        } catch (error) {
            console.error(`❌ Failed to fetch page ${i + 1}:`, error.message);
        }
    }

    return allJobs;
};

export const saveToJson = (data, keywords, location, outputDir) => {
    const filename = `${keywords}-${location}.json`
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ Saved ${data.length} job(s) to ${filePath}`);
};

const main = async () => {
    const jobs = await scrapeJobs(query, location);
    if (jobs.length > 0) {
        saveToJson(jobs, query, location, outputDir);
    } else {
        console.log("⚠️ No jobs found.");
    }
};

main();

