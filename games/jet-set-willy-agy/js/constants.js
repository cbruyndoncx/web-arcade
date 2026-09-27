// Jet Set Willy - Constants and Enumerations

const WIDTH = 256;
const HEIGHT = 192;
const NUM_COLS = 32;
const NUM_ROWS = 16;
const TILE_SIZE = 8;

const STATUS_Y = 172; // 21 * 8 + 4
const LIVES_OFFSET = (18 * 8 + 4) * WIDTH + 4;

// Room IDs
const ROOM_THEDRIVE = 4;
const ROOM_QUIRKAFLEEG = 16;
const ROOM_ONTHEROOF = 18;
const ROOM_BALLROOMEAST = 20;
const ROOM_COLDSTORE = 25;
const ROOM_THECHAPEL = 27;
const ROOM_FIRSTLANDING = 28;
const ROOM_NIGHTMAREROOM = 29;
const ROOM_SWIMMINGPOOL = 31;
const ROOM_EASTWALL = 32;
const ROOM_THEBATHROOM = 33;
const ROOM_MASTERBEDROOM = 35;
const ROOM_THEBEACH = 57;

// Directions for room exits
const R_ABOVE = 0;
const R_RIGHT = 1;
const R_BELOW = 2;
const R_LEFT  = 3;

// Willy directions
const D_RIGHT = 0;
const D_LEFT  = 1;
const D_JUMP  = 2;

// Tile types
const T_ITEM        = 0;
const T_SPACE       = 1;
const T_SOLID       = 2;
const T_FLOOR       = 3;
const T_SOLIDFLOOR  = 4;
const T_CONVEYL     = 5;
const T_CONVEYR     = 6;
const T_RAMPL       = 7;
const T_RAMPR       = 8;
const T_RAMPLC      = 9;
const T_RAMPRC      = 10;
const T_HARM        = 11;

// Conveyor directions
const C_NONE  = 0;
const C_LEFT  = 1;
const C_RIGHT = 2;

// Pixel collision bit flags
const B_LEVEL = 1;
const B_ROBOT = 2;
const B_WILLY = 4;

// Game modes
const GM_NORMAL  = 0;
const GM_MARIA   = 1;
const GM_RUNNING = 2;
const GM_TOILET  = 3;

// Game states
const STATE_TITLE    = 0;
const STATE_PLAYING  = 1;
const STATE_PAUSED   = 2;
const STATE_DYING    = 3;
const STATE_GAMEOVER = 4;
const STATE_VICTORY  = 5;

// Sound effects
const SFX_ITEM     = 0;
const SFX_DIE      = 1;
const SFX_GAMEOVER = 2;
const SFX_ARROW    = 3;
const SFX_NONE     = 4;

// Music modes
const MUS_STOP  = 0;
const MUS_PLAY  = 1;
const MUS_TITLE = 0;
const MUS_GAME  = 1;
const MUS_OVER  = 2;

// ZX Spectrum 16-color palette (RGB format)
const PALETTE = [
    [0x00, 0x00, 0x00], // 0: Black
    [0x00, 0x22, 0xea], // 1: Blue
    [0xd6, 0x22, 0x00], // 2: Red
    [0xd6, 0x22, 0xea], // 3: Magenta
    [0x00, 0xcc, 0x00], // 4: Green
    [0x00, 0xcc, 0xea], // 5: Cyan / Light Blue
    [0xd6, 0xcc, 0x00], // 6: Yellow
    [0xd6, 0xcc, 0xea], // 7: White
    [0xaa, 0xaa, 0xaa], // 8: Bright Grey
    [0x00, 0x33, 0xff], // 9: Bright Blue
    [0xff, 0x33, 0x00], // 10: Bright Red
    [0x88, 0x00, 0x00], // 11: Dark Red
    [0x00, 0xff, 0x00], // 12: Bright Green
    [0x00, 0x77, 0x00], // 13: Dark Green
    [0xff, 0x99, 0x00], // 14: Orange
    [0x99, 0x55, 0x00]  // 15: Brown
];

if (typeof module !== "undefined") {
    module.exports = {
        WIDTH, HEIGHT, NUM_COLS, NUM_ROWS, TILE_SIZE, STATUS_Y, LIVES_OFFSET,
        ROOM_THEDRIVE, ROOM_QUIRKAFLEEG, ROOM_ONTHEROOF, ROOM_BALLROOMEAST,
        ROOM_COLDSTORE, ROOM_THECHAPEL, ROOM_FIRSTLANDING, ROOM_NIGHTMAREROOM,
        ROOM_SWIMMINGPOOL, ROOM_EASTWALL, ROOM_THEBATHROOM, ROOM_MASTERBEDROOM, ROOM_THEBEACH,
        R_ABOVE, R_RIGHT, R_BELOW, R_LEFT,
        D_RIGHT, D_LEFT, D_JUMP,
        T_ITEM, T_SPACE, T_SOLID, T_FLOOR, T_SOLIDFLOOR, T_CONVEYL, T_CONVEYR,
        T_RAMPL, T_RAMPR, T_RAMPLC, T_RAMPRC, T_HARM,
        C_NONE, C_LEFT, C_RIGHT,
        B_LEVEL, B_ROBOT, B_WILLY,
        GM_NORMAL, GM_MARIA, GM_RUNNING, GM_TOILET,
        STATE_TITLE, STATE_PLAYING, STATE_PAUSED, STATE_DYING, STATE_GAMEOVER, STATE_VICTORY,
        SFX_ITEM, SFX_DIE, SFX_GAMEOVER, SFX_ARROW, SFX_NONE,
        MUS_STOP, MUS_PLAY, MUS_TITLE, MUS_GAME, MUS_OVER,
        PALETTE
    };
}
