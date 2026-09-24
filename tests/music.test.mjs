import assert from "node:assert/strict";
import test from "node:test";
import {
  BARITONE,
  bassPitch,
  CHORD_QUALITIES,
  findFingerings,
  formatNote,
  formatPitch,
  GUITAR,
  INSTRUMENTS,
  inversionName,
  KEY_OPTIONS,
  keyChords,
  keyContext,
  keyGraph,
  keyScale,
  makeChord,
  midi,
  parseChord,
  parseNote,
  pianoVoicing,
  pitchClassNumber,
  ROOT_OPTIONS,
  realizeFingering,
  UKULELE,
  voicingCoverage,
} from "../src/lib/music/index.ts";

const pcs = (chord) =>
  [...new Set(chord.tones.map((tone) => pitchClassNumber(tone.note)))].sort(
    (a, b) => a - b,
  );
const notes = (chord) => chord.tones.map((tone) => formatNote(tone.note));

test("chord intent preserves spelling and interval degree, including double flats and ninths", () => {
  assert.deepEqual(notes(makeChord("C", "major")), ["C", "E", "G"]);
  assert.deepEqual(notes(makeChord("D", "6")), ["D", "F♯", "A", "B"]);
  assert.deepEqual(notes(makeChord("C", "dim7")), ["C", "E♭", "G♭", "B♭♭"]);
  assert.deepEqual(notes(makeChord("C#", "major")), ["C♯", "E♯", "G♯"]);
  assert.deepEqual(notes(makeChord("Db", "major")), ["D♭", "F", "A♭"]);
  assert.equal(makeChord("C", "add9").tones.at(-1).degree, 9);
  assert.notEqual(makeChord("C", "6").id, makeChord("A", "m7").id);
  assert.deepEqual(pcs(makeChord("C", "6")), pcs(makeChord("A", "m7")));
});

test("scientific octaves respect written pitches at B/C boundaries", () => {
  assert.equal(midi({ note: parseNote("C"), octave: 4 }), 60);
  assert.equal(midi({ note: parseNote("B#"), octave: 3 }), 60);
  assert.equal(midi({ note: parseNote("Cb"), octave: 4 }), 59);
  assert.equal(midi({ note: parseNote("Bbb"), octave: 3 }), 57);
  assert.equal(
    pitchClassNumber(parseNote("Db")),
    pitchClassNumber(parseNote("C#")),
  );
});

test("lookup accepts supported aliases and refuses unsupported or ambiguous syntax", () => {
  for (const [query, root, quality] of [
    ["C maj", "C", "major"],
    ["D6", "D", "6"],
    ["B♭m7", "Bb", "m7"],
    ["CM7", "C", "maj7"],
    ["F#m7b5", "F#", "m7b5"],
    ["Bø7", "B", "m7b5"],
  ]) {
    assert.equal(parseChord(query)?.id, makeChord(root, quality).id);
  }
  for (const query of [
    "",
    "H7",
    "C13",
    "C/E",
    "Dminor9",
    "CtoString",
    "Cconstructor",
    "C#b7",
  ])
    assert.equal(parseChord(query), null);
});

test("canonical baritone C maps its individual strings to a doubled, inverted voicing", () => {
  const chord = makeChord("C", "major");
  const shape = findFingerings(chord)[0];
  assert.deepEqual(shape.frets, [2, 0, 1, 0]);
  assert.equal(shape.source, "library");
  assert.deepEqual(shape.fingers, [2, null, 1, null]);
  assert.deepEqual(
    shape.voicing.voices.map((voice) => formatPitch(voice.pitch)),
    ["E3", "G3", "C4", "E4"],
  );
  assert.equal(inversionName(shape.voicing, chord), "First inversion");
  assert.deepEqual(voicingCoverage(shape.voicing, chord), {
    present: [1, 3, 5],
    omitted: [],
    doubled: [3],
  });
  for (const string of shape.strings)
    assert.ok(
      shape.voicing.voices.some((voice) => voice.id === string.voiceId),
    );
});

test("inversion is determined by pitch, not array order or the first instrument string", () => {
  const chord = makeChord("C", "major");
  const voicing = {
    id: "example",
    chordId: chord.id,
    voices: [
      { id: "a", pitch: { note: parseNote("C"), octave: 4 }, toneDegree: 1 },
      { id: "b", pitch: { note: parseNote("E"), octave: 3 }, toneDegree: 3 },
      { id: "c", pitch: { note: parseNote("G"), octave: 4 }, toneDegree: 5 },
    ],
  };
  assert.equal(formatPitch(bassPitch(voicing)), "E3");
  assert.equal(inversionName(voicing, chord), "First inversion");
  assert.equal(
    inversionName(realizeFingering(chord, [10, 0, 1, 0]).voicing, chord),
    "Second inversion",
  );
});

test("muted strings remain distinct from open strings and invalid physical notes are rejected", () => {
  const chord = makeChord("C", "major");
  const shape = realizeFingering(chord, [null, 0, 1, 0]);
  assert.equal(shape.voicing.voices.length, 3);
  assert.equal(shape.strings[0].voiceId, null);
  assert.deepEqual(voicingCoverage(shape.voicing, chord).omitted, []);
  assert.throws(() => realizeFingering(chord, [0, 0, 0, 0]));
  assert.throws(() => realizeFingering(chord, [2, 0, 1]));
  assert.throws(() => realizeFingering(chord, [null, null, null, null]));
});

test("offered shapes contain only chord tones, allowing omitted fifths in guitar voicings", () => {
  let count = 0;
  for (const instrument of INSTRUMENTS)
    for (const root of ROOT_OPTIONS)
      for (const quality of CHORD_QUALITIES) {
        const chord = makeChord(root, quality.id);
        const shapes = findFingerings(chord, instrument);
        if (
          !["madd9", "7sus4", "mMaj7", "9", "maj9", "m9", "6/9"].includes(
            quality.id,
          )
        )
          assert.ok(shapes.length > 0, `Missing ${chord.symbol}`);
        assert.equal(
          new Set(shapes.map((shape) => shape.id)).size,
          shapes.length,
        );
        for (const shape of shapes) {
          count++;
          assert.deepEqual(
            voicingCoverage(shape.voicing, chord).omitted,
            (instrument.id === GUITAR.id || shape.source === "generated") &&
              voicingCoverage(shape.voicing, chord).omitted.length
              ? [5]
              : [],
            shape.id,
          );
          assert.equal(shape.voicing.chordId, chord.id);
          assert.equal(shape.instrumentId, instrument.id);
          const stopped = shape.frets.filter(
            (fret) => fret !== null && fret > 0,
          );
          assert.ok(
            !stopped.length || Math.max(...stopped) - Math.min(...stopped) <= 4,
          );
          for (const string of shape.strings) {
            if (string.fret === null) continue;
            assert.ok(string.fret >= 0 && string.fret <= 14);
            const voice = shape.voicing.voices.find(
              (item) => item.id === string.voiceId,
            );
            assert.equal(
              midi(voice.pitch),
              midi(
                instrument.courses
                  .find((course) => course.number === string.courseNumber)
                  .strings.find(
                    (physical) => physical.number === string.stringNumber,
                  ).open,
              ) + string.fret,
            );
            assert.ok(Number.isInteger(voice.pitch.octave));
            assert.ok(pcs(chord).includes(pitchClassNumber(voice.pitch.note)));
            assert.equal(
              formatNote(voice.pitch.note),
              formatNote(
                chord.tones.find((tone) => tone.degree === voice.toneDegree)
                  .note,
              ),
            );
          }
        }
      }
  assert.ok(count > ROOT_OPTIONS.length * CHORD_QUALITIES.length);
});

test("standard presets retain instrument-specific pitches including reentrant ukulele", () => {
  assert.deepEqual(
    INSTRUMENTS.map((i) => i.id),
    [GUITAR.id, UKULELE.id, BARITONE.id],
  );
  const chord = makeChord("C", "major");
  assert.deepEqual(
    findFingerings(chord, BARITONE)[0].voicing.voices.map((v) =>
      formatPitch(v.pitch),
    ),
    ["E3", "G3", "C4", "E4"],
  );
  assert.deepEqual(
    realizeFingering(chord, [0, 0, 0, 3], UKULELE).voicing.voices.map((v) =>
      formatPitch(v.pitch),
    ),
    ["G4", "C4", "E4", "C5"],
  );
  assert.deepEqual(findFingerings(chord, GUITAR)[0].frets, [
    null,
    3,
    2,
    0,
    1,
    0,
  ]);
});

test("piano inversions retain spelling, all tones, ascending register and requested bass", () => {
  for (const root of ROOT_OPTIONS)
    for (const quality of CHORD_QUALITIES) {
      const chord = makeChord(root, quality.id);
      for (let inversion = 0; inversion < chord.tones.length; inversion++) {
        const voicing = pianoVoicing(chord, inversion);
        const pitches = voicing.voices.map((voice) => midi(voice.pitch));
        assert.deepEqual(voicingCoverage(voicing, chord).omitted, []);
        assert.equal(
          formatNote(bassPitch(voicing).note),
          formatNote(chord.tones[inversion].note),
        );
        assert.ok(
          pitches.every((pitch, i) => i === 0 || pitch > pitches[i - 1]),
        );
        assert.ok(pitches.at(-1) - pitches[0] < 12);
      }
    }
  assert.deepEqual(
    pianoVoicing(makeChord("C", "major"), 2).voices.map((voice) =>
      formatPitch(voice.pitch),
    ),
    ["G4", "C5", "E5"],
  );
});

test("major/natural-minor contexts spell scales and seventh chords consistently", () => {
  assert.equal(
    keyContext(makeChord("C#", "major"), {
      tonic: parseNote("Db"),
      mode: "major",
    }).fitsPitchClasses,
    true,
  );
  assert.notEqual(makeChord("C#", "major").id, makeChord("Db", "major").id);
  assert.deepEqual(
    keyScale({ tonic: parseNote("F#"), mode: "major" }).map(formatNote),
    ["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"],
  );
  assert.deepEqual(
    keyChords({ tonic: parseNote("A"), mode: "natural-minor" }).map(
      (entry) => entry.chord.symbol,
    ),
    ["Am", "Bdim", "C", "Dm", "Em", "F", "G"],
  );
  assert.deepEqual(
    keyContext(makeChord("D", "6"), {
      tonic: parseNote("C"),
      mode: "major",
    }).outside.map(formatNote),
    ["F♯"],
  );
  assert.equal(
    keyContext(makeChord("D", "6"), { tonic: parseNote("G"), mode: "major" })
      .fitsPitchClasses,
    true,
  );
  for (const tonic of KEY_OPTIONS)
    for (const mode of ["major", "natural-minor"])
      for (const sevenths of [false, true]) {
        const key = { tonic: parseNote(tonic), mode };
        const graph = keyGraph(key, sevenths);
        assert.equal(graph.nodes.length, 7);
        for (const node of graph.nodes)
          assert.equal(keyContext(node.chord, key).fitsPitchClasses, true);
        for (const edge of graph.edges) {
          const from = graph.nodes.find(
            (node) => node.chord.id === edge.source,
          ).chord;
          const to = graph.nodes.find(
            (node) => node.chord.id === edge.target,
          ).chord;
          const shared = pcs(from).filter((pc) => pcs(to).includes(pc));
          assert.deepEqual(
            edge.sharedTones.map(pitchClassNumber).sort((a, b) => a - b),
            shared,
          );
          assert.equal(edge.kind, "shared-tones");
          assert.ok(shared.length > 0);
        }
      }
});
