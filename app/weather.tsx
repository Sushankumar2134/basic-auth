import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

type WeatherData = {
  name: string;
  sys: { country: string };
  main: { temp: number; humidity: number; pressure: number; feelsLike: number };
  weather: Array<{ main: string; description: string }>;
  wind: { speed: number; direction: number };
  uv: number;
  sunrise: string;
  sunset: string;
  cloudCover: number;
  forecast: Array<{ date: string; maxTemp: number; minTemp: number; condition: string }>;
};

const weatherCodeToText = (code: number): string => {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return map[code] ?? 'Unknown conditions';
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('Mumbai');

  const loadWeather = useCallback(async () => {
    if (!cityInput.trim()) {
      setError('Please enter a city or village name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityInput
        )}&count=1&language=en&format=json`
      );

      if (!geoRes.ok) throw new Error('Failed to find location');

      const geoJson = await geoRes.json();
      const loc = geoJson?.results?.[0];

      if (!loc) {
        setError('Location not found. Try a nearby city or district.');
        setWeather(null);
        return;
      }

      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      if (!forecastRes.ok) throw new Error('Failed to load weather');

      const forecastJson = await forecastRes.json();
      const current = forecastJson.current;
      const daily = forecastJson.daily;
      const description = weatherCodeToText(current.weather_code);
      const locationName = [loc.name, loc.admin1].filter(Boolean).join(', ');
      
      // Get next 3 days forecast
      const forecast = daily.time.slice(0, 3).map((date: string, idx: number) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maxTemp: daily.temperature_2m_max[idx],
        minTemp: daily.temperature_2m_min[idx],
        condition: weatherCodeToText(daily.weather_code[idx]),
      }));

      setWeather({
        name: locationName || loc.name,
        sys: { country: loc.country || '' },
        main: {
          temp: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          pressure: current.pressure_msl,
          feelsLike: current.apparent_temperature,
        },
        weather: [{
          main: description,
          description,
        }],
        wind: { speed: current.wind_speed_10m, direction: current.wind_direction_10m },
        uv: 0, // Open-Meteo doesn't provide UV in free tier, can be added with paid API
        sunrise: '06:00', // Would need sunrise/sunset from separate endpoint
        sunset: '18:00',
        cloudCover: current.cloud_cover,
        forecast,
      });
    } catch (err) {
      setError('Could not load weather. Check location name and try again.');
    } finally {
      setLoading(false);
    }
  }, [cityInput]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌤️ Weather</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading && !weather ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4e8cff" />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      ) : error && !weather ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : weather ? (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cityName}>{weather.name}, {weather.sys.country}</Text>
            <Text style={styles.tempLarge}>{Math.round(weather.main.temp)}°C</Text>
            <Text style={styles.description}>{weather.weather[0]?.description || 'Clear'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Details</Text>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Feels Like</Text>
              <Text style={styles.detailValue}>{Math.round(weather.main.feelsLike)}°C</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>{weather.main.pressure} hPa</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Wind Speed</Text>
              <Text style={styles.detailValue}>{weather.wind.speed.toFixed(1)} km/h</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Wind Direction</Text>
              <Text style={styles.detailValue}>{getWindDirection(weather.wind.direction)} ({weather.wind.direction}°)</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Cloud Cover</Text>
              <Text style={styles.detailValue}>{weather.cloudCover}%</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>3-Day Forecast</Text>
            {weather.forecast.map((day, idx) => (
              <View key={idx} style={styles.forecastDay}>
                <Text style={styles.forecastDate}>{day.date}</Text>
                <Text style={styles.forecastCondition}>{day.condition}</Text>
                <Text style={styles.forecastTemp}>
                  {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Enter any city or village name"
          value={cityInput}
          onChangeText={setCityInput}
          onSubmitEditing={loadWeather}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={loadWeather}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f7f9fc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 10,
  },
  backBtn: { fontSize: 16, color: '#4e8cff', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: '#4e8cff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  centerContent: { justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  loadingText: { color: '#6b7280', marginTop: 12 },
  errorText: { color: '#ef4444', fontSize: 16 },
  content: { gap: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cityName: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  tempLarge: { fontSize: 56, fontWeight: '700', marginTop: 8 },
  description: { fontSize: 16, color: '#9ca3af', marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  detail: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  detailLabel: { color: '#6b7280', fontSize: 14 },
  detailValue: { fontWeight: '600', fontSize: 14 },
  forecastDay: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  forecastDate: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  forecastCondition: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  forecastTemp: { color: '#4e8cff', fontWeight: '600', marginTop: 4 },
});
