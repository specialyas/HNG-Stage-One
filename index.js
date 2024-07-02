const express = require('express');
const axios = require('axios');
const requestIp = require('request-ip');

require('dotenv').config(); // Load environment variables from .env file
const app = express();
const port = process.env.PORT || 3000;

// Middleware to use request-ip
app.use(requestIp.mw());
app.set('trust proxy', true);


app.get('/', async (req, res) => {

    res.send("Successfull")
})
app.get('/api/hello', async (req, res) => {
    try {
        const visitorName = req.query.visitor_name;

        if (!visitorName) {
            return res.status(400).json({ error: 'visitor_name query parameter is required' });
        }

        // Get client's IP address using request-ip
        let clientIp = req.clientIp;

          // Handle local development where IP might be "::1"
          if (clientIp === '::1') {
            clientIp = '101.44.253.0'; // Substitute with a public IP address for testing
        }
        // Fetch the client's location using ipinfo.io
        const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        const locationData = locationResponse.data;
        const city = locationData.city;
        // console.log(locationData);
        // console.log(city);


        // Fetch weather information using WeatherAPI
        const apiKey = process.env.WEATHERAPI_KEY; // Use environment variable
       
        const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;
        const temperature = weatherData.current.temp_c;

        // Send response with the client's IP, location, and a greeting message including the temperature
        const response = {
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
