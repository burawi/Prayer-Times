import { PrayTimes } from './praytimes.js';

// Function to compare times
function compareTime(calculated, expected) {
    return calculated === expected ? 'PASS' : `FAIL (Expected: ${expected}, Got: ${calculated})`;
}

// Create PrayTimes object
const prayTimes = new PrayTimes();

// Set calculation method to DIYANET (default from schema)
prayTimes.setMethod('DIYANET');

// Set the date and location
const date = [2024, 9, 24]; // September 24th, 2024
const coords = [40.6998, 29.9831, 0]; // Default coordinates from schema (latitude, longitude, elevation)
const timezone = 3; // Timezone for Turkey (UTC+3)
const dst = 0; // Turkey doesn't observe DST

// Calculate prayer times
const times = prayTimes.getTimes(date, coords, timezone, dst, '24h');

// Expected times (these need to be adjusted for the default location)
const expectedTimes = {
    fajr: '05:18',
    sunrise: '06:43',
    dhuhr: '12:57',
    asr: '16:21',
    maghrib: '19:00',
    isha: '20:19'
};

// Compare and log results
console.log('Prayer Times Test Results:');
console.log('Fajr:    ', compareTime(times.fajr, expectedTimes.fajr));
console.log('Sunrise: ', compareTime(times.sunrise, expectedTimes.sunrise));
console.log('Dhuhr:   ', compareTime(times.dhuhr, expectedTimes.dhuhr));
console.log('Asr:     ', compareTime(times.asr, expectedTimes.asr));
console.log('Maghrib: ', compareTime(times.maghrib, expectedTimes.maghrib));
console.log('Isha:    ', compareTime(times.isha, expectedTimes.isha));

// Log calculation parameters
console.log('\nCalculation Parameters:');
console.log('Method:', prayTimes.getMethod());
console.log('Settings:', JSON.stringify(prayTimes.getSetting(), null, 2));
console.log('Offsets:', JSON.stringify(prayTimes.getOffsets(), null, 2));
console.log('Coordinates:', coords);
console.log('Timezone:', timezone);
console.log('DST:', dst);
console.log('Date:', date);

// Log Julian date
const julianDate = prayTimes.julian(...date);
console.log('Julian Date:', julianDate);

// Log all calculated times for reference
console.log('\nCalculated Prayer Times:');
console.log(JSON.stringify(times, null, 2));