const SECTION_PATTERNS = [
  { key: 'preliminary', label: 'Preliminary pages', terms: ['cover page','title page','declaration','certification','approval','dedication','acknowledgement','acknowledgment','abstract','table of contents','list of figures','list of tables','list of abbreviations'] },
  { key: 'chapter1', label: 'Chapter One: Introduction', terms: ['introduction','background of the organization','background of the study','organization profile','company profile','problem statement','objectives','scope of the report','significance of the study'] },
  { key: 'chapter2', label: 'Chapter Two: Literature / Organization', terms: ['literature review','theoretical framework','conceptual framework','organizational structure','organization structure','department structure'] },
  { key: 'chapter3', label: 'Chapter Three: Activities and Methodology', terms: ['methodology','activities performed','work performed','tasks performed','duties and responsibilities','tools and equipment','materials and equipment','work procedures','practical activities'] },
  { key: 'chapter4', label: 'Chapter Four: Results and Discussion', terms: ['results','findings','discussion','experience gained','skills acquired','challenges encountered','problems encountered'] },
  { key: 'chapter5', label: 'Chapter Five: Conclusion and Recommendations', terms: ['conclusion','recommendations','suggestions'] },
  { key: 'references', label: 'References', terms: ['references','bibliography','works cited'] },
  { key: 'appendices', label: 'Appendices', terms: ['appendix','appendices','attachments'] }
];

const clean = value => value.replace(/\s+/g, ' ').replace(/[•▪◦]+/g, '').trim();
const isPageMarker = line => /^---\s*PAGE\s+\d+\s*---$/i.test(line);
const isNumberedHeading = line => /^(?:(?:CHAPTER\s+[IVX0-9]+)|(?:\d+(?:\.\d+){0,4})|(?:[IVX]+\.)|(?:[A-Z]\.)|(?:PART\s+[IVX0-9]+))\s*[:.)-]?\s+\S/i.test(line);
const isKnownHeading = line => {
  const value = line.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  return SECTION_PATTERNS.some(section => section.terms.some(term => value === term || value.startsWith(term + ' ')));
};

function classifyHeading(line) {
  const value = line.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  for (const section of SECTION_PATTERNS) {
    if (section.terms.some(term => value === term || value.startsWith(term + ' '))) return section;
  }
  if (/^chapter\s+(one|two|three|four|five|six|[ivx0-9]+)/i.test(line)) {
    const match = line.match(/^chapter\s+(one|two|three|four|five|six|[ivx0-9]+)/i);
    return { key: 'chapter', label: clean(line), terms: [] };
  }
  return { key: 'other', label: clean(line), terms: [] };
}

function scoreHeading(line) {
  let score = 0;
  if (isNumberedHeading(line)) score += 3;
  if (isKnownHeading(line)) score += 5;
  if (line.length > 110) score -= 4;
  if (/[.!?]$/.test(line)) score -= 2;
  if (line.split(' ').length > 16) score -= 2;
  if (line === line.toUpperCase() && /[A-Z]/.test(line)) score += 1;
  return score;
}

export function analyseReferenceDocuments(documents) {
  const found = [];
  const documentSummaries = [];
  const fullText = documents.map(doc => doc.text || '').join('\n');
  for (const document of documents) {
    const lines = (document.text || '').split(/\r?\n/).map(clean).filter(line => line && !isPageMarker(line));
    const local = [];
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const score = scoreHeading(line);
      if (score >= 4 && line.length <= 140) {
        const next = lines[index + 1] || '';
        const item = { title: line, category: classifyHeading(line).label, score, source: document.name, pageContext: next.slice(0, 160) };
        if (!local.some(existing => existing.title.toLowerCase() === line.toLowerCase())) local.push(item);
      }
    }
    documentSummaries.push({ name: document.name, headings: local.length, characters: (document.text || '').length });
    found.push(...local);
  }

  const unique = [];
  const seen = new Set();
  for (const item of found) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (key && !seen.has(key)) { seen.add(key); unique.push(item); }
  }
  unique.sort((a, b) => b.score - a.score);
  const detected = SECTION_PATTERNS.map(section => ({
    ...section,
    matched: unique.filter(item => section.terms.some(term => item.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').includes(term))).map(item => item.title)
  })).filter(section => section.matched.length);
  const recommended = SECTION_PATTERNS.map(section => ({
    id: section.key,
    title: section.label,
    included: true,
    sourceMatches: detected.find(item => item.key === section.key)?.matched || []
  }));
  return {
    documentCount: documents.length,
    totalCharacters: fullText.length,
    headings: unique.slice(0, 100),
    detectedSections: detected,
    recommendedOutline: recommended,
    documentSummaries,
    limitations: 'This is deterministic text and heading analysis, not AI understanding. Formatting stored only in images, scanned pages, and complex Word layouts may not be detected.'
  };
}
