export type SongLine = { chords: string; lyrics?: string };
export type SongSection = { title: string; lines: SongLine[] };
export type Song = {
  id: string;
  title: string;
  artist: string;
  source: string;
  chords: string[];
  sections: SongSection[];
};

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
