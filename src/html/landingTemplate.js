const STYLESHEET = `
:root {
    --primary: #8A5AAB;
    --primary-hover: #a37bc2;
    --bg-dark: #0f0f0f;
    --card-bg: rgba(255, 255, 255, 0.07);
    --text-main: #ffffff;
    --text-dim: rgba(255, 255, 255, 0.6);
    --error: #ff4d4d;
}

* {
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;
}

body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
    font-family: 'Inter', 'Open Sans', sans-serif;
    color: var(--text-main);
    background-color: var(--bg-dark);
}

html {
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}

body {
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, rgba(138, 90, 171, 0.15) 0%, rgba(0,0,0,0) 70%);
    backdrop-filter: blur(5px);
    padding: 20px;
}

#addon {
    width: 100%;
    max-width: 450px;
    background: var(--card-bg);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    text-align: center;
}

.logo {
    width: 100px;
    height: 100px;
    margin: 0 auto 20px;
    filter: drop-shadow(0 0 15px var(--primary));
}

.logo img {
    width: 100%;
    border-radius: 20px;
}

h1 {
    font-size: 2.2rem;
    margin: 0;
    font-weight: 800;
    letter-spacing: -1px;
}

.version {
    font-size: 0.9rem;
    color: var(--primary);
    font-weight: 600;
    display: block;
    margin-bottom: 15px;
}

.description {
    font-size: 1rem;
    color: var(--text-dim);
    line-height: 1.5;
    margin-bottom: 30px;
}

.separator {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 25px 0;
}

/* Form Styling */
.form-element {
    text-align: left;
    margin-bottom: 20px;
}

.label-to-top {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
}

input[type="text"], input[type="password"], input[type="number"], select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(0, 0, 0, 0.5);
}

/* Buttons */
.button-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 30px;
}

button {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
}

button[name="install"][value="desktop"] {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 15px rgba(138, 90, 171, 0.3);
}

button[name="install"][value="desktop"]:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
}

button[value="web"] {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

button[value="web"]:hover {
    background: rgba(255, 255, 255, 0.2);
}

.error {
    background: rgba(255, 77, 77, 0.1);
    border: 1px solid var(--error);
    color: var(--error);
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 0.9rem;
}

.contact a {
    color: var(--text-dim);
    text-decoration: none;
    font-size: 0.8rem;
}

.contact a:hover {
    color: var(--primary);
}

ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
}

ul li {
    background: rgba(255,255,255,0.1);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
}
`;

function landingTemplate(manifest, error, configValues) {
    const background = "https://en.webshare.cz/gfx/bg.jpg";
    const logo = manifest.logo || "/mystatic/logo.png";
    
    const contactHTML = manifest.contactEmail
        ? `<div class="contact">
            <a href="mailto:${manifest.contactEmail}">Support: ${manifest.contactEmail}</a>
        </div>`
        : "";

    const stylizedTypes = manifest.types.map(
        (t) => t[0].toUpperCase() + t.slice(1) + (t !== "series" ? "s" : ""),
    );

    let optionsHTML = "";
    if ((manifest.config || []).length) {
        manifest.config.forEach((elem) => {
            const key = elem.key;
            const defaultValue = (configValues || {})[key] || elem.default || "";
            
            if (["text", "number", "password"].includes(elem.type)) {
                optionsHTML += `
                <div class="form-element">
                    <div class="label-to-top">${elem.title}</div>
                    <input type="${elem.type}" id="${key}" name="${key}" value="${elem.type !== 'password' ? defaultValue : ''}" placeholder="Enter ${elem.title.toLowerCase()}" ${elem.required ? "required" : ""}/>
                </div>`;
            } else if (elem.type === "checkbox") {
                const isChecked = defaultValue === "checked" || defaultValue === true ? "checked" : "";
                optionsHTML += `
                <div class="form-element" style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" id="${key}" name="${key}" ${isChecked}>
                    <label for="${key}" style="font-size:0.9rem; cursor:pointer;">${elem.title}</label>
                </div>`;
            } else if (elem.type === "select") {
                let selectOptions = (elem.options || []).map(opt => 
                    `<option value="${opt}" ${opt === defaultValue ? "selected" : ""}>${opt}</option>`
                ).join("");
                optionsHTML += `
                <div class="form-element">
                    <div class="label-to-top">${elem.title}</div>
                    <select id="${key}" name="${key}">${selectOptions}</select>
                </div>`;
            }
        });
    }

    const errorHTML = error ? `<div class="error">⚠️ Nesprávne údaje. Skúste to znova.</div>` : "";

    return `
    <!DOCTYPE html>
    <html style="background-image: url(${background});">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${manifest.name} - Stremio Addon</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>${STYLESHEET}</style>
    </head>
    <body>
        <div id="addon">
            <div class="logo"><img src="${logo}" onerror="this.src='https://stremio-assets.s3.amazonaws.com/addons/default-logo.png'"></div>
            <h1 class="name">${manifest.name}</h1>
            <span class="version">Version ${manifest.version || "1.0.0"}</span>
            <p class="description">${manifest.description || ""}</p>

            <ul>${stylizedTypes.map((t) => `<li>${t}</li>`).join("")}</ul>

            <div class="separator"></div>

            ${errorHTML}

            <form id="mainForm" action="/configure" method="POST">
                ${optionsHTML}
                <div class="button-container">
                    <button type="submit" name="install" value="desktop">Install to Stremio</button>
                    <button type="submit" name="install" value="web" formtarget="_blank">Stremio Web</button>
                </div>
            </form>

            <div class="separator"></div>
            ${contactHTML}
        </div>
    </body>
    </html>`;
}

module.exports = landingTemplate;
