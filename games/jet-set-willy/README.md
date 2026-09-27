# Jet Set Willy

A browser recreation of the 1984 ZX Spectrum classic, written in plain HTML5 canvas and JavaScript with no dependencies.

**Play it:** https://cbruyndoncx.github.io/jet-set-willy/

## How to play

Explore Willy's mansion, collect every item, then go to bed in the Master Bedroom.

| Action | Keys |
|---|---|
| Move left / right | `O` / `P`, `Q` / `W`, `A` / `D`, or arrow keys |
| Jump | `Space`, `Up`, `Z` or `M` |
| Pause | `Enter` or `Esc` |

Touch controls appear automatically on phones and tablets.

## Features

- 16 interconnected rooms in a 4x4 mansion grid (Bathroom, Master Bedroom, Chapel, Wine Cellar, ...)
- Spectrum-style 256x192 screen with the original 15-colour palette and attribute-cell collision
- Manic Miner style jump arc, fatal falls, nasties, crumbling floors, conveyors and patrolling guardians with pixel-perfect collision
- Item counter, mansion clock and a lives display of walking Willys
- Chiptune-style beeps via WebAudio

## Running locally

Any static file server works, for example:

```
python3 -m http.server 8000
```

then open http://localhost:8000/.

## Editing rooms

Rooms live in `ROOM_DATA` inside `game.js`. Each room is 16 rows of 32 characters:

```
#  wall      =  floor       ^  nasty     c  crumbling floor
>  <  conveyor   B  bed (goal)   *  item
```

Rooms are laid out on a 4x4 grid; walking off an edge moves to the neighbouring room.
