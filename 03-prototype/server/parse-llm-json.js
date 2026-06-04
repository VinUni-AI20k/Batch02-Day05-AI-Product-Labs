/**
 * Trích JSON từ phản hồi LLM (có thể kèm markdown / text giải thích).
 * @param {unknown} text
 * @returns {object|null}
 */
export function parseLlmJson(text) {
  if (text == null) return null;
  const raw = String(text).trim();
  if (!raw) return null;

  const attempts = [raw];

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) attempts.push(fenced[1].trim());

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    attempts.push(raw.slice(start, end + 1));
  }

  for (const candidate of attempts) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object') return value;
    } catch {
      // thử candidate tiếp
    }
  }

  return null;
}
