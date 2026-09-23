# Nairobi National Museum · a 3D walk

An immersive, browser-based tour of the **Nairobi National Museum** on Museum Hill, Nairobi. Start on the forecourt, walk through the Hall of Kenya and into every permanent gallery, then out to Ahmed's courtyard, the Snake Park and the Botanic Gardens. Each space is a navigable 3D room with numbered hotspots that open info panels written from the museum's own descriptions, with the source cited.

Built with Vite, React, TypeScript, Three.js (react-three-fiber and drei), Tailwind CSS and `@react-three/postprocessing`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317
```

Other scripts: `npm run build` (type-check and production build), `npm run preview` (serves `dist/` on port 4318), and `npm run lint`.

## Moving around

| Input | Action |
| --- | --- |
| W A S D or arrow keys | Walk (Shift to hurry). Q/E or ←/→ turn |
| Drag | Look around (walk mode) or orbit the room (orbit mode) |
| 1–9, `[` `]` | Jump to an exhibit, or step to the previous or next one |
| O | Toggle walk and orbit |
| M | Open the museum map |
| Doorways | Walk through, or click, to change room |
| Touch | Thumbstick to walk, drag anywhere to look |

The minimap (bottom left) shows the current room, its exhibits and its exits. The chip bar (bottom centre) lists every exhibit and links to the next room. The **Map** opens the hub, which has a schematic plan of all 14 spaces, a gallery list and a "Plan a visit" tab with hours and 2026 ticket prices.

Deep links open a room directly: `/?room=mammals`, or `/?room=hall-of-kenya&at=0,9,0,0.16` to set the position (x, z), heading and pitch. Add `&clean` to hide the UI. Bloom and ambient occlusion stay off unless you add `&hq` or press **Effects** (desktop). The canvas pauses while the tab is hidden, and the pixel ratio stays between 1 and 1.5. Only the current room and its neighbours are mounted; the rest of the galleries load when you walk toward them.

## Rooms

| # | Space | Level | Photos from NMK |
| --- | --- | --- | --- |
| 0 | The Forecourt | Grounds | Yes |
| I | Hall of Kenya | Ground floor | Yes |
| II | Birds of East Africa | Ground floor | Yes |
| III | Great Hall of Mammals | Ground floor | Yes |
| IV | Cradle of Humankind (Turkana Boy, Hominid Skull Room, Koobi Fora tools) | Ground floor | Yes |
| V | Asian African Heritage | Ground floor | No |
| VI | Numismatic Exhibition | Ground floor | No |
| VII | Creativity Gallery (contemporary art) | Ground floor | Yes |
| VIII | Historia ya Kenya | Upper floor | Yes (one vitrine) |
| IX | Cycles of Life | Upper floor | Yes |
| X | Joy Adamson Gallery | Upper floor | No |
| XI | Ahmed's Courtyard | Grounds | No |
| XII | Snake Park & Aquarium | Grounds | Yes |
| XIII | Botanic Gardens & Nature Trail | Grounds | No |

The list follows the permanent galleries named on [museums.or.ke](https://museums.or.ke/nairobi-national-museum/) and [nmk.go.ke](https://nmk.go.ke/nairobi-national-museum/), plus the Hall of Kenya, Joy Adamson Gallery, Creativity Gallery, Ahmed replica, Snake Park and gardens described in visitor guides. A "Great Apes" exhibition turns up in older web write-ups, but the official site does not list it as a permanent gallery, so it is not included. The floor plan is schematic, and the connections between rooms are a plausible walking order rather than a surveyed layout.

## Sources and credits

- **Photographs** in `public/photos/` are © National Museums of Kenya, taken from [museums.or.ke](https://museums.or.ke/nairobi-national-museum/), [museums.or.ke Snake Park](https://museums.or.ke/nairobi-snake-park-and-aquarium/) and [nmk.go.ke](https://nmk.go.ke/nairobi-national-museum/). They are used here as textures and panel images with credit. The paintings on the Creativity Gallery partitions are crops of the NMK photograph of that room.
- **Text** comes from the official pages above, the [2026 admission fees notice](https://museums.or.ke/wp-content/uploads/2026/04/Revision-of-NMK-admission-fees-2026-Website.pdf), and visitor guides ([Blavals](https://www.blavals.com/destination/national-museum-society-of-kenya), [Ole Sereni](https://emara.ole-sereni.com/9-must-see-galleries-at-nairobi-national-museum-of-kenya/), [Kenya Museum Society](https://www.kenyamuseumsociety.org/official-opening-of-the-joy-adamson-exhibition-at-nairobi-national-museum/), [Kenya Geographic](https://www.kenyageographic.com/5-things-to-do-at-the-nairobi-national-museum/) and [Done Adventures](https://doneadventures.com/destinations/kenya-destination/national-museum/)). Every info panel links to its source. Background notes that are not museum text are labelled as such.
- **Visitor info:** Museum Hill, Kipande Road; open daily 8:30 am – 5:30 pm; rated 4.5 on Google (about 11,900 reviews, via [Nairobi Breaks](https://www.nairobibreaks.com/city/nairobi/nairobi-national-museum)).
- **Generated imagery:** the tileable textures (`public/textures/`), the animal and fossil cut-outs (`public/cutouts/`), and the images in `public/illustrative/` (bird-case backboards, aquaria, butterfly map, botanical study) were generated for this project. Wherever they appear in an info panel they are labelled "illustrative", because they are not photographs of the real exhibits.
- **Type:** Instrument Serif and Inter, via Fontsource.

## Known gaps

- No NMK photographs were available for the Joy Adamson Gallery, Numismatic Exhibition, Asian African Heritage gallery, Ahmed's courtyard or the Botanic Gardens. Those rooms are built from written descriptions only.
- There are no 3D scans or models of the real exhibits. Animals, including the buffalo and warthog from the museum's mammals-hall photograph, and the Turkana Boy skeleton are photographic cut-outs facing the south entrance. Trees, gourds, columns and cases are modelled in code. That is the ceiling on how photographic the hero rooms can look. No Meshy key and no Blender connection were available to replace those cut-outs.
- Layouts, dimensions and some fittings are informed approximations drawn from photographs and guides.

## Project layout

```
src/
  data/        rooms.ts (every room, door, exhibit and its source), sources.ts (visitor info and citations)
  three/       Scene, Player (walk + orbit controls, door triggers), Hotspots, kit (walls, cases, frames, cut-outs, plants)
    rooms/     Grounds.tsx, GroundFloor.tsx, UpperFloor.tsx, shell.tsx (indoor/outdoor lighting and shells)
  ui/          Intro, MapHub + MuseumPlan, HUD, InfoPanel, Minimap, Joystick, Loader, ErrorBoundary
public/        photos/, textures/, cutouts/, illustrative/, fonts/
```

Visual passes were run with a target-image loop: generate a target screenshot, build towards it, and have a fresh reviewer score the live render. The working folder `.dream-loop/` is git-ignored.
