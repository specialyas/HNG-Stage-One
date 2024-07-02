const axios = require('axios');
const requestIp = require('request-ip');
require('dotenv').config();

module.exports = async (req, res) => {
  const visitorName = req.query.visitor_name;

  if (!visitorName) {
    return res.status(400).json({ error: 'visitor_name query parameter is required' });
  }

  const clientIp = requestIp.getClientIp(req);
  const ipToUse = clientIp === '::1' ? '8.8.8.8' : clientIp;

  try {
    const locationResponse = await axios.get(`https://ipinfo.io/${ipToUse}/json`);
    const locationData = locationResponse.data;
    const city = locationData.city || 'Default City';

    const apiKey = process.env.WEATHERAPI_KEY;
    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;
    const temperature = weatherData.current.temp_c;

    const response = {
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
    };

    res.json(response);
  } catch (error) {
    if (error.response) {
      console.error('Error response from WeatherAPI:', error.response.data);
      res.status(500).json({ error: error.response.data });
    } else if (error.request) {
      console.error('No response received:', error.request);
      res.status(500).json({ error: 'No response received from WeatherAPI' });
    } else {
      console.error('Error setting up request:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
};
