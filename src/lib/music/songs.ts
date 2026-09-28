export type SongLine = { chords: string; lyrics?: string };
export type SongSection = { title: string; lines: SongLine[] };
export type Song = {
  id: string;
  title: string;
  artist: string;
  source: string;
  note?: string;
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

/** Wrap both rows at the same character offset, never cutting a chord button. */
export function wrapSongLine(tokens: SongToken[], lyrics = "", columns = 40) {
  const chords = tokens.map((token) => token.text).join("");
  let position = 0;
  const spans = tokens.map((token) => {
    const start = position;
    position += token.text.length;
    return { token, start, end: position };
  });
  const length = Math.max(chords.length, lyrics.length);
  const rows: { offset: number; tokens: SongToken[]; lyrics: string }[] = [];
  const capacity = Math.max(8, Math.floor(columns));
  const safe = (at: number) =>
    !spans.some(
      ({ token, start, end }) => token.symbol && start < at && at < end,
    );
  for (let start = 0; start < length; ) {
    let end = Math.min(start + capacity, length);
    if (end < length) {
      while (end > start && !safe(end)) end--;
      // Prefer a lyric word boundary, then a hyphen in a long sung syllable.
      let boundary = 0;
      for (const separator of [/\s/, /-/]) {
        for (let at = end; at > start + capacity / 2; at--) {
          if (safe(at) && separator.test(lyrics[at - 1] ?? "")) {
            boundary = at;
            break;
          }
        }
        if (boundary) break;
      }
      if (boundary) end = boundary;
    }
    rows.push({
      offset: start,
      tokens: spans
        .filter((span) => span.end > start && span.start < end)
        .map(({ token, start: from, end: to }) => ({
          ...token,
          text: token.text.slice(
            Math.max(0, start - from),
            Math.min(to, end) - from,
          ),
        })),
      lyrics: lyrics.slice(start, end),
    });
    start = end;
  }
  return rows;
}

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

const hallelujahChorus: SongLine[] = [
  {
    chords: "     F           Am          F           C    G   C      Am C Am",
    lyrics: "Hallelujah, hallelujah, hallelujah, hallelu-u-u-u-jah ....",
  },
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
  {
    id: "hallelujah",
    title: "Hallelujah",
    artist: "Jeff Buckley",
    source: "Your uploaded chord chart",
    note: "Chart note: no capo for the original studio version; capo 1 for the official video. Diagrams show uncapoed shapes.",
    chords: ["C", "Am", "F", "G", "E7"],
    sections: [
      { title: "Intro", lines: [{ chords: "C Am C Am" }] },
      {
        title: "Verse 1",
        lines: [
          {
            chords: "  C                 Am",
            lyrics: "I heard there was a secret chord",
          },
          {
            chords: "     C                   Am",
            lyrics: "That David played and it pleased the Lord",
          },
          {
            chords: "    F                          G      C        G",
            lyrics: "But you don't really care for music, do you?",
          },
          {
            chords: "        C                  F           G",
            lyrics: "Well it goes like this the fourth, the fifth",
          },
          {
            chords: "    Am                 F",
            lyrics: "The minor fall and the major lift",
          },
          {
            chords: "    G               E7          Am",
            lyrics: "The baffled king composing hallelujah",
          },
        ],
      },
      { title: "Chorus", lines: hallelujahChorus },
      {
        title: "Verse 2",
        lines: [
          {
            chords: "           C                        Am",
            lyrics: "Well, your faith was strong but you needed proof",
          },
          {
            chords: "    C               Am",
            lyrics: "You saw her bathing on the roof",
          },
          {
            chords: "    F                         G   C            G",
            lyrics: "Her beauty and the moonlight overthrew you",
          },
          {
            chords: "    C               F       G",
            lyrics: "She tied you to her kitchen chair",
          },
          {
            chords: "    Am                        F",
            lyrics: "She broke your throne and she cut your hair",
          },
          {
            chords: "    G                  E7            Am",
            lyrics: "And from your lips she drew the hallelujah",
          },
        ],
      },
      { title: "Chorus", lines: hallelujahChorus },
      {
        title: "Verse 3",
        lines: [
          {
            chords: "C               Am",
            lyrics: "Baby, I've been here before",
          },
          {
            chords: "     C                       Am",
            lyrics: "I've seen this room and I've walked this floor, you know",
          },
          {
            chords: "  F                    G      C          G",
            lyrics: "I used to live alone before I knew you",
          },
          {
            chords: "     C                     F      G",
            lyrics: "I've seen your flag on the marble arch",
          },
          {
            chords: "    Am            F",
            lyrics: "And love is not a victory march",
          },
          {
            chords: "       G               E7          Am",
            lyrics: "It's a cold and it's a broken hallelujah",
          },
        ],
      },
      { title: "Chorus", lines: hallelujahChorus },
      {
        title: "Verse 4",
        lines: [
          {
            chords: "            C                   Am",
            lyrics: "Well, there was a time when you let me know",
          },
          {
            chords: "       C            Am",
            lyrics: "What's really going on below",
          },
          {
            chords: "    F                       G     C        G",
            lyrics: "But now you never show that to me do you",
          },
          {
            chords: "      C             F        G",
            lyrics: "But remember when I moved in you",
          },
          {
            chords: "        Am            F",
            lyrics: "And the holy dove was moving too",
          },
          {
            chords: "    G               E7            Am",
            lyrics: "And every breath we drew was hallelujah",
          },
        ],
      },
      { title: "Chorus", lines: hallelujahChorus },
      {
        title: "Verse 5",
        lines: [
          {
            chords: "      C               Am",
            lyrics: "Well, maybe there's a God above",
          },
          {
            chords: "    C             Am",
            lyrics: "But all I've ever learned from love",
          },
          {
            chords: "    F                     G      C        G",
            lyrics: "Was how to shoot somebody who outdrew you",
          },
          {
            chords: "         C                  F       G",
            lyrics: "And it's not a cry that you hear at night",
          },
          {
            chords: "     Am                 F",
            lyrics: "It's not somebody who's seen the light",
          },
          {
            chords: "       G               E7          Am",
            lyrics: "It's a cold and it's a broken hallelujah",
          },
        ],
      },
      {
        title: "Outro",
        lines: [
          {
            chords: "     F           Am          F           C    G",
            lyrics: "Hallelujah, hallelujah, hallelujah, hallelu-u-u-u ....",
          },
          {
            chords: "     F           Am          F           C    G",
            lyrics: "Hallelujah, hallelujah, hallelujah, hallelu-u-u-u ....",
          },
          {
            chords:
              "     F           Am          F                     G    F    Am   F   Am",
            lyrics:
              "Hallelujah, hallelujah, hallelujah, hallelu-u-u-u-u-u-u-u-u-u-u-u-u-u-u-ujah ....",
          },
          { chords: "     F   G     C", lyrics: "Halleluuuuuuuujah" },
        ],
      },
    ],
  },
];
