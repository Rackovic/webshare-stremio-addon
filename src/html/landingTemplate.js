const STYLESHEET = `
:root {
    --primary: #e50914; /* Kinová červená */
    --primary-hover: #ff1f1f;
    --bg-dark: #060606;
    --card-bg: rgba(15, 15, 15, 0.75);
    --text-main: #ffffff;
    --text-dim: rgba(255, 255, 255, 0.7);
    --error: #ff4d4d;
    --glass-border: rgba(255, 255, 255, 0.1);
}

* {
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    color: var(--text-main);
    background-color: var(--bg-dark);
    overflow-x: hidden;
}

body {
    display: flex;
    align-items: center;
    justify-content: center;
    background: 
        linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)),
        url('https://en.webshare.cz/gfx/bg.jpg') center/cover no-repeat fixed;
    padding: 20px;
}

#addon {
    width: 100%;
    max-width: 480px;
    background: var(--card-bg);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid var(--glass-border);
    padding: 50px 40px;
    border-radius: 32px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.8);
    text-align: center;
}

.logo {
    width: 120px;
    height: 120px;
    margin: 0 auto 25px;
    position: relative;
}

.logo img {
    width: 100%;
    height: 100%;
    border-radius: 28px;
    box-shadow: 0 10px 30px rgba(229, 9, 20, 0.3);
    object-fit: cover;
}

h1 {
    font-size: 2.5rem;
    margin: 0 0 8px;
    font-weight: 800;
    letter-spacing: -1.5px;
    background: linear-gradient(180deg, #fff 0%, #aaa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.version {
    font-size: 0.85rem;
    color: var(--primary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: block;
    margin-bottom: 20px;
}

.description {
    font-size: 1.05rem;
    color: var(--text-dim);
    line-height: 1.6;
    margin-bottom: 35px;
    font-weight: 400;
}

.separator {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
    margin: 30px 0;
}

.form-element {
    text-align: left;
    margin-bottom: 24px;
}

.label-to-top {
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding-left: 4px;
}

input[type="text"], input[type="password"], select {
    width: 100%;
    padding: 16px 20px;
    border-radius: 16px;
    border: 1px solid var(--glass-border);
    background: rgba(0, 0, 0, 0.4);
    color: white;
    font-size: 1rem;
    outline: none;
}

input:focus {
    border-color: var(--primary);
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.15);
}

.button-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 35px;
}

button {
    width: 100%;
    padding: 18px;
    border-radius: 18px;
    border: none;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    display: flex;
    align-items: center;
    justify-content: center;
}

button[name="install"][value="desktop"] {
    background: var(--primary);
    color: white;
    box-shadow: 0 8px 25px rgba(229, 9, 20, 0.4);
}

button[name="install"][value="desktop"]:hover {
    background: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(229, 9, 20, 0.5);
}

button[value="web"] {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border: 1px solid var(--glass-border);
}

button[value="web"]:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.error {
    background: rgba(255, 77, 77, 0.15);
    border: 1px solid var(--error);
    color: white;
    padding: 15px;
    border-radius: 16px;
    margin-bottom: 25px;
    font-size: 0.95rem;
    font-weight: 600;
}

ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-bottom: 0;
}

ul li {
    background: rgba(229, 9, 20, 0.1);
    border: 1px solid rgba(229, 9, 20, 0.2);
    color: var(--primary);
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
}

.contact a {
    color: var(--text-dim);
    text-decoration: none;
    font-size: 0.85rem;
    opacity: 0.6;
}

.contact a:hover {
    opacity: 1;
    color: var(--primary);
}
`;

function landingTemplate(manifest, error, configValues) {
    const logo = manifest.logo || "/mystatic/logo.png";
    
    const contactHTML = manifest.contactEmail
        ? `<div class="contact">
            <a href="mailto:${manifest.contactEmail}">Podpora: ${manifest.contactEmail}</a>
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
                    <input type="${elem.type}" id="${key}" name="${key}" value="${elem.type !== 'password' ? defaultValue : ''}" placeholder="Zadajte ${elem.title.toLowerCase()}" ${elem.required ? "required" : ""}/>
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

    const errorHTML = error ? `<div class="error">❌ Neplatné prihlasovacie údaje</div>` : "";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${manifest.name} | Kinový Zážitok</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
        <style>${STYLESHEET}</style>
    </head>
    <body>
        <div id="addon">
            <div class="logo">
                <img src="${logo}" onerror="this.src='https://stremio-assets.s3.amazonaws.com/addons/default-logo.png'">
            </div>
            <h1>${manifest.name}</h1>
            <span class="version">Verzia ${manifest.version || "1.0.0"}</span>
            <p class="description">${manifest.description || "Vstúpte do sveta neobmedzenej kinematografie s najlepšou kvalitou obrazu."}</p>

            <ul>${stylizedTypes.map((t) => `<li>${t}</li>`).join("")}</ul>

            <div class="separator"></div>

            ${errorHTML}

            <form id="mainForm" action="/configure" method="POST">
                ${optionsHTML}
                <div class="button-container">
                    <button type="submit" name="install" value="desktop">
                        Inštalovať do Stremio
                    </button>
                    <button type="submit" name="install" value="web" formtarget="_blank">
                        Otvoriť Stremio Web
                    </button>
                </div>
            </form>

            <div class="separator"></div>
            ${contactHTML}
        </div>
    </body>
    </html>`;
}

module.exports = landingTemplate;
