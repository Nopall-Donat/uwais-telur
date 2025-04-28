// utils/time.js

function getCurrentTimestampWIB() {
    const now = new Date();

    const offsetMs = 7 * 60 * 60 * 1000; // offset 7 jam (WIB)
    const wibTime = new Date(now.getTime() + offsetMs);

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(wibTime.getUTCDate());
    const month = pad(wibTime.getUTCMonth() + 1);
    const year = wibTime.getUTCFullYear();
    const hours = pad(wibTime.getUTCHours());
    const minutes = pad(wibTime.getUTCMinutes());
    const seconds = pad(wibTime.getUTCSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = { 
    getCurrentTimestampWIB 
};
