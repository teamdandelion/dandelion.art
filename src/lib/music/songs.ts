import type { Song, SongLine } from "./song";
import flyMeToTheMoon from "./songs/fly-me-to-the-moon.ts";
import heyThereDelilah from "./songs/hey-there-delilah.ts";
import stitches from "./songs/stitches.ts";

// Practice charts transcribed from the supplied PDFs. Chords anchor to lyric segments.
const oceanEyesChorus: SongLine[] = [
  {
    segments: [
      { text: "No " },
      { chord: "C", text: "fa" },
      { chord: "Dsus2", text: "ir" },
      { chord: "Em", text: "" },
      { chord: "C", text: "" },
      { chord: "Dsus2", text: "" },
      { chord: "Em", text: "" },
    ],
  },
  {
    segments: [
      { text: "You really " },
      { chord: "C", text: "know how to " },
      { chord: "Dsus2", text: "make me " },
      { chord: "Em", text: "cry" },
    ],
  },
  {
    segments: [
      { text: "When you gimme those " },
      { chord: "G", text: "oc" },
      { chord: "G/B", text: "ean " },
      { chord: "C", text: "eyes" },
    ],
  },
  {
    segments: [
      { text: "I'm " },
      { chord: "C", text: "sc" },
      { chord: "Dsus2", text: "ared" },
      { chord: "Em", text: "" },
      { chord: "C", text: "" },
      { chord: "Dsus2", text: "" },
      { chord: "Em", text: "" },
    ],
  },
  {
    segments: [
      { text: "I've never " },
      { chord: "C", text: "fallen from " },
      { chord: "Dsus2", text: "quite this " },
      { chord: "Em", text: "high" },
    ],
  },
  {
    segments: [
      { text: "Falling into your " },
      { chord: "G", text: "oc" },
      { chord: "G/B", text: "ean " },
      { chord: "C", text: "eyes" },
    ],
  },
  {
    segments: [
      { text: "Those " },
      { chord: "G", text: "oc" },
      { chord: "G/B", text: "ean " },
      { chord: "C", text: "eyes" },
    ],
  },
];

const hallelujahChorus: SongLine[] = [
  {
    segments: [
      { text: "Halle" },
      { chord: "F", text: "lujah, halle" },
      { chord: "Am", text: "lujah, halle" },
      { chord: "F", text: "lujah, halle" },
      { chord: "C", text: "lu-u-" },
      { chord: "G", text: "u-u-" },
      { chord: "C", text: "jah ..." },
      { chord: "Am", text: "." },
      { chord: "C", text: "" },
      { chord: "Am", text: "" },
    ],
  },
];

export const SONGS: Song[] = [
  {
    id: "ocean-eyes",
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    source: "Your uploaded chord chart",
    sections: [
      {
        title: "Intro",
        lines: [
          {
            segments: [
              { chord: "C", text: "" },
              { chord: "Dsus2", text: "" },
              { chord: "Em", text: "" },
              { text: "(×3)" },
            ],
          },
          {
            segments: [
              { chord: "G", text: "" },
              { chord: "G/B", text: "" },
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
              { chord: "C", text: "I’ve " },
              { chord: "Dsus2", text: "been w" },
              { chord: "Em", text: "atching you f" },
              { chord: "C", text: "or s" },
              { chord: "Dsus2", text: "ome ti" },
              { chord: "Em", text: "me" },
            ],
          },
          {
            segments: [
              { chord: "C", text: "Can’t " },
              { chord: "Dsus2", text: "stop s" },
              { chord: "Em", text: "taring at those o" },
              { chord: "G", text: "ce" },
              { chord: "G/B", text: "an e" },
              { chord: "C", text: "yes" },
            ],
          },
          {
            segments: [
              { chord: "C", text: "Bur" },
              { chord: "Dsus2", text: "ning c" },
              { chord: "Em", text: "ities and n" },
              { chord: "C", text: "ap" },
              { chord: "Dsus2", text: "alm sk" },
              { chord: "Em", text: "ies" },
            ],
          },
          {
            segments: [
              { chord: "C", text: "Fif" },
              { chord: "Dsus2", text: "teen f" },
              { chord: "Em", text: "lares inside those o" },
              { chord: "G", text: "ce" },
              { chord: "G/B", text: "an e" },
              { chord: "C", text: "yes" },
            ],
          },
          {
            segments: [
              { text: "Your " },
              { chord: "G", text: "oc" },
              { chord: "G/B", text: "ean " },
              { chord: "C", text: "eyes" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: oceanEyesChorus,
      },
      {
        title: "Verse 2",
        lines: [
          {
            segments: [
              { chord: "C", text: "I've " },
              { chord: "Dsus2", text: "been w" },
              { chord: "Em", text: "alking through a w" },
              { chord: "C", text: "orld g" },
              { chord: "Dsus2", text: "one bl" },
              { chord: "Em", text: "ind" },
            ],
          },
          {
            segments: [
              { chord: "C", text: "Can't " },
              { chord: "Dsus2", text: "stop t" },
              { chord: "Em", text: "hinking of your d" },
              { chord: "G", text: "iamo" },
              { chord: "G/B", text: "nd m" },
              { chord: "C", text: "ind" },
            ],
          },
          {
            segments: [
              { chord: "C", text: "Care" },
              { chord: "Dsus2", text: "ful cr" },
              { chord: "Em", text: "eature made fr" },
              { chord: "C", text: "iends wi" },
              { chord: "Dsus2", text: "th tim" },
              { chord: "Em", text: "e" },
            ],
          },
          {
            segments: [
              { text: "He " },
              { chord: "C", text: "left " },
              { chord: "Dsus2", text: "her lo" },
              { chord: "Em", text: "nely with a di" },
              { chord: "G", text: "amon" },
              { chord: "G/B", text: "d mi" },
              { chord: "C", text: "nd" },
            ],
          },
          {
            segments: [
              { text: "And those " },
              { chord: "G", text: "oc" },
              { chord: "G/B", text: "ean " },
              { chord: "C", text: "eyes" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: oceanEyesChorus,
      },
      {
        title: "Instrumental",
        lines: [
          {
            segments: [
              { chord: "C", text: "" },
              { chord: "Dsus2", text: "" },
              { chord: "Em", text: "" },
              { text: "(×3)" },
            ],
          },
          {
            segments: [
              { chord: "G", text: "" },
              { chord: "G/B", text: "" },
              { chord: "C", text: "" },
            ],
          },
          {
            segments: [
              { chord: "C", text: "" },
              { chord: "Dsus2", text: "" },
              { chord: "Em", text: "" },
              { text: "(×3)" },
            ],
          },
          {
            segments: [
              { chord: "G", text: "" },
              { chord: "G/B", text: "" },
              { chord: "C", text: "" },
              { chord: "G", text: "" },
              { chord: "G/B", text: "" },
              { chord: "C", text: "" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: oceanEyesChorus,
      },
    ],
  },
  {
    id: "hallelujah",
    title: "Hallelujah",
    artist: "Jeff Buckley",
    source: "Your uploaded chord chart",
    note: "Chart note: no capo for the original studio version; capo 1 for the official video. Diagrams show uncapoed shapes.",
    sections: [
      {
        title: "Intro",
        lines: [
          {
            segments: [
              { chord: "C", text: "" },
              { chord: "Am", text: "" },
              { chord: "C", text: "" },
              { chord: "Am", text: "" },
            ],
          },
        ],
      },
      {
        title: "Verse 1",
        lines: [
          {
            segments: [
              { text: "I " },
              { chord: "C", text: "heard there was a " },
              { chord: "Am", text: "secret chord" },
            ],
          },
          {
            segments: [
              { text: "That " },
              { chord: "C", text: "David played and it " },
              { chord: "Am", text: "pleased the Lord" },
            ],
          },
          {
            segments: [
              { text: "But " },
              { chord: "F", text: "you don't really care for m" },
              { chord: "G", text: "usic, d" },
              { chord: "C", text: "o you?" },
              { chord: "G", text: "" },
            ],
          },
          {
            segments: [
              { text: "Well it " },
              { chord: "C", text: "goes like this the " },
              { chord: "F", text: "fourth, the " },
              { chord: "G", text: "fifth" },
            ],
          },
          {
            segments: [
              { text: "The " },
              { chord: "Am", text: "minor fall and the " },
              { chord: "F", text: "major lift" },
            ],
          },
          {
            segments: [
              { text: "The " },
              { chord: "G", text: "baffled king com" },
              { chord: "E7", text: "posing halle" },
              { chord: "Am", text: "lujah" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: hallelujahChorus,
      },
      {
        title: "Verse 2",
        lines: [
          {
            segments: [
              { text: "Well, your " },
              { chord: "C", text: "faith was strong but you " },
              { chord: "Am", text: "needed proof" },
            ],
          },
          {
            segments: [
              { text: "You " },
              { chord: "C", text: "saw her bathing " },
              { chord: "Am", text: "on the roof" },
            ],
          },
          {
            segments: [
              { text: "Her " },
              { chord: "F", text: "beauty and the moonlight o" },
              { chord: "G", text: "vert" },
              { chord: "C", text: "hrew you" },
              { chord: "G", text: "" },
            ],
          },
          {
            segments: [
              { text: "She " },
              { chord: "C", text: "tied you to her " },
              { chord: "F", text: "kitchen " },
              { chord: "G", text: "chair" },
            ],
          },
          {
            segments: [
              { text: "She " },
              { chord: "Am", text: "broke your throne and she " },
              { chord: "F", text: "cut your hair" },
            ],
          },
          {
            segments: [
              { text: "And " },
              { chord: "G", text: "from your lips she " },
              { chord: "E7", text: "drew the halle" },
              { chord: "Am", text: "lujah" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: hallelujahChorus,
      },
      {
        title: "Verse 3",
        lines: [
          {
            segments: [
              { chord: "C", text: "Baby, I've been " },
              { chord: "Am", text: "here before" },
            ],
          },
          {
            segments: [
              { text: "I've " },
              { chord: "C", text: "seen this room and I've " },
              { chord: "Am", text: "walked this floor, you know" },
            ],
          },
          {
            segments: [
              { text: "I " },
              { chord: "F", text: "used to live alone be" },
              { chord: "G", text: "fore I " },
              { chord: "C", text: "knew you" },
              { chord: "G", text: "" },
            ],
          },
          {
            segments: [
              { text: "I've " },
              { chord: "C", text: "seen your flag on the " },
              { chord: "F", text: "marble " },
              { chord: "G", text: "arch" },
            ],
          },
          {
            segments: [
              { text: "And " },
              { chord: "Am", text: "love is not a " },
              { chord: "F", text: "victory march" },
            ],
          },
          {
            segments: [
              { text: "It's a " },
              { chord: "G", text: "cold and it's a " },
              { chord: "E7", text: "broken halle" },
              { chord: "Am", text: "lujah" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: hallelujahChorus,
      },
      {
        title: "Verse 4",
        lines: [
          {
            segments: [
              { text: "Well, there " },
              { chord: "C", text: "was a time when you " },
              { chord: "Am", text: "let me know" },
            ],
          },
          {
            segments: [
              { text: "What's " },
              { chord: "C", text: "really going " },
              { chord: "Am", text: "on below" },
            ],
          },
          {
            segments: [
              { text: "But " },
              { chord: "F", text: "now you never show that " },
              { chord: "G", text: "to me " },
              { chord: "C", text: "do you" },
              { chord: "G", text: "" },
            ],
          },
          {
            segments: [
              { text: "But re" },
              { chord: "C", text: "member when I " },
              { chord: "F", text: "moved in " },
              { chord: "G", text: "you" },
            ],
          },
          {
            segments: [
              { text: "And the " },
              { chord: "Am", text: "holy dove was " },
              { chord: "F", text: "moving too" },
            ],
          },
          {
            segments: [
              { text: "And " },
              { chord: "G", text: "every breath we " },
              { chord: "E7", text: "drew was halle" },
              { chord: "Am", text: "lujah" },
            ],
          },
        ],
      },
      {
        title: "Chorus",
        lines: hallelujahChorus,
      },
      {
        title: "Verse 5",
        lines: [
          {
            segments: [
              { text: "Well, " },
              { chord: "C", text: "maybe there's a " },
              { chord: "Am", text: "God above" },
            ],
          },
          {
            segments: [
              { text: "But " },
              { chord: "C", text: "all I've ever " },
              { chord: "Am", text: "learned from love" },
            ],
          },
          {
            segments: [
              { text: "Was " },
              { chord: "F", text: "how to shoot somebody " },
              { chord: "G", text: "who out" },
              { chord: "C", text: "drew you" },
              { chord: "G", text: "" },
            ],
          },
          {
            segments: [
              { text: "And it's " },
              { chord: "C", text: "not a cry that you " },
              { chord: "F", text: "hear at " },
              { chord: "G", text: "night" },
            ],
          },
          {
            segments: [
              { text: "It's " },
              { chord: "Am", text: "not somebody who's " },
              { chord: "F", text: "seen the light" },
            ],
          },
          {
            segments: [
              { text: "It's a " },
              { chord: "G", text: "cold and it's a " },
              { chord: "E7", text: "broken halle" },
              { chord: "Am", text: "lujah" },
            ],
          },
        ],
      },
      {
        title: "Outro",
        lines: [
          {
            segments: [
              { text: "Halle" },
              { chord: "F", text: "lujah, halle" },
              { chord: "Am", text: "lujah, halle" },
              { chord: "F", text: "lujah, halle" },
              { chord: "C", text: "lu-u-" },
              { chord: "G", text: "u-u ...." },
            ],
          },
          {
            segments: [
              { text: "Halle" },
              { chord: "F", text: "lujah, halle" },
              { chord: "Am", text: "lujah, halle" },
              { chord: "F", text: "lujah, halle" },
              { chord: "C", text: "lu-u-" },
              { chord: "G", text: "u-u ...." },
            ],
          },
          {
            segments: [
              { text: "Halle" },
              { chord: "F", text: "lujah, halle" },
              { chord: "Am", text: "lujah, halle" },
              { chord: "F", text: "lujah, hallelu-u-u-u-u" },
              { chord: "G", text: "-u-u-" },
              { chord: "F", text: "u-u-u" },
              { chord: "Am", text: "-u-u-" },
              { chord: "F", text: "u-u-" },
              { chord: "Am", text: "u-ujah ...." },
            ],
          },
          {
            segments: [
              { text: "Halle" },
              { chord: "F", text: "luuu" },
              { chord: "G", text: "uuuuuj" },
              { chord: "C", text: "ah" },
            ],
          },
        ],
      },
    ],
  },
  stitches,
  flyMeToTheMoon,
  heyThereDelilah,
];
