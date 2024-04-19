document.addEventListener('DOMContentLoaded', function() {
    const videoElement = document.getElementById('video-background');
    const cityNameInput = document.getElementById('cityName');
    const searchButton = document.getElementById('search');
    const tempSelect = document.getElementById('selector');
    const temp = document.getElementById('temp');
    const location = document.getElementById('location');
    const coordinatesandtime = document.getElementById('coordinates&time');
    const description = document.getElementById('description');
    const icon = document.getElementById('icon');
    const hourlyForecastContainer = document.getElementById('hourly-forecast');
    const weekdayContainer = document.getElementById('daydiv');
    const iconsContainer = document.getElementById('iconsdiv');
    const mintempContainer = document.getElementById('mintempdiv');
    const rangeContainer = document.getElementById('range');
    const maxContainer = document.getElementById('maxtempdiv');
    const content = document.getElementById('content');
    let latitude;
    let longitude;
    let sunriseTime;
    let sunsetTime;
    let isDayTime;
    let CorF = true;

    async function fetchWeatherData(currentweatherUrl, forecasthourweatherUrl, forecastdayweatherUrl) {
        content.classList.remove('visible');
        weekdayContainer.innerHTML = "";
        iconsContainer.innerHTML = "";
        mintempContainer.innerHTML = "";
        rangeContainer.innerHTML = "";
        maxContainer.innerHTML = "";
        try {
            const response = await fetch(currentweatherUrl);
            const data = await response.json();
            console.log(data);

            if (CorF == true) {
                const selectedValue = tempSelect.value; 
                temp.innerHTML = data.current.temp_c;
                tempSelect.value = selectedValue; 
            } else {
                const selectedValue = tempSelect.value;
                temp.innerHTML = data.current.temp_f;
                tempSelect.value = selectedValue;
            }
            location.innerHTML = data.location.region;
            coordinatesandtime.innerHTML =  convertTo12HourFormat(data.location.localtime.toString().substr(-5)) + "   |   " + "H: " + data.location.lat.toString().substring(0, 2) + '<sup>°</sup> ' + " L: " + data.location.lon.toString().substring(0,3) + '<sup>°</sup>';;
            description.innerHTML = data.current.condition.text;

            hourlyForecastContainer.innerHTML = ''; 
            const currentHour = parseInt(data.location.localtime.toString().substring(11, 13));

            for (let i = currentHour; i < currentHour + 5; i++) {
                const response = await fetch(forecasthourweatherUrl + (i%24));
                const data = await response.json();
            
                const hourDiv = document.createElement('div');
                hourDiv.id = 'hourdiv';
                
                const timePara = document.createElement('p');
                if(i === currentHour)
                    timePara.textContent = "Now";
                else
                    timePara.textContent = convertTo12HourFormat(data.forecast.forecastday[0].hour[0].time.toString().substring(11));
                hourDiv.appendChild(timePara);

                const ic = document.createElement('img');
                ic.src = determineIcon(data.forecast.forecastday[0].hour[0].condition.text); 
                ic.alt = data.forecast.forecastday[0].hour[0].condition.text;
                hourDiv.appendChild(ic);
                
                const tempPara = document.createElement('p');
                if(CorF === true)
                    tempPara.innerHTML = `${data.forecast.forecastday[0].hour[0].temp_c}<sup>°C</sup>`;
                else
                    tempPara.innerHTML = `${data.forecast.forecastday[0].hour[0].temp_f}<sup>°F</sup>`;
                hourDiv.appendChild(tempPara);
                
                hourlyForecastContainer.appendChild(hourDiv);
            }

            const response1 = await fetch(forecastdayweatherUrl);
            const data1 = await response1.json();

            const today = new Date();
            for (let i = 0; i < 5; i++) {
                const nextDate = new Date(today);
                nextDate.setDate(nextDate.getDate() + i);
                const options = { weekday: 'long' };
                const weekdayName = nextDate.toLocaleDateString('en-US', options);
                
                const dayPara = document.createElement('p');
                if(i === 0)
                    dayPara.textContent = "Today";
                else
                    dayPara.textContent = weekdayName.substring(0, 3);
                weekdayContainer.appendChild(dayPara);

                const ic = document.createElement('img');
                ic.src = determineIcon(data1.forecast.forecastday[i].day.condition.text); 
                ic.alt = data1.forecast.forecastday[i].day.condition.text;
                iconsContainer.appendChild(ic);

                const mintempPara = document.createElement('p');
                if(CorF == true)
                    mintempPara.innerHTML = `${data1.forecast.forecastday[i].day.mintemp_c}<sup>°C</sup>`;
                else
                    mintempPara.innerHTML = `${data1.forecast.forecastday[i].day.mintemp_f}<sup>°F</sup>`;
                mintempContainer.appendChild(mintempPara);

                const divider = document.createElement('input');
                divider.setAttribute('type', 'range');
                divider.setAttribute('id', 'tempRange');
                divider.setAttribute('min', data1.forecast.forecastday[i].day.mintemp_c);
                divider.setAttribute('max', data1.forecast.forecastday[i].day.maxtemp_c);
                divider.setAttribute('value', data1.forecast.forecastday[i].day.mintemp_c);
                divider.classList.add('divider'); 
                rangeContainer.appendChild(divider);
                
                const maxtempPara = document.createElement('p');
                if(CorF == true)
                    maxtempPara.innerHTML = `${data1.forecast.forecastday[i].day.maxtemp_c}<sup>°C</sup>`;
                else
                    maxtempPara.innerHTML = `${data1.forecast.forecastday[i].day.maxtemp_f}<sup>°F</sup>`;
                maxContainer.appendChild(maxtempPara);
            }
            timeout();
            return data.current.condition.text; 
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return 'Unknown';
        }
    }

    async function updateWeatherAndVideo(latitude, longitude) {
        const apiKey = '2c353a97272348c08f8120331241304'; 
        const currentweatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
        const forecasthourweatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&hour=`;
        const forecastdayweatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=5`;

        try {
            const weather = await fetchWeatherData(currentweatherUrl, forecasthourweatherUrl, forecastdayweatherUrl);
            setVideoBackground(weather, icon);
        } catch (error) {
            console.error('Error updating weather and video:', error);
            weatherInfoElement.textContent = 'Error fetching weather data';
        }
    }

    function convertTo12HourFormat(time24) {
        const hour24 = parseInt(time24.substring(0, 2));
        const minutePart = time24.substring(2);
        const period = hour24 >= 12 ? 'PM' : 'AM';
        let hour12 = hour24 % 12 || 12;
    
        if (hour12 < 10) {
            hour12 = '0' + hour12;
        }
        const time12 = hour12 + minutePart + ' ' + period;
        return time12;
    }    
    
    function determineIcon(weather) {
        const currentTime = new Date();
        if(weather.includes("rain") || weather.includes("Rain") || weather.includes("drizzle") || weather.includes("Drizzle")){
           return 'icons/rainy.png';
        }
        else if(weather.includes("clear") || weather.includes("Clear") && isDayTime)
        {
            return 'icons/sun.png';
        }
        else if(weather.includes("clear") || weather.includes("Clear")&& !isDayTime)
        {
            return 'icons/night.png';
        }
        else if(weather.includes("overcast") || weather.includes("Overcast") || weather.includes("Cloudy") || weather.includes("cloudy"))
        {
            return 'icons/cloudy.png';
        }
        else if(weather.includes("sunny") || weather.includes("Sunny") || weather.includes("sun") || weather.includes("Sun"))
        {
            return 'icons/sun.png';
        }
        else if(weather.includes("misty") || weather.includes("Misty") || weather.includes("mist") || weather.includes("Mist"))
        {
            return 'icons/mist.png';
        }
        else if(weather.includes("windy") || weather.includes("Windy") || weather.includes("wind") || weather.includes("Wind"))
        {
            return 'icons/windy.png';
        }
    }


    function setVideoBackground(weather, icon) {
        let videoSource;
        const currentTime = new Date();
        if(weather.includes("rain") || weather.includes("Rain")  || weather.includes("drizzle") || weather.includes("Drizzle") && isDayTime){
            videoSource = 'backgrounds/rainy-day.mp4';
            icon.src = 'icons/rainy.png';
        }
        if(weather.includes("rain") || weather.includes("Rain") || weather.includes("drizzle") || weather.includes("Drizzle") && !isDayTime){
            videoSource = 'backgrounds/rainy.mp4';
            icon.src = 'icons/rainy.png';
        }
        else if(weather.includes("misty") || weather.includes("Misty") || weather.includes("mist") || weather.includes("Mist"))
        {
            videoSource = 'backgrounds/misty.mp4';
            icon.src = 'icons/mist.png';
        }
        else if(weather.includes("windy") || weather.includes("Windy") || weather.includes("wind") || weather.includes("Wind") && isDayTime)
        {
            videoSource = 'backgrounds/windy.mp4';
            icon.src = 'icons/windy.png';
        }
        else if(weather.includes("windy") || weather.includes("Windy") || weather.includes("wind") || weather.includes("Wind") && !isDayTime)
        {
            videoSource = 'backgrounds/windy-night.mp4';
            icon.src = 'icons/windy.png';
        }
        else if(weather.includes("clear") || weather.includes("Clear") && isDayTime)
        {
            videoSource = 'backgrounds/clear.mp4';
            icon.src = 'icons/sun.png';
        }
        else if(weather.includes("clear") || weather.includes("Clear") && !isDayTime)
        {
            videoSource = 'backgrounds/clear-n.mp4';
            icon.src = 'icons/moon.png';
        }
        else if(weather.includes("overcast") || weather.includes("Overcast") || weather.includes("Cloudy") || weather.includes("cloudy") && isDayTime)
        {
            videoSource = 'backgrounds/cloudy.mp4';
            icon.src = 'icons/cloudy.png';
        }
        else if(weather.includes("overcast") || weather.includes("Overcast") || weather.includes("Cloudy") || weather.includes("cloudy") && !isDayTime)
        {
            videoSource = 'backgrounds/cloudy-night.mp4';
            icon.src = 'icons/cloudy.png';
        }
        else if(weather.includes("sunny") || weather.includes("Sunny"))
        {
            videoSource = 'backgrounds/sunny.mp4';
            icon.src = 'icons/sun.png';
        }
        else
        {
            videoSource = 'backgrounds/default.mp4';
        }
        videoElement.src = videoSource;
    }

    function handleTempChange() {
        const selectedTemp = tempSelect.value;
        if(selectedTemp.includes('F') || selectedTemp.includes('f'))
            CorF = false;
        else
            CorF = true;
        updateWeatherAndVideo(latitude, longitude);
    }

    // Get user's current location
    navigator.geolocation.getCurrentPosition(position => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        getTimeInformation(latitude, longitude);
    }, error => {
        console.error('Error getting current location:', error);
        const defaultLatitude = 40.7128;
        const defaultLongitude = -74.006;
        latitude = defaultLatitude;
        longitude = defaultLongitude;
        getTimeInformation(latitude, longitude);
    });

    async function getCoordinates(cityName) {
        const apiUrl = `https://nominatim.openstreetmap.org/search?q=${cityName}&format=json`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.length > 0) {
                latitude = data[0].lat;
                longitude = data[0].lon;
                getTimeInformation(latitude, longitude);
            } else {
                throw new Error('City not found');
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }

    async function getTimeInformation(latitude, longitude) {
        const apiUrl = `https://api.weatherapi.com/v1/astronomy.json?key=2c353a97272348c08f8120331241304&q=${latitude},${longitude}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.astronomy && data.astronomy.astro) {
                const sunriseTime = parseTime(data.astronomy.astro.sunrise);
                const sunsetTime = parseTime(data.astronomy.astro.sunset);
                const currentTime = new Date();
                isDayTime = isDaytime(sunriseTime, sunsetTime);
                updateWeatherAndVideo(latitude, longitude);
            } else {
                throw new Error('sunrise/sunset time not found');
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }

    function parseTime(timeString) {
        let hours, minutes;
        let periodIndex = timeString.indexOf('AM');
        
        if (periodIndex === -1) {
            periodIndex = timeString.indexOf('PM');
        }
    
        if (periodIndex !== -1) {
            const [time, period] = timeString.split(' ');
            [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours < 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }
        } else {
            [hours, minutes] = timeString.split(':').map(Number);
        }
    
        return `${hours}:${minutes}`;
    }
    
    
    function isDaytime(sunriseTime, sunsetTime) {
        const now = new Date();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();
        const nowTimeInMinutes = nowHour * 60 + nowMinute;
    
        const sunrise = parseTime(sunriseTime);
        const sunset = parseTime(sunsetTime);
    
        return nowTimeInMinutes >= sunrise && nowTimeInMinutes <= sunset;
    }
    

    cityNameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            getCoordinates(cityNameInput.value);
        }
    });

    searchButton.addEventListener('click', function() {
        getCoordinates(cityNameInput.value);
    });
    tempSelect.addEventListener('change', handleTempChange);

    function timeout(){
        setTimeout(function() {
            content.classList.add('visible');
        }, 300);
    }
});
