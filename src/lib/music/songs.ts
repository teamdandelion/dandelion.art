export type SongLine = { chords: string; lyrics?: string };
export type SongSection = { title: string; lines: SongLine[] };
export type Song = {
  id: string;
  title: string;
  artist: string;
  source: string;
  chords: string[];
  sections: SongSection[];
  turnaroundVoicings?: {
    instrumentId: string;
    normal: SongVoicing[];
    higher: SongVoicing[];
    higherAt: [number, number, number][];
  };
};
export type SongVoicing = { symbol: string; frets: number[] };
export type SongToken = {
  text: string;
  symbol?: string;
  choiceKey?: string;
  frets?: number[];
};

/** Explicit fret positions survive changes to the voicing enumeration. */
export function songTokens(
  song: Song,
  instrumentId: string,
  section: number,
  line: number,
): SongToken[] {
  const tokens: SongToken[] = song.sections[section].lines[line].chords
    .split(/(\s+)/)
    .map((text) => ({
      text,
      ...(song.chords.includes(text) ? { symbol: text } : {}),
    }));
  const arrangement = song.turnaroundVoicings;
  if (!arrangement || arrangement.instrumentId !== instrumentId) return tokens;
  const notes = tokens
    .map((token, index) => (token.symbol ? index : -1))
    .filter((index) => index >= 0);
  let turnaround = 0;
  for (let i = 0; i < notes.length - 2; i++) {
    const group = notes.slice(i, i + 3);
    if (group.map((index) => tokens[index].symbol).join(" ") !== "G G/B C")
      continue;
    const higher = arrangement.higherAt.some(
      ([s, l, t]) => s === section && l === line && t === turnaround,
    );
    const voicings = higher ? arrangement.higher : arrangement.normal;
    group.forEach((index, offset) => {
      tokens[index] = {
        text: voicings[offset].symbol,
        ...voicings[offset],
        choiceKey: `occurrence:${section}:${line}:${i + offset}`,
      };
    });
    turnaround++;
    i += 2;
  }
  return tokens;
}

// Transcribed from the user's two-page practice PDF; not an official score.
const chorus: SongLine[] = [
  { chords: "   C Dsus2 Em   C Dsus2 Em", lyrics: "No fair" },
  {
    chords: "           C           Dsus2   Em",
    lyrics: "You really know how to make me cry",
  },
  {
    chords: "                     G G/B C",
    lyrics: "When you gimme those ocean eyes",
  },
  { chords: "    C Dsus2 Em   C Dsus2 Em", lyrics: "I'm scared" },
  {
    chords: "           C           Dsus2      Em",
    lyrics: "I've never fallen from quite this high",
  },
  {
    chords: "                  G G/B C",
    lyrics: "Falling into your ocean eyes",
  },
  { chords: "      G G/B C", lyrics: "Those ocean eyes" },
];

export const SONGS: Song[] = [
  {
    id: "ocean-eyes",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    source: "Your uploaded chord chart",
    chords: ["C", "Dsus2", "Em", "G", "G/B"],
    turnaroundVoicings: {
      instrumentId: "baritone-dgbe",
      normal: [
        { symbol: "G", frets: [0, 0, 0, 3] },
        { symbol: "G", frets: [0, 0, 0, 7] },
        { symbol: "C", frets: [2, 0, 1, 0] },
      ],
      higher: [
        { symbol: "G", frets: [0, 0, 0, 7] },
        { symbol: "G", frets: [0, 0, 0, 10] },
        { symbol: "Cmaj7", frets: [10, 12, 12, 12] },
      ],
      // Second halves of consecutive turnarounds: verse/chorus endings and
      // the doubled instrumental line. Isolated turnarounds stay lower.
      higherAt: [
        [1, 4, 0],
        [2, 6, 0],
        [3, 4, 0],
        [4, 6, 0],
        [5, 3, 1],
        [6, 6, 0],
      ],
    },
    sections: [
      {
        title: "Intro",
        lines: [{ chords: "C Dsus2 Em   (×3)" }, { chords: "G G/B C" }],
      },
      {
        title: "Verse 1",
        lines: [
          {
            chords: "C    Dsus2 Em           C   Dsus2 Em",
            lyrics: "I’ve been watching you for some time",
          },
          {
            chords: "C     Dsus2 Em               G G/B C",
            lyrics: "Can’t stop staring at those ocean eyes",
          },
          {
            chords: "C  Dsus2 Em         C Dsus2 Em",
            lyrics: "Burning cities and napalm skies",
          },
          {
            chords: "C  Dsus2 Em                  G G/B C",
            lyrics: "Fifteen flares inside those ocean eyes",
          },
          { chords: "     G G/B C", lyrics: "Your ocean eyes" },
        ],
      },
      { title: "Chorus", lines: chorus },
      {
        title: "Verse 2",
        lines: [
          {
            chords: "C    Dsus2 Em                C     Dsus2 Em",
            lyrics: "I've been walking through a world gone blind",
          },
          {
            chords: "C     Dsus2 Em               G   G/B C",
            lyrics: "Can't stop thinking of your diamond mind",
          },
          {
            chords: "C   Dsus2 Em            C       Dsus2 Em",
            lyrics: "Careful creature made friends with time",
          },
          {
            chords: "   C    Dsus2 Em            G   G/B C",
            lyrics: "He left her lonely with a diamond mind",
          },
          { chords: "          G G/B C", lyrics: "And those ocean eyes" },
        ],
      },
      { title: "Chorus", lines: chorus },
      {
        title: "Instrumental",
        lines: [
          { chords: "C Dsus2 Em   (×3)" },
          { chords: "G G/B C" },
          { chords: "C Dsus2 Em   (×3)" },
          { chords: "G G/B C     G G/B C" },
        ],
      },
      { title: "Chorus", lines: chorus },
    ],
  },
];
