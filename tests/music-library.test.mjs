import assert from "node:assert/strict";
import test from "node:test";
import { GUITAR_SHAPES } from "../src/lib/music/data/guitar-shapes.ts";
import {
  LIBRARY_REVISION,
  UKULELE_SHAPES,
} from "../src/lib/music/data/ukulele-shapes.ts";
import {
  BARITONE,
  CHORD_QUALITIES,
  findFingerings,
  GUITAR,
  INSTRUMENTS,
  makeChord,
  midi,
  parseNote,
  pitchClassNumber,
  ROOT_OPTIONS,
  voicingCoverage,
} from "../src/lib/music/index.ts";

const roots = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

test("the pinned subset covers all supported qualities with four canonical positions each", () => {
  assert.equal(LIBRARY_REVISION, "df06fa7b425cf5fd29485ff6591236b3557e3fac");
  assert.equal(Object.keys(UKULELE_SHAPES).length, 168);
  for (const root of roots)
    for (const quality of CHORD_QUALITIES) {
      const positions = UKULELE_SHAPES[`${root}:${quality.id}`];
      assert.equal(positions.length, 4);
      for (const position of positions) {
        assert.equal(position.frets.length, 4);
        assert.equal(position.fingers.length, 4);
        position.frets.forEach((fret, index) => {
          const finger = position.fingers[index];
          assert.ok(Number.isInteger(finger) && finger >= 0 && finger <= 4);
          assert.equal(finger > 0, fret > 0);
        });
      }
    }
});

test("all standard instruments preserve validated library fingering and order", () => {
  for (const instrument of INSTRUMENTS)
    for (const root of [...ROOT_OPTIONS, "Cbb", "B#", "Bbb", "E##"])
      for (const quality of CHORD_QUALITIES) {
        const chord = makeChord(root, quality.id);
        const source = `${roots[(pitchClassNumber(chord.root) + (instrument.id === BARITONE.id ? 5 : 0)) % 12]}:${quality.id}`;
        const library =
          instrument.id === GUITAR.id ? GUITAR_SHAPES : UKULELE_SHAPES;
        const shapes = findFingerings(chord, instrument);
        assert.equal(shapes.length, library[source].length);
        shapes.forEach((shape, index) => {
          const upstream = library[source][index];
          assert.equal(shape.source, "library");
          assert.deepEqual(shape.library, {
            chord: source,
            position: index + 1,
            revision: LIBRARY_REVISION,
          });
          assert.deepEqual(shape.frets, upstream.frets);
          assert.deepEqual(
            shape.fingers,
            upstream.fingers.map((f) => f || null),
          );
          assert.deepEqual(
            shape.barres.map((b) => b.fret),
            upstream.barres,
          );
          assert.ok(
            voicingCoverage(shape.voicing, chord).omitted.every(
              (degree) => instrument.id === GUITAR.id && degree === 5,
            ),
          );
          for (const barre of shape.barres) {
            const first = instrument.courses.findIndex(
              (c) => c.number === barre.fromCourse,
            );
            const last = instrument.courses.findIndex(
              (c) => c.number === barre.toCourse,
            );
            assert.ok(first < last);
            assert.equal(shape.frets[first], barre.fret);
            assert.equal(shape.frets[last], barre.fret);
            assert.equal(shape.fingers[first], barre.finger);
            assert.equal(shape.fingers[last], barre.finger);
            for (let i = first; i <= last; i++)
              assert.ok(
                shape.frets[i] === null || shape.frets[i] >= barre.fret,
              );
          }
          for (let i = 0; i < shape.fingers.length; i++) {
            const finger = shape.fingers[i];
            if (!finger) continue;
            for (let j = i + 1; j < shape.fingers.length; j++)
              if (shape.fingers[j] === finger) {
                assert.equal(shape.frets[j], shape.frets[i]);
                assert.ok(
                  shape.barres.some(
                    (b) => b.finger === finger && b.fret === shape.frets[i],
                  ),
                );
              }
          }
        });
      }
});

test("partial barres and upper-neck positions retain their absolute frets", () => {
  const f = findFingerings(makeChord("F", "major"));
  assert.deepEqual(f[0].frets, [3, 2, 1, 1]);
  assert.deepEqual(f[0].barres, [
    { fret: 1, finger: 1, fromCourse: 2, toCourse: 1 },
  ]);
  assert.deepEqual(f[3].frets, [10, 10, 10, 13]);
  assert.equal(f[3].startFret, 10);
  assert.equal(midi(f[3].voicing.voices[3].pitch), 77);
});

test("other tunings use generated shapes without borrowed finger numbers", () => {
  const alternate = {
    ...BARITONE,
    id: "test-dgbe-flat-e",
    courses: BARITONE.courses.map((course, index) =>
      index !== 3
        ? course
        : {
            ...course,
            strings: [
              { number: 1, open: { note: parseNote("Eb"), octave: 4 } },
            ],
          },
    ),
  };
  const shapes = findFingerings(makeChord("C", "minor"), alternate);
  assert.ok(shapes.length > 0);
  for (const shape of shapes) {
    assert.equal(shape.source, "generated");
    assert.deepEqual(shape.fingers, [null, null, null, null]);
    assert.deepEqual(shape.barres, []);
    assert.equal(shape.library, undefined);
  }
});
