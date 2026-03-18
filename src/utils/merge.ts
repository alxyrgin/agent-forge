/**
 * Sectional merge for Markdown files.
 *
 * Parses Markdown into sections delimited by `## ` headers and
 * merges framework (template) sections with user-defined sections
 * so that `agent-forge update` preserves custom content.
 */

export interface Section {
  header: string; // full header line, e.g. "## Agents"
  content: string; // everything after header until next ## or EOF
}

export interface ParsedMarkdown {
  preamble: string; // # title + content before the first ##
  sections: Section[];
}

/**
 * Parses Markdown into a preamble and an array of `## ` sections.
 *
 * Only `## ` (exactly two hashes followed by a space) is treated as
 * a section delimiter.  `#`, `###`, `####` etc. are NOT delimiters
 * and stay inside the section they belong to.
 */
export function parseSections(markdown: string): ParsedMarkdown {
  const lines = markdown.split('\n');

  let preamble = '';
  const sections: Section[] = [];
  let currentHeader: string | null = null;
  let currentContent = '';
  let foundFirstSection = false;

  for (const line of lines) {
    // Match lines that start with exactly "## " (not "# ", "### ", etc.)
    if (/^## /.test(line)) {
      if (foundFirstSection && currentHeader !== null) {
        sections.push({ header: currentHeader, content: currentContent });
      }

      if (!foundFirstSection) {
        // Everything accumulated so far is the preamble
        preamble = currentContent;
        foundFirstSection = true;
        currentContent = '';
      }

      currentHeader = line;
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }

  // Flush the last section (or preamble if no sections found)
  if (foundFirstSection && currentHeader !== null) {
    sections.push({ header: currentHeader, content: currentContent });
  } else {
    preamble = currentContent;
  }

  return { preamble, sections };
}

/**
 * Normalises a `## ` header for comparison purposes.
 * Strips the leading `## `, trims whitespace and lowercases.
 */
function normalizeHeader(header: string): string {
  return header.replace(/^##\s+/, '').trim().toLowerCase();
}

/**
 * Merges an existing Markdown file with a template.
 *
 * Algorithm:
 * 1. Parse both `existing` and `template` into sections.
 * 2. Build a Set of normalised template headers.
 * 3. Identify *user sections* — sections present in `existing`
 *    whose normalised headers are NOT in the template set.
 * 4. Result = template preamble + all template sections +
 *    user sections appended at the end.
 *
 * If `existing` is empty or has no `## ` sections the template is
 * returned as-is.
 */
export function mergeSections(existing: string, template: string): string {
  if (!existing || !existing.trim()) {
    return template;
  }

  const parsedExisting = parseSections(existing);
  const parsedTemplate = parseSections(template);

  // If existing has no sections — nothing to preserve, return template
  if (parsedExisting.sections.length === 0) {
    return template;
  }

  // Set of normalised template headers
  const templateHeaders = new Set(
    parsedTemplate.sections.map((s) => normalizeHeader(s.header)),
  );

  // User sections: present in existing but absent from template
  const userSections = parsedExisting.sections.filter(
    (s) => !templateHeaders.has(normalizeHeader(s.header)),
  );

  // Assemble result
  let result = parsedTemplate.preamble;

  for (const section of parsedTemplate.sections) {
    result += section.header + '\n';
    result += section.content;
  }

  for (const section of userSections) {
    result += section.header + '\n';
    result += section.content;
  }

  return result;
}
