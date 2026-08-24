/**
 * Quantum Parameter Content Parser & AST Engine (Member Client)
 */

export const NODE_TYPES = {
  SECTION: "section",
  HEADING: "heading",
  SUB_HEADING: "subHeading",
  BULLET: "bullet",
  SUB_BULLET: "subBullet",
  PARAGRAPH: "paragraph",
  RECOMMENDATION: "recommendation",
  PRECAUTION: "precaution",
  OBSERVATION: "observation",
  RISK: "risk",
  BENEFIT: "benefit",
  DIET: "diet",
  NOTE: "note",
};

export function cleanLine(line) {
  return (line || "").replace(/[\r\t]+/g, " ").trim();
}

export function inferCategoryTag(title) {
  const upper = (title || "").toUpperCase();
  if (
    upper.includes("PROBLEM") ||
    upper.includes("ISSUE") ||
    upper.includes("FINDING") ||
    upper.includes("OBSERVATION") ||
    upper.includes("SYMPTOM") ||
    upper.includes("लक्षण") ||
    upper.includes("समस्या")
  ) {
    return "PROBLEM";
  }
  if (
    upper.includes("CAUSE") ||
    upper.includes("FACTOR") ||
    upper.includes("REASON") ||
    upper.includes("ETIOLOGY") ||
    upper.includes("कारण") ||
    upper.includes("हेतु")
  ) {
    return "CAUSE";
  }
  if (
    upper.includes("PRECAUTION") ||
    upper.includes("WARNING") ||
    upper.includes("RISK") ||
    upper.includes("सावधानी") ||
    upper.includes("चेतावनी")
  ) {
    return "PRECAUTION";
  }
  if (
    upper.includes("YOGA") ||
    upper.includes("PRANAYAM") ||
    upper.includes("ASANA") ||
    upper.includes("EXERCISE") ||
    upper.includes("योग") ||
    upper.includes("प्राणायाम") ||
    upper.includes("आसन")
  ) {
    return "YOGA";
  }
  if (
    upper.includes("PATHYA") ||
    upper.includes("DO'S") ||
    upper.includes("DOS") ||
    upper.includes("RECOMMEND") ||
    upper.includes("EAT") ||
    upper.includes("पथ्य") ||
    upper.includes("क्या खाएं")
  ) {
    return "PATHYA";
  }
  if (
    upper.includes("APATHYA") ||
    upper.includes("PARHEJ") ||
    upper.includes("DON'T") ||
    upper.includes("DONTS") ||
    upper.includes("AVOID") ||
    upper.includes("अपथ्य") ||
    upper.includes("परहेज") ||
    upper.includes("क्या न खाएं")
  ) {
    return "PARHEJ";
  }
  if (
    upper.includes("AYURVED") ||
    upper.includes("SOLUTION") ||
    upper.includes("REMEDY") ||
    upper.includes("MEDICINE") ||
    upper.includes("HERB") ||
    upper.includes("AUSHADH") ||
    upper.includes("SUPPLEMENT") ||
    upper.includes("उपचार") ||
    upper.includes("औषध") ||
    upper.includes("समाधान")
  ) {
    return "MEDICINE";
  }
  if (
    upper.includes("DIET") ||
    upper.includes("AAHAR") ||
    upper.includes("LIFESTYLE") ||
    upper.includes("MEAL") ||
    upper.includes("आहार") ||
    upper.includes("दिनचर्या")
  ) {
    return "DIET";
  }
  if (
    upper.includes("DEFINITION") ||
    upper.includes("OVERVIEW") ||
    upper.includes("INTRODUCTION") ||
    upper.includes("REPORT") ||
    upper.includes("अवलोकन")
  ) {
    return "REPORT";
  }
  return "GENERAL";
}

export function parseContent(rawContent, language = "en") {
  if (!rawContent || typeof rawContent !== "string") {
    return [];
  }

  const rawLines = rawContent.split(/\r?\n/);
  const nodes = [];

  let currentSectionId = null;
  let currentSectionTitle = "General Findings";
  let currentSectionCategory = "REPORT";
  let currentParentId = null;
  let sectionIndex = 0;
  let itemCounter = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const cleaned = cleanLine(rawLine);
    if (!cleaned) continue;

    const leadingSpaces = (rawLine.match(/^(\s*)/) || ["", ""])[1].length;

    // Check heading
    const mdMatch = cleaned.match(/^(#{1,6})\s+(.+)$/);
    const numMatch = cleaned.match(/^(\d+|[IVXLCDM]+|[A-Z])[\.\:\)]\s+([A-Z0-9\s\/\-\(\)\,\&]{3,})$/i);
    const colonMatch = cleaned.match(/^([A-Za-z0-9\s\/\-\(\)\,\&]{3,40})\:$/);
    const isHeading = Boolean(mdMatch || (numMatch && leadingSpaces === 0) || (colonMatch && leadingSpaces === 0));

    if (isHeading) {
      sectionIndex++;
      const secId = `sec_${sectionIndex}`;
      const titleText = mdMatch ? mdMatch[2].trim() : numMatch ? `${numMatch[1]}. ${numMatch[2].trim()}` : colonMatch ? colonMatch[1].trim() : cleaned;
      currentSectionId = secId;
      currentSectionTitle = titleText;
      currentSectionCategory = inferCategoryTag(titleText);
      currentParentId = secId;

      nodes.push({
        id: secId,
        parentId: null,
        nodeType: NODE_TYPES.SECTION,
        content: titleText,
        orderIndex: nodes.length + 1,
        level: 0,
        isSelectable: false,
        categoryType: currentSectionCategory,
      });
      continue;
    }

    // Bullet / paragraph
    itemCounter++;
    if (!currentSectionId) {
      sectionIndex++;
      currentSectionId = `sec_${sectionIndex}`;
      currentSectionTitle = language === "hi" ? "अवलोकन" : "Overview";
      currentSectionCategory = "REPORT";
      currentParentId = currentSectionId;

      nodes.push({
        id: currentSectionId,
        parentId: null,
        nodeType: NODE_TYPES.SECTION,
        content: currentSectionTitle,
        orderIndex: nodes.length + 1,
        level: 0,
        isSelectable: false,
        categoryType: currentSectionCategory,
      });
    }

    const bulletSymbolMatch = cleaned.match(/^[\*\-\+\•\⁃\▪\▫\→\✔\✓]\s+(.+)$/);
    const isSub = leadingSpaces >= 2;

    if (bulletSymbolMatch) {
      nodes.push({
        id: `node_${sectionIndex}_${itemCounter}`,
        parentId: currentParentId,
        nodeType: isSub ? NODE_TYPES.SUB_BULLET : NODE_TYPES.BULLET,
        content: bulletSymbolMatch[1].trim(),
        orderIndex: nodes.length + 1,
        level: isSub ? 2 : 1,
        isSelectable: true,
        defaultSelected: true,
        categoryType: currentSectionCategory,
      });
    } else {
      nodes.push({
        id: `para_${sectionIndex}_${itemCounter}`,
        parentId: currentParentId,
        nodeType: NODE_TYPES.PARAGRAPH,
        content: cleaned,
        orderIndex: nodes.length + 1,
        level: 1,
        isSelectable: true,
        defaultSelected: true,
        categoryType: currentSectionCategory,
      });
    }
  }

  return nodes;
}
