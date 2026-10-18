import type { Song, SongLine } from "../song";

const preChorus: SongLine[] = [
  {
    segments: [
      { text: "A-" },
      { chord: "Am", text: "ooh, " },
      { chord: "G", text: "ooh, " },
      { chord: "C", text: "ooh" },
    ],
  },
  {
    segments: [
      { text: "A-" },
      { chord: "Am", text: "oh, " },
      { chord: "G", text: "ohoh, and they " },
      { chord: "C", text: "come unstuck" },
    ],
  },
];
const throat: SongLine = {
  segments: [
    { text: "In my " },
    { chord: "Am", text: "throat, 'cause " },
    { chord: "G", text: "you're gonna sing the " },
    { chord: "C", text: "words wrong" },
  ],
};
const chorus: SongLine[] = [
  {
    segments: [
      { chord: "Am", text: "Lady, " },
      { chord: "G", text: "running down to the " },
      { chord: "C", text: "riptide, taken away" },
    ],
  },
  {
    segments: [
      { text: "To the " },
      { chord: "Am", text: "dark side, " },
      { chord: "G", text: "I wanna be your " },
      { chord: "C", text: "left hand man" },
    ],
  },
  {
    segments: [
      { text: "I " },
      { chord: "Am", text: "love you " },
      { chord: "G", text: "when you're singing that " },
      { chord: "C", text: "song, and I got a lump" },
    ],
  },
  throat,
];

const song: Song = {
  id: "riptide",
  title: "Riptide",
  artist: "Vance Joy",
  source: "Your uploaded chord chart",
  sections: [
    {
      title: "Intro",
      lines: [
        {
          segments: [
            { chord: "Am", text: "" },
            { chord: "G", text: "" },
            { chord: "C", text: "" },
            { chord: "C", text: "" },
          ],
        },
        {
          segments: [
            { chord: "Am", text: "" },
            { chord: "G", text: "" },
            { chord: "C", text: "" },
            { chord: "C", text: "" },
          ],
        },
      ],
    },
    {
      title: "Verse 1",
      lines: [
        {
          segments: [
            { chord: "Am", text: "I was scared of " },
            { chord: "G", text: "dentists and the " },
            { chord: "C", text: "dark" },
          ],
        },
        {
          segments: [
            { chord: "Am", text: "I was scared of " },
            { chord: "G", text: "pretty girls and " },
            { chord: "C", text: "starting conversations" },
          ],
        },
        {
          segments: [
            { text: "Oh, " },
            { chord: "Am", text: "all my " },
            { chord: "G", text: "friends are turning " },
            { chord: "C", text: "green" },
          ],
        },
        {
          segments: [
            { text: "You're the " },
            { chord: "Am", text: "magician's " },
            { chord: "G", text: "assistant in their " },
            { chord: "C", text: "dreams" },
          ],
        },
      ],
    },
    { title: "Pre-Chorus", lines: preChorus },
    { title: "Chorus", lines: chorus },
    {
      title: "Verse 2",
      lines: [
        {
          segments: [
            { chord: "Am", text: "There's this movie " },
            { chord: "G", text: "that I think you'll " },
            { chord: "C", text: "like" },
          ],
        },
        {
          segments: [
            { text: "This " },
            { chord: "Am", text: "guy decides to " },
            { chord: "G", text: "quit his job and " },
            { chord: "C", text: "heads to New York City" },
          ],
        },
        {
          segments: [
            { text: "This " },
            { chord: "Am", text: "cowboy's " },
            { chord: "G", text: "running from " },
            { chord: "C", text: "himself" },
          ],
        },
        {
          segments: [
            { text: "And " },
            { chord: "Am", text: "she's been living " },
            { chord: "G", text: "on the highest " },
            { chord: "C", text: "shelf" },
          ],
        },
      ],
    },
    { title: "Pre-Chorus", lines: preChorus },
    { title: "Chorus", lines: chorus },
    // The source has a four-repeat guitar riff over C; this is a chord chart.
    {
      title: "Interlude · C ×4",
      lines: [
        {
          segments: [
            { chord: "C", text: "" },
            { chord: "C", text: "" },
            { chord: "C", text: "" },
            { chord: "C", text: "" },
          ],
        },
      ],
    },
    {
      title: "Bridge",
      lines: [
        {
          segments: [
            { chord: "Am", text: "I just wanna, I just wanna " },
            { chord: "G", text: "know" },
          ],
        },
        {
          segments: [
            { chord: "C", text: "If you're gonna, if you're gonna " },
            { chord: "Fmaj7", text: "stay" },
          ],
        },
        {
          segments: [
            { chord: "Am", text: "I just gotta, I just gotta " },
            { chord: "G", text: "know" },
          ],
        },
        {
          segments: [
            { chord: "C", text: "I can't have it, I can't have it " },
            { chord: "Fmaj7", text: "any other way" },
          ],
        },
      ],
    },
    {
      title: "Pre-Chorus · strum once and hold",
      lines: [
        {
          segments: [
            { text: "I " },
            { chord: "Am", text: "swear she's " },
            { chord: "G", text: "destined for the " },
            { chord: "C", text: "screen" },
          ],
        },
        {
          segments: [
            { chord: "Am", text: "Closest thing to " },
            { chord: "G", text: "Michelle Pfeiffer " },
            { chord: "C", text: "that you've ever seen, oh" },
          ],
        },
      ],
    },
    {
      title: "Chorus",
      lines: [
        ...chorus,
        ...chorus,
        ...chorus.slice(0, 3),
        {
          segments: [
            ...throat.segments.slice(0, -1),
            { chord: "C", text: "words wrong yeah, I got a lump" },
          ],
        },
        throat,
      ],
    },
  ],
};

export default song;
