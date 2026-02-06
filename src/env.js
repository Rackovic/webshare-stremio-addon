const host =
  process.argv.includes("--dev") == 1
    ? "localhost:61613"
    
const url =
  process.argv.includes("--dev") == 1
    ? "http://localhost:61613/"

module.exports = { host, url };
