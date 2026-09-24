# Music model

The domain is TypeScript with strict checking. It models spelled notes and concrete
pitches separately from chords and physical instrument positions. The site uses
twelve-tone equal temperament.

## Modules and boundaries

- `catalog.ts`: authoritative chord formulas, aliases, harmonic family, practice
  group, teaching descriptions, and explicitly permitted omitted degrees.
  `ChordQuality` is derived from this registry.
- `index.ts`: public compatibility API, pitch arithmetic, instruments, chord
  construction, concrete chord voicings, canonical library adapter, keys.
- `positions.ts`: realizes arbitrary fret/mute positions on the instrument into
  sounding MIDI pitches, without requiring a chord interpretation.
- `analysis.ts`: shared chord-coverage policy, slash requests, actual-bass labels.
- `generation.ts`: bounded candidate generation with unknown finger assignments.
- `voicing-search.ts`: canonical, transposed, and generated alternatives; bass
  filtering; deterministic deduplication; tuning-sensitive bounded search cache.
- `fretboard.ts`: key-aware spelling, recognition and single-string predictions.
- `harmony.ts`: explained chord relationships and ranked neighboring moves.
- `cheat-sheet.ts` and `practice.ts`: reference and practice view construction.
- `preferences.ts`: validated instrument/key preferences; practice family
  preferences have their own versioned storage key in `practice.ts`.

A spelled note (C♯) is distinct from its chromatic pitch class (equal to D♭).
A pitch adds an octave. A chord has a root and formula but no register. A voicing
retains individual sounding voices and tone roles, including duplicated notes.
An instrument position adds frets/mutes; optional finger numbers and barres
describe technique. The raw position can exist even when no chord is recognized.

The lowest actual pitch determines bass, including on reentrant ukulele.
G/B is a selection of G major with a requested B bass, not a different formula.
Only chord-tone bass requests are currently supported. The formula 6/9 is parsed
as a quality; a final slash followed by a note is a bass request.

Piano and audio use the same concrete voices as the instrument. A separately
selected piano inversion is a different voicing, not a reinterpretation of the
instrument diagram.

## Vocabulary and provenance

The registry contains the original fourteen qualities plus minor add9, 7sus4,
minor-major seventh, dominant/major/minor ninths, and 6/9. Every formula works on
every spelled root; that does not guarantee a suitable physical shape.

Canonical shapes come from the pinned MIT-licensed
tombatossals/chords-db subset, revision
`df06fa7b425cf5fd29485ff6591236b3557e3fac`. The imported fixture remains 168 chords
per instrument library, independently of expansion of the formula registry.
The library's default order stays intact.

For baritone DGBE, GCEA shapes are looked up a fourth higher and realized on the
actual tuning. Upstream MIDI pitches and inversion labels are not reused.

Movable alternatives pool fully fretted library shapes from all twelve roots.
Every stopped fret and barre shifts equally. Mutes stay muted. Open-string shapes
are not blindly shifted. Derived shapes retain their original source reference
and transposition amount.

Generated candidates allow leading/trailing mutes and a maximum stopped-fret span
of three. Search is limited to six courses and frets 0–24. These constraints are a
heuristic, not proof of comfortable fingering. Finger numbers remain unassigned.
A bounded selection per bass prevents root-position candidates crowding out all
inversions. The UI labels generated positions and handles unavailable shapes.

Recognition requires the root and defining tones. Only registry-declared fifth
omissions are allowed, and exact matches rank first. Rootless jazz recognition and
arbitrary incomplete subsets are not supported. C6 and Am7 can share a sounding
pitch set while retaining distinct identities and interpretations.

## Practice and interaction

Instrument and key preferences are global to /music. Chord-family filters default
to triads and sevenths and persist separately. In-key cards must fit the selected
major or natural-minor scale. A key-compatible chord is not automatically assigned
a harmonic function. Outside-key practice families remain explicitly separate.

Voicing arrows and bass selectors use the same expanded search as the atlas.
Theory dialogs derive their examples and intervals from the formula registry.
Teaching prose stays out of the normal compact view.

On the fretboard, primary means selected. Secondary means replacing this string's
note with this position produces a recognized chord, leaving all other strings
unchanged. Muted treatment means in-key without that prediction. Predictions use
the same recognition policy as the displayed result, including explicitly labeled
omitted fifths. Recognition is not a recommendation about musical quality.

## Relationships and future paths

Shared-tone and relative relationships are undirected. Dominant and leading-tone
resolutions are directed. Key membership remains separate. Practice-sheet grouping
and progression-neighbor ranking are different presentations and currently retain
their own selection policies.

Future pathfinding must distinguish harmonic distance, concrete voice movement,
and physical hand movement. One scalar cost should not silently conflate them.
Automatic pathfinding is not part of this stack.

## Verification

Run `npm run verify` for type checks, lint, formatting checks, model/palette tests
and the production build. `npm run test:browser` builds and tests the production
site at phone and desktop widths. Both run in CI.

Tests preserve imported fixtures while separately checking generated/derived
coverage, actual bass, transposition, alias round-trips, arbitrary instrument
realization, recognition ambiguity, key filtering, preference validation, and
prediction/result agreement. Browser tests cover help dialogs, bass navigation,
family persistence, responsive wrapping and predictive selection.

The music routes use noindex metadata but are publicly accessible via the music
navigation icon. Noindex is not access control.
