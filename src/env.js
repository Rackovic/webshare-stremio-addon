const host =
  process.argv.includes("--dev") == 1
    ? "localhost:61613"
    : "satlink-cinema-stremio-addon.onrender.com"; // TU MUSÍ BYŤ TVOJA RENDER ADRESA

const url =
  process.argv.includes("--dev") == 1
    ? "http://localhost:61613/"
    : "https://satlink-cinema-stremio-addon.onrender.com/"; // AJ TU

module.exports = { host, url };
