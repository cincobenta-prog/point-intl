/**
 * AI Memorial Stanza & Poem Engine
 * Transforms conversational voice transcripts and prose reflections
 * into dignified 4-line poetic memorial stanzas suited for the Keepsake Coffee Table Volume.
 */

export interface FormattedPoemResult {
  stanzas: string[];
  lines: string[];
  fullText: string;
  signature: string;
  wordCount: number;
}

export function formatIntoPoeticStanzas(
  rawTranscript: string,
  contributorName: string,
  relationship: string
): FormattedPoemResult {
  if (!rawTranscript || rawTranscript.trim().length === 0) {
    return {
      stanzas: [
        'A memory held softly in the quiet chambers of the heart,',
        'A presence that remains though seasons turn and shadows part,',
        'In every prayer whispered and every story gently told,',
        'A radiant legacy more precious than silver and gold.'
      ],
      lines: [
        'A memory held softly in the quiet chambers of the heart,',
        'A presence that remains though seasons turn and shadows part,',
        'In every prayer whispered and every story gently told,',
        'A radiant legacy more precious than silver and gold.'
      ],
      fullText: 'A memory held softly in the quiet chambers of the heart,\nA presence that remains though seasons turn and shadows part,\nIn every prayer whispered and every story gently told,\nA radiant legacy more precious than silver and gold.',
      signature: `— ${contributorName || 'Family & Friends'}${relationship ? `, ${relationship}` : ''}`,
      wordCount: 32
    };
  }

  // 1. Remove spoken filler phrases and clean whitespace
  let cleaned = rawTranscript
    .replace(/\b(um|uh|like|you know|sort of|kind of|i guess|basically|actually)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Split into sentences by punctuation
  const rawSentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const lines: string[] = [];

  for (const sentence of rawSentences) {
    // Strip trailing punctuation for clean poetic comma endings
    const coreSentence = sentence.replace(/[.!?]+$/, '').trim();
    const words = coreSentence.split(' ');

    if (words.length > 10) {
      // Break longer sentence into 2 balanced cadences
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(' ');
      const line2 = words.slice(mid).join(' ');
      
      lines.push(capitalizeFirst(line1) + ',');
      lines.push(capitalizeFirst(line2) + ',');
    } else {
      lines.push(capitalizeFirst(coreSentence) + ',');
    }
  }

  // Ensure last line ends with a dignified period
  if (lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,+$/, '') + '.';
  }

  // If too short, enhance with a reflective closing cadence
  if (lines.length === 1) {
    lines.push('A sacred memory that time itself will never erase,');
    lines.push('Carried forward forever with enduring gratitude and grace.');
  } else if (lines.length === 2) {
    lines.push('Held close in every quiet thought and remembrance,');
    lines.push('A guiding beacon shining through the distance.');
  }

  // Group lines into stanzas of up to 4 lines
  const stanzas: string[] = [];
  for (let i = 0; i < lines.length; i += 4) {
    const chunk = lines.slice(i, i + 4);
    stanzas.push(chunk.join('\n'));
  }

  const signature = `— ${contributorName || 'Contributor'}${relationship ? `, ${relationship}` : ''}`;
  const fullText = lines.join('\n');
  const wordCount = cleaned.split(/\s+/).length;

  return {
    stanzas,
    lines,
    fullText,
    signature,
    wordCount
  };
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
