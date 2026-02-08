const { performance } = require("node:perf_hooks");
const { filesize } = require("filesize");
const ptt = require("parse-torrent-title");
const stringSimilarity = require("string-similarity");
const { url } = require("./env");
const { search: wsSearch } = require("./webshare");

const normalizeText = (text) =>
  text
    ?.trim()
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getQueries = (info) => {
  const names = Array.from(
    new Set(
      [info.name, info.nameSk, info.nameEn, info.originalName].filter((n) => n),
    ),
  );
  if (info.type == "series") {
    return names.flatMap((name) => {
      const series = info.series.padStart(2, "0");
      const episode = info.episode.padStart(2, "0");
      return [`${name} S${series}E${episode}`, `${name} ${series}x${episode}`];
    });
  } else {
    names.push(...names.map((name) => name + " " + info.year));
    return names;
  }
};

const cleanTitle = (text) => {
  return normalizeText(
    text
      ?.replace(/subtitles/gi, "")
      ?.replace(/titulky/gi, "")
      ?.replace(/[^\p{L}\p{N}\s]/gu, " ")
      ?.replace(/[_]/g, " "),
  );
};

const enhanceItem = (item, showInfo) => {
  const titleYear =
    showInfo.type === "movie" &&
    item.parsedTitle.year &&
    showInfo.year &&
    !ptt.parse(showInfo.originalName).year
      ? `${showInfo.year}`
      : "";
  const itemTitleYear =
    showInfo.type === "movie" &&
    item.parsedTitle.year &&
    showInfo.year &&
    !ptt.parse(showInfo.originalName).year
      ? `${item.parsedTitle.year}`
      : "";

  const cleanedItemTitle = cleanTitle(item.parsedTitle.title) + itemTitleYear;

  const title = showInfo.name && normalizeText(showInfo.name + titleYear);
  const titleSk = showInfo.nameSk && normalizeText(showInfo.nameSk + titleYear);
  const titleEn = showInfo.nameEn && normalizeText(showInfo.nameEn + titleYear);
  const titleOriginal =
    showInfo.originalName && normalizeText(showInfo.originalName + titleYear);

  return {
    ...item,
    titleYear,
    itemTitleYear,
    cleanedItemTitle,
    titles: { title, titleSk, titleEn, titleOriginal },
  };
};

const calculateMatchScores = (item) => {
  const cleanedItemName = cleanTitle(item.name);
  const { title, titleSk, titleEn, titleOriginal } = item.titles;

  const matchTitles = [
    title,
    titleOriginal,
    titleSk,
    titleEn,
    titleSk && titleOriginal && titleSk + "/" + titleOriginal,
    title && titleOriginal && title + "/" + titleOriginal,
    titleSk && titleEn && titleSk + "/" + titleEn,
    title && titleEn && title + "/" + titleEn,
    titleEn && titleOriginal && titleEn + "/" + titleOriginal,
    titleOriginal && titleEn && titleOriginal + "/" + titleEn,
  ].filter((q) => q);

  const titleMatch = stringSimilarity.findBestMatch(
    item.cleanedItemTitle,
    matchTitles,
  ).bestMatch.rating;

  const nameMatch = stringSimilarity.findBestMatch(cleanedItemName, matchTitles)
    .bestMatch.rating;

  return { titleMatch, nameMatch };
};

const mapToStream = (item, matchScores, token) => {
  const strongMatch = matchScores.titleMatch > 0.5;
  const fulltextMatch = Math.round(matchScores.nameMatch * 10) / 10;
  const weakMatch = matchScores.nameMatch > 0.3;

  // Kontrola dabingu pre vizuálnu značku
  const hasDabing = item.language === 'cs' || item.language === 'sk' || 
                    item.name.toLowerCase().includes('cz') || 
                    item.name.toLowerCase().includes('sk');

  return {
    ident: item.ident,
    titleYear: item.titleYear,
    itemTitleYear: item.itemTitleYear,
    url: url + "getUrl/" + item.ident + "?token=" + token,
    description:
      item.name +
      (item.language ? `\n🌐 ${item.language}` : "") +
      `\n👍 ${item.posVotes} 👎 ${item.negVotes}` +
      `\n💾 ${filesize(item.size)}`,
    match: matchScores.titleMatch,
    strongMatch,
    fulltextMatch,
    weakMatch,
    SeasonEpisode: item.SeasonEpisode,
    posVotes: item.posVotes,
    language: item.language, // Uložíme si pre compareStreams
    // Názov s vlajočkami ak je nájdený dabing
    name: `${hasDabing ? "🇨🇿🇸🇰 " : ""}SatLink CINEMA${strongMatch ? " ✅" : ""} ${item.parsedTitle.resolution || ""}`,
    behaviorHints: {
      bingeGroup:
        "SatLinkCinema|" +
        item.language +
        "|" +
        item.parsedTitle.resolution +
        "|" +
        item.parsedTitle.source,
      videoSize: item.size,
      filename: item.name,
    },
    titles: item.titles,
    parsedTitle: item.cleanedItemTitle,
    protected: item.protected,
  };
};

const shouldIncludeResult = (item, showInfo) => {
  if (item.protected) return false;
  if (!item.strongMatch && !item.weakMatch) return false;
  
  if (
    item.itemTitleYear &&
    item.titleYear &&
    item.itemTitleYear != "" &&
    item.titleYear != ""
  ) {
    const yearDiff = Math.abs(
      parseInt(item.itemTitleYear, 10) - parseInt(item.titleYear, 10),
    );
    if (yearDiff > 1) return false;
  }

  if (
    showInfo.type == "movie" &&
    item.SeasonEpisode &&
    !["episode", "part"].some((keyword) => {
      return (
        item.behaviorHints.filename.toLowerCase().includes(keyword) &&
        Object.values(item.titles).some((title) => title?.includes(keyword))
      );
    })
  ) {
    return false;
  }

  if (
    showInfo.type == "series" &&
    (item.SeasonEpisode?.season != showInfo.series ||
      item.SeasonEpisode?.episode != showInfo.episode)
  ) {
    return false;
  }

  return true;
};

// UPRAVENÉ: Funkcia na radenie, ktorá uprednostňuje CZ/SK dabing
const compareStreams = (a, b) => {
  const isLanguageA = a.language === 'cs' || a.language === 'sk' || a.behaviorHints.filename.toLowerCase().includes('cz') || a.behaviorHints.filename.toLowerCase().includes('sk');
  const isLanguageB = b.language === 'cs' || b.language === 'sk' || b.behaviorHints.filename.toLowerCase().includes('cz') || b.behaviorHints.filename.toLowerCase().includes('sk');

  // Ak má jeden dabing a druhý nie, ten s dabingom ide hore
  if (isLanguageA && !isLanguageB) return -1;
  if (!isLanguageA && isLanguageB) return 1;

  // Ak majú oba dabing (alebo oba nemajú), radíme podľa kvality a zhody názvu
  if (a.strongMatch && b.strongMatch) {
    if (a.match != b.match) return b.match - a.match;
    if (a.posVotes != b.posVotes) return b.posVotes - a.posVotes;
    return b.behaviorHints.videoSize - a.behaviorHints.videoSize;
  } else if (!a.strongMatch && !b.strongMatch) {
    if (a.match != b.match) return b.match - a.match;
    if (a.fulltextMatch != b.fulltextMatch)
      return b.fulltextMatch - a.fulltextMatch;
    if (a.posVotes != b.posVotes) return b.posVotes - a.posVotes;
    return b.behaviorHints.videoSize - a.behaviorHints.videoSize;
  } else {
    return b.match - a.match;
  }
};

const searchStreams = async (showInfo, token) => {
  const queries = getQueries(showInfo);

  const searchStartMs = performance.now();
  let results = await Promise.all(
    queries.map((query) => wsSearch(query, token)),
  );
  const searchDurationMs = Math.round(performance.now() - searchStartMs);
  console.log(`Executing all search queries: ${searchDurationMs}ms`);

  results = Object.values(
    results.flat().reduce((acc, item) => {
      acc[item.ident] = item;
      return acc;
    }, {}),
  );

  return results
    .map((item) => {
      const enhanced = enhanceItem(item, showInfo);
      const matchScores = calculateMatchScores(enhanced);
      return mapToStream(enhanced, matchScores, token);
    })
    .filter((item) => shouldIncludeResult(item, showInfo))
    .sort(compareStreams) // Použije nové radenie s prioritou dabingu
    .slice(0, 100);
};

module.exports = {
  searchStreams,
  compareStreams,
};
