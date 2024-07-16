import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;
const geoAPIKey = process.env.OPENCAGE_API_KEY;
const weatherAPIKey = process.env.OPENWEATHERMAP_API_KEY;

app.use(express.static("public")); // middleware to access static files (images and styling)
app.use(express.urlencoded({ extended: true })); // middleware to parse URL-encoded data

app.get("/", async(req, res) => {
    res.render("index.ejs");
});

app.post("/search", async(req, res) => {
    const address = req.body.address;
    const encodedAddress = encodeURIComponent(address);

    try {
        const coordinatesResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${geoAPIKey}`);
        const coordinates = coordinatesResponse.data;

        if (coordinates.results && coordinates.results.length > 0) {
            const { lat, lng } = coordinates.results[0].geometry;
            res.redirect(`/weather?lat=${lat}&lon=${lng}`);
        } else {
            res.render("index.ejs", { data: null, error: "No coordinates found for the provided address. Unable to fetch weather data." });
        }
    } catch (error) {
        console.error('Error fetching geological data:', error);
        res.render("index.ejs", { data: null, error: "An error occurred while fetching geological data." });
    }
});

app.get("/weather", async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}`);
        const weatherData = weatherResponse.data;
        res.render("index.ejs", { data: weatherData });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.render("index.ejs", { data: null, error: "An error occurred while fetching weather data." });
    }
});

app.get("/forecast", async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}`);
        const forecastData = forecastResponse.data;
        res.render("forecast.ejs", { data: forecastData });
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        res.status(500).send('Error fetching forecast data');
    }
});

app.get("/map", async (req, res) => {
    try {
        res.render("map.ejs", {weatherAPIKey});
    } catch (error) {
        console.error('Error fetching weather maps:', error);
        res.status(500).send('Error fetching weather maps');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
