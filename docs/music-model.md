# Music model

The chord tool uses a small TypeScript domain of value objects for twelve-tone equal
temperament (12-TET). Theory, register, and instrument technique are separate so
the same chord can support reference diagrams, listening, and future exploration.
The initial implementation has no music-library dependency: its formulas and
transformations are explicit and testable. Adapters to Tonal or other libraries
can be added without making their object models the application's storage format.

## Four layers

1. **Spelled note:** `{ step, alter }` identifies a note without an octave. `step`
   is a letter A–G; `alter` is an integer semitone alteration. C♯ and D♭ remain
   distinct spellings even though they share a chromatic pitch class. A concrete
   `Pitch` is `{ note: { step, alter }, octave }`; MIDI number is derived.
2. **Chord:** a spelled root and a formula describe the intended harmony without
   choosing a register or instrument. Formulas retain tone degrees and semitone
   distances: a sixth is not silently renamed a diminished seventh. Chord tones,
   labels, and chromatic pitch-class sets are derived from this intent.
3. **Voicing:** voices give those chord tones concrete pitches. Each voice has a
   stable ID and `toneDegree`. Repeated tones are preserved; E3 and E4 are two
   voices, not one set member. The lowest sounding pitch determines the bass and
   inversion, regardless of array or string order.
4. **Instrument realization:** a baritone shape maps string/fret positions to
   voices in its nested `Voicing`. Piano rendering consumes this same voicing,
   making the keyboard an exact view of the uke's sound. A separately selected
   piano inversion is a different voicing of the same chord.

The MVP keeps related values together as serializable objects. Consumers should
treat returned values as read-only, including cached fingering candidates.
A database, normalized
ID references, or object storage is unnecessary now; those are optional storage
choices later and do not change these distinctions.

For the standard linear baritone tuning, strings 4→1 are D3–G3–B3–E4:

```text
Chord intent:        C major → C, E, G
String:              4    3    2    1
Open pitch:          D3   G3   B3   E4
Fret:                2    0    1    0
Voice pitch:         E3   G3   C4   E4
Tone degree:         3    5    1    3
Bass:                E3 → first inversion
```

Thus the familiar `2010` shape is a C-major realization with E in the bass. Its
piano view highlights E3, G3, C4, and E4. A root-position piano example such as
C4–E4–G4 is related by chord identity, but is not the same voicing.

C6 and Am7 both contain C–E–G–A. Their roots and tone roles differ, so a pitch-class
mask must never be the unique chord identity. Likewise, sounding equivalence,
spelled equality, equal voicings, and equal fingerings are distinct comparisons.

## Supported vocabulary and shapes

The initial fourteen qualities are major, minor, diminished, augmented, sus2,
sus4, dominant seventh, major seventh, minor seventh, diminished seventh,
half-diminished seventh, major sixth, minor sixth, and add9. Chord spelling follows
the formula's degrees, including double accidentals where musically required.

The shape generator searches frets 0–12, with at most three frets between the
lowest and highest nonzero frets (a four-fret window). Open strings do not increase
that span. Every sounding note must belong to the requested chord and every
chord tone must be present. Doubling is allowed; omitted tones are not part of the
MVP. A muted string is distinct from an open string.

Common curated shapes rank first, with their pitch contents validated by the
same theory functions. Other candidates are labeled generated. These constraints
are a useful search filter, not a guarantee of ergonomic playability. Finger
numbers and barres are not guessed. Future curated technique data can enrich an
instrument realization without changing the voicing it produces.

Extended chords with omitted roots or fifths will eventually require explicit
coverage policies. They should retain their intended chord and report omissions,
rather than being automatically relabeled by a chord-detection heuristic.

## Keys and relationships

A key context specifies a spelled tonic and major or **natural minor** mode.
Natural minor is explicit: harmonic and melodic minor are not silently mixed into
its chord palette. Stacking thirds from the scale produces seven degree nodes,
selectable as triads or seventh chords. A chord's Roman numeral and degree belong
to this context, not to its global identity.

`keyContext` reports whether all sounding pitch classes fit the scale. This is
separate from spelled membership: C♯ major fits D♭ major sonically, but the graph's
spelled tonic chord is D♭ major. The app does not infer harmonic function from
pitch-class compatibility alone.

The MVP graph uses typed, undirected **shared-tone** edges between chords in the
selected key. An edge records the common tones that justify it. It describes
similarity; it does not assert that one chord ought to follow another or rank a
progression as musically better. Adjacent-chord links expose this same relation.

A future directed harmonic graph can add relations such as dominant resolution,
secondary dominants, borrowed harmony, or changes of key. Preserve each edge's
type, applicable context, and explanation. These relations should coexist with
shared-tone edges rather than inheriting their meaning.

Path search will need distinct objectives:

- **Harmony:** key membership, transition vocabulary, and modulation policy.
- **Voice leading:** movement of concrete voices between voicings.
- **Instrument technique:** movement between physical realizations.

The fewest harmonic steps, least pitch movement, and easiest hand movement need
not produce the same path. Keep those costs separate and explain the chosen
objective to the player. Pathfinding is not included in this MVP.

For example, D6 is D–F♯–A–B, so it is outside a strictly C-major palette. Both
C major and D6 fit G major. A future C-major-chord → D6 search must specify its
key context or allow chromatic harmony/modulation; it must not quietly alter F♯
or claim that D6 is diatonic to C major.

## Boundaries and verification

The initial instrument is standard linear baritone uke. Alternate tunings,
microtones, rhythm, chord-symbol inference, and progression recommendations are
outside this scope. The domain leaves instrument mapping independent of harmony
so these can be considered without rewriting chord identity.

Useful invariants for tests:

- Spelling and transposition preserve both letter distance and semitone distance.
- Concrete pitches round-trip to MIDI, including accidentals crossing an octave.
- Every sounding string maps to exactly one stable voice ID and the pitch computed
  from its tuning plus fret; muted strings contribute no voice.
- Realizations contain every requested chord tone and no foreign pitch classes.
- Inversions use the actual lowest pitch, and piano rendering uses those same
  pitches rather than reconstructing a root-position chord.
- C6 and Am7 remain different chords with equal pitch-class sets.
- Diatonic chord tones belong to the selected scale; graph edges name their actual
  intersection and remain symmetric.

`/music` is unlisted: it has no main-navigation entry and uses `noindex` metadata.
That is discoverability guidance, not access control; anyone with the URL can
visit, and the content is public.

## Design references

- [music21 Pitch](https://music21.org/music21docs/moduleReference/modulePitch.html)
  distinguishes spelling from sounding pitch and treats octave as explicit data.
- [MusicXML pitch](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/pitch/)
  represents letter, alteration, and octave;
  [harmony](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/harmony/)
  distinguishes chord root/kind, bass, inversion, and analytical context.
- [MusicXML frame-note](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/frame-note/)
  separates string/fret positions from optional fingering and barre technique.
- [Tonal chords](https://tonaljs.github.io/tonal/docs/groups/chords) and
  [voicing](https://github.com/tonaljs/tonal/blob/main/packages/voicing/README.md)
  provide examples of formula dictionaries and register-constrained realization.
- [Ukulele Magazine's baritone lesson](https://ukulelemagazine.com/lessons/baritone-ukulele-lesson-drawing-inspiration-from-the-larger-sound-and-deeper-tuning)
  distinguishes the standard linear D–G–B–E tuning from reentrant alternatives.
