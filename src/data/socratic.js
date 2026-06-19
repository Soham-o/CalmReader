export const LOGIC_PROMPT = { q: "Does the conclusion necessarily follow?" };
export const EVIDENCE_PROMPT = { q: "What evidence would make you doubt this?" };
export const VALUES_PROMPT = { q: "What values are being assumed here?" };

export const SOCRATIC_BANK = [
  { q: "What's one assumption this paragraph makes that you hadn't questioned before?" },
  { q: "How would you explain this idea to someone else in a single sentence, without the jargon?" },
  { q: "Where have you personally seen this play out in your own life?" },
  { q: "What would someone who disagrees with this say in response?" },
  { q: "What question does this paragraph leave unanswered for you?" },
  { q: "If this idea is true, what should change about how you act tomorrow?" },
  { q: "What's the weakest part of the reasoning here?" },
  { q: "Does this confirm something you already believed, or complicate it?" },
  { q: "What's an example from outside this text that proves — or disproves — this point?" },
  { q: "What would you ask the author if they were sitting across from you right now?" },
  { q: "Which word in this paragraph carries the most weight, and why that one?" },
  { q: "Is this a fact, an opinion, or something in between?" },
];

export function getPromptForParagraph(text, idx, offset) {
  const lower = text.toLowerCase();
  if (/\b(because|therefore|thus|hence)\b/.test(lower)) return LOGIC_PROMPT;
  if (/\b(study|studies|research|data|evidence|survey|experiment)\b/.test(lower)) return EVIDENCE_PROMPT;
  if (/\b(should|must|ought)\b/.test(lower)) return VALUES_PROMPT;
  return SOCRATIC_BANK[(idx + offset) % SOCRATIC_BANK.length];
}
