'use strict';
// ---------------------------------------------------------------------------
// Jet Set Willy - a browser recreation of the 1984 ZX Spectrum classic.
// 256x192 virtual screen, 8x8 attribute tiles, 32x16 tile rooms.
// ---------------------------------------------------------------------------
const TILE = 8, COLS = 32, ROWS = 16, W = 256, H = 192, PLAY_H = 128;
const TICK_MS = 34;                     // ~29 fps game logic
const JUMP = [-4,-4,-4,-4,-3,-3,-2,-2,-1,-1,0,0,1,1,2,2,3,3,4,4,4,4];
const FALL_SPEED = 4, FATAL_FALL = 48, START_LIVES = 7;

// ZX Spectrum palette (bright variants in the upper 8)
const PAL = ['#000000','#0000d7','#d70000','#d700d7','#00d700','#00d7d7','#d7d700','#d7d7d7',
             '#000000','#0000ff','#ff0000','#ff00ff','#00ff00','#00ffff','#ffff00','#ffffff'];
const BLACK=0, BLUE=1, RED=2, MAGENTA=3, GREEN=4, CYAN=5, YELLOW=6, WHITE=7, B=8;

// ---------------------------------------------------------------------------
// Graphics data
// ---------------------------------------------------------------------------
const TILES = {
  '#': ["XXXXXXXX","X...X...","X...X...","XXXXXXXX","..X...X.","..X...X.","XXXXXXXX","X...X..."],
  '=': ["XXXXXXXX","X.X.X.X.",".X.X.X.X","X.......","........","........","........","........"],
  '^': ["...X....","...X....","..XXX...",".X.X.X..","X..X..X.","..XXX...",".X.X.X..","X..X..X."],
  'c': ["XXXXXXXX","X.X.X.X.",".X.X.X.X","X.X.X.X.",".X.X.X.X","X.X.X.X.",".X.X.X.X","X.X.X.X."],
  'B': ["XXXXXXXX","X.XXXX.X","XXXXXXXX","X......X","XXXXXXXX","X......X","X......X","X......X"],
  '>': ["XXXXXXXX","X...X...","XX..XX..","XXXXXXXX","........","XXXXXXXX","..XX..XX","...X...X"],
  '<': ["XXXXXXXX","...X...X","..XX..XX","XXXXXXXX","........","XXXXXXXX","XX..XX..","X...X..."],
};
const CONV_FRAMES = ['XXXXXXXX','X...X...','XX..XX..','XXX.XXX.'];

const WILLY = [
 ["..XXXX..","..XXXX..","...XX...","..X.XX..","..XXXX..","...XX...","..XXXX..",".XXXXXX.",".X.XX.X.","...XX...","...XX...","..XXXX..","..X..X..","..X..X..","..X..X..",".XX..XX."],
 ["..XXXX..","..XXXX..","...XX...","..X.XX..","..XXXX..","...XX...","..XXXX..",".XXXXXX.",".X.XX.X.","...XX...","...XX...","..XXXX..","..X..X..",".X....X.",".X....X.","XX....XX"],
 ["..XXXX..","..XXXX..","...XX...","..X.XX..","..XXXX..","...XX...","..XXXX..",".XXXXXX.",".X.XX.X.","...XX...","...XX...","...XX...","...XX...","...XX...","...XX...","..XXX..."],
 ["..XXXX..","..XXXX..","...XX...","..X.XX..","..XXXX..","...XX...","..XXXX..",".XXXXXX.",".X.XX.X.","...XX...","...XX...","..XXXX..","..X..X..",".X....X.","X.....X.","XX...XX."],
];

const ITEM = ["..XXXX..",".X....X.","X.XXXX.X","X.X..X.X","X.X..X.X","X.XXXX.X",".X....X.","..XXXX.."];
const ITEM2 = ["...XX...","..XXXX..",".XXXXXX.","XXXXXXXX","XXXXXXXX",".XXXXXX.","..XXXX..","...XX..."];

const GHOST0 = ["......XXXX......","....XXXXXXXX....","...XXXXXXXXXX...","..XXXXXXXXXXXX..","..XX..XXXX..XX..","..X....XX....X..","..XX..XXXX..XX..","..XXXXXXXXXXXX..","..XXXX....XXXX..","..XXXXXXXXXXXX..","..XXXXXXXXXXXX..","..XXXXXXXXXXXX..","..XXXXXXXXXXXX..","..XXXXXXXXXXXX..","..X.XX.XX.XX.X..","..X..X..X..X.X.."];
const GHOST1 = GHOST0.slice(0,14).concat(["..XX.XX.XX.XXX..","...X..X..X..X..."]);
const BAT0 = ["X..............X","XX............XX","XXX..........XXX","XXXX........XXXX","XXXXX..XX..XXXXX","XXXXXXXXXXXXXXXX",".XXXXXXXXXXXXXX.","..XXXX.XX.XXXX..","...XXX.XX.XXX...","....XXXXXXXX....",".....XXXXXX.....","......XXXX......",".......XX.......","......X..X......","................","................"];
const BAT1 = ["................","................",".......XX.......","......XXXX......",".....XXXXXX.....","....XXXXXXXX....","...XXX.XX.XXX...","..XXXX.XX.XXXX..",".XXXXXXXXXXXXXX.","XXXXXXXXXXXXXXXX","XXXXX..XX..XXXXX","XXXX........XXXX","XXX..........XXX","XX............XX","X..............X","................"];
const MONK0 = ["......XXXX......",".....XXXXXX.....","....XXXXXXXX....","....XX.XX.XX....","....XXXXXXXX....",".....XXXXXX.....","......XXXX......","....XXXXXXXX....","...XXXXXXXXXX...","..XX.XXXXXX.XX..","..XX.XXXXXX.XX..",".....XXXXXX.....",".....XXXXXX.....",".....XX..XX.....",".....XX..XX.....","....XXX..XXX...."];
const MONK1 = MONK0.slice(0,12).concat([".....XXXXXX.....","....XX....XX....","...XXX....XXX...","..XXX......XXX.."]);
const SKULL0 = ["....XXXXXXXX....","..XXXXXXXXXXXX..",".XXXXXXXXXXXXXX.",".XXXXXXXXXXXXXX.",".XX..XXXXXX..XX.",".X....XXXX....X.",".XX..XXXXXX..XX.",".XXXXXXXXXXXXXX.","..XXXXX..XXXXX..","...XXXXXXXXXX...","....XXXXXXXX....","....X.X.X.X.X...","....XXXXXXXX....","................","................","................"];
const SKULL1 = ["................","....XXXXXXXX....","..XXXXXXXXXXXX..",".XXXXXXXXXXXXXX.",".XXXXXXXXXXXXXX.",".XX..XXXXXX..XX.",".X....XXXX....X.",".XX..XXXXXX..XX.",".XXXXXXXXXXXXXX.","..XXXXX..XXXXX..","...XXXXXXXXXX...","....XXXXXXXX....","....X.X.X.X.X...","....XXXXXXXX....","................","................"];
const SPRITES = { ghost:[GHOST0,GHOST1], bat:[BAT0,BAT1], monk:[MONK0,MONK1], skull:[SKULL0,SKULL1] };

// 5x7 font, one byte per column, bit0 = top
const FONT = {
 A:[0x7E,0x11,0x11,0x11,0x7E],B:[0x7F,0x49,0x49,0x49,0x36],C:[0x3E,0x41,0x41,0x41,0x22],D:[0x7F,0x41,0x41,0x22,0x1C],
 E:[0x7F,0x49,0x49,0x49,0x41],F:[0x7F,0x09,0x09,0x09,0x01],G:[0x3E,0x41,0x49,0x49,0x7A],H:[0x7F,0x08,0x08,0x08,0x7F],
 I:[0x00,0x41,0x7F,0x41,0x00],J:[0x20,0x40,0x41,0x3F,0x01],K:[0x7F,0x08,0x14,0x22,0x41],L:[0x7F,0x40,0x40,0x40,0x40],
 M:[0x7F,0x02,0x0C,0x02,0x7F],N:[0x7F,0x04,0x08,0x10,0x7F],O:[0x3E,0x41,0x41,0x41,0x3E],P:[0x7F,0x09,0x09,0x09,0x06],
 Q:[0x3E,0x41,0x51,0x21,0x5E],R:[0x7F,0x09,0x19,0x29,0x46],S:[0x46,0x49,0x49,0x49,0x31],T:[0x01,0x01,0x7F,0x01,0x01],
 U:[0x3F,0x40,0x40,0x40,0x3F],V:[0x1F,0x20,0x40,0x20,0x1F],W:[0x3F,0x40,0x38,0x40,0x3F],X:[0x63,0x14,0x08,0x14,0x63],
 Y:[0x07,0x08,0x70,0x08,0x07],Z:[0x61,0x51,0x49,0x45,0x43],
 '0':[0x3E,0x51,0x49,0x45,0x3E],'1':[0x00,0x42,0x7F,0x40,0x00],'2':[0x42,0x61,0x51,0x49,0x46],'3':[0x21,0x41,0x45,0x4B,0x31],
 '4':[0x18,0x14,0x12,0x7F,0x10],'5':[0x27,0x45,0x45,0x45,0x39],'6':[0x3C,0x4A,0x49,0x49,0x30],'7':[0x01,0x71,0x09,0x05,0x03],
 '8':[0x36,0x49,0x49,0x49,0x36],'9':[0x06,0x49,0x49,0x29,0x1E],' ':[0,0,0,0,0],':':[0x00,0x36,0x36,0x00,0x00],
 '.':[0x00,0x60,0x60,0x00,0x00],'-':[0x08,0x08,0x08,0x08,0x08],"'":[0x00,0x05,0x03,0x00,0x00],'!':[0x00,0x00,0x5F,0x00,0x00],
 '?':[0x02,0x01,0x51,0x09,0x06],',':[0x00,0x50,0x30,0x00,0x00],'(':[0x00,0x1C,0x22,0x41,0x00],')':[0x00,0x41,0x22,0x1C,0x00],
 '/':[0x20,0x10,0x08,0x04,0x02],'&':[0x36,0x49,0x55,0x22,0x50],
};

// ---------------------------------------------------------------------------
// Room data. Legend: '#' wall  '=' floor  '^' nasty  'c' crumbling floor
// '>' '<' conveyor  'B' bed  '*' item.  Rooms form a 4x4 grid (id = row*4+col).
// ---------------------------------------------------------------------------
const ROOM_DATA = [
{ name:"RESCUE ESMERELDA", paper:BLACK, wall:RED, floor:GREEN, nasty:MAGENTA+B, extra:CYAN,
  guardians:[{kind:'bat',dir:'h',x:120,y:104,min:104,max:200,speed:2,color:CYAN+B}],
  map:[
"################################",
"#                               ",
"#                        *      ",
"#                      =====    ",
"#                               ",
"#             =====             ",
"#      *          ^^            ",
"#     =====                     ",
"#                 ====          ",
"#                             * ",
"#   ====                    ====",
"#              *                ",
"#            =====              ",
"#      =====             =====  ",
"#            ^^       ^^        ",
"#=========  ===================="]},
{ name:"ON THE ROOF", paper:BLACK, wall:RED, floor:GREEN+B, nasty:RED+B, extra:YELLOW,
  guardians:[{kind:'ghost',dir:'v',x:136,y:24,min:24,max:96,speed:2,color:WHITE}],
  map:[
"################################",
"                                ",
"          *                     ",
"        =====                   ",
"                           *    ",
"                         =====  ",
"    =====                       ",
"                                ",
"          ====        =====     ",
"                                ",
"    ====                ====    ",
"            *          *        ",
"          =====      =====      ",
"     =====                      ",
"                 ^^        ^^   ",
"=====================  ========="]},
{ name:"CONSERVATORY ROOF", paper:BLACK, wall:RED, floor:CYAN, nasty:GREEN+B, extra:MAGENTA,
  guardians:[{kind:'bat',dir:'h',x:96,y:104,min:96,max:152,speed:2,color:YELLOW+B},{kind:'ghost',dir:'v',x:224,y:16,min:16,max:60,speed:1,color:CYAN+B}],
  map:[
"################################",
"                                ",
"                    *           ",
"                  =====         ",
"        *                       ",
"      =====             =====   ",
"                                ",
"             =====   =====      ",
"                             *  ",
"    =====                  =====",
"                  ====          ",
"                                ",
"         =====         =====    ",
"        ^^              ^^      ",
"        ^^              ^^      ",
"===================  ==========="]},
{ name:"WATCH TOWER", paper:BLACK, wall:RED, floor:YELLOW, nasty:CYAN+B, extra:GREEN,
  guardians:[{kind:'skull',dir:'h',x:120,y:104,min:112,max:200,speed:2,color:WHITE+B}],
  map:[
"################################",
"                               #",
"          *                    #",
"        =====                  #",
"                       *       #",
"                     =====     #",
"    =====                      #",
"                           ^^  #",
"           =====        =====  #",
"                               #",
"    ====        =====          #",
"                    *          #",
"          =====   =====        #",
"              ^^    ^^         #",
"              ^^    ^^         #",
"##########  ####################"]},
{ name:"WEST WING", paper:BLACK, wall:BLUE+B, floor:MAGENTA, nasty:GREEN+B, extra:CYAN,
  guardians:[{kind:'ghost',dir:'v',x:24,y:16,min:16,max:88,speed:2,color:MAGENTA+B}],
  map:[
"#                               ",
"#       ======                  ",
"#                               ",
"#             *                 ",
"#           =====        *      ",
"#                      =====    ",
"#     ====                      ",
"#                               ",
"#          =====      =====     ",
"#                               ",
"#    ====       =====           ",
"#           *                   ",
"#         =====        =====    ",
"#         ^^      ^^            ",
"#         ^^      ^^            ",
"#=======================  ======"]},
{ name:"TOP LANDING", paper:BLACK, wall:RED, floor:WHITE, nasty:RED+B, extra:YELLOW,
  guardians:[{kind:'monk',dir:'h',x:80,y:104,min:80,max:160,speed:2,color:GREEN+B}],
  map:[
"                                ",
"                   ======       ",
"                                ",
"              *                 ",
"            =====               ",
"                       =====    ",
"      =====                   * ",
"                            ====",
"          =====      =====      ",
"                                ",
"    =====       =====           ",
"           *                    ",
"         =====        =====     ",
"           ^^       ^^          ",
"           ^^       ^^          ",
"======  ========================"]},
{ name:"MASTER BEDROOM", paper:BLACK, wall:RED, floor:CYAN+B, nasty:MAGENTA+B, extra:WHITE+B,
  guardians:[{kind:'ghost',dir:'v',x:240,y:24,min:24,max:96,speed:2,color:CYAN+B}],
  map:[
"                                ",
"                ======          ",
"                        *       ",
"                      =====     ",
" BBBB                           ",
" ####          =====            ",
"                                ",
"       =====                    ",
"             =====      =====   ",
"                                ",
"=====             =====         ",
"          *                     ",
"        =====          =====    ",
"     ^^              ^^         ",
"     ^^              ^^         ",
"===========  ==================="]},
{ name:"THE ATTIC", paper:BLACK, wall:RED, floor:GREEN, nasty:YELLOW+B, extra:MAGENTA,
  guardians:[{kind:'bat',dir:'h',x:96,y:104,min:96,max:160,speed:2,color:RED+B}],
  map:[
"                               #",
"        ======                 #",
"                               #",
"              *                #",
"            =====              #",
"                      =====    #",
"      =====                 *  #",
"                           ====#",
"          =====      =====     #",
"                               #",
"    =====       =====          #",
"           *                   #",
"         =====        =====    #",
"        ^^     ^^              #",
"        ^^     ^^              #",
"#####################  #########"]},
{ name:"THE CHAPEL", paper:BLACK, wall:BLUE+B, floor:YELLOW, nasty:RED+B, extra:WHITE,
  guardians:[{kind:'monk',dir:'h',x:128,y:104,min:120,max:176,speed:1,color:WHITE+B},{kind:'ghost',dir:'v',x:16,y:16,min:16,max:80,speed:2,color:YELLOW+B}],
  map:[
"#                               ",
"#                     ======    ",
"#                               ",
"#                          *    ",
"#                        =====  ",
"#             =====             ",
"#     *                         ",
"#   =====          =====        ",
"#                               ",
"#         =====          =====  ",
"#                               ",
"#    =====      =====           ",
"#                          *    ",
"#        =====         =====    ",
"#           ^^         ^^       ",
"#==============  ==============="]},
{ name:"BALLROOM EAST", paper:BLACK, wall:RED, floor:MAGENTA+B, nasty:CYAN+B, extra:GREEN,
  guardians:[{kind:'skull',dir:'h',x:96,y:104,min:96,max:176,speed:2,color:GREEN+B}],
  map:[
"                                ",
"    ======                      ",
"                                ",
"             *                  ",
"           =====                ",
"                     =====      ",
"     =====                  *   ",
"                          ====  ",
"         =====       =====      ",
"                                ",
"    =====       =====           ",
"           *                    ",
"         =====        =====     ",
"     =====                      ",
"        ^^          ^^          ",
"=======================  ======="]},
{ name:"THE BATHROOM", paper:BLACK, wall:RED, floor:CYAN, nasty:GREEN+B, extra:WHITE,
  guardians:[{kind:'ghost',dir:'h',x:128,y:104,min:128,max:200,speed:2,color:MAGENTA+B}],
  map:[
"                                ",
"         ======                 ",
"                                ",
"                *               ",
"              =====             ",
"                       =====    ",
"      =====                  *  ",
"                            ====",
"          =====      =====      ",
"                                ",
"    =====       =====           ",
"           *                    ",
"         =====        =====     ",
"     =====                      ",
"        ^^          ^^          ",
"===========================  ==="]},
{ name:"THE KITCHEN", paper:BLACK, wall:RED, floor:YELLOW+B, nasty:MAGENTA+B, extra:CYAN,
  guardians:[{kind:'monk',dir:'h',x:96,y:104,min:96,max:184,speed:2,color:CYAN+B}],
  map:[
"                               #",
"                   ======      #",
"                               #",
"              *                #",
"            =====              #",
"                       =====   #",
"      =====                 *  #",
"                           ====#",
"          =====      =====     #",
"                               #",
"======          =====          #",
"           *                   #",
"         =====        =====    #",
"              ^^    ^^         #",
"              ^^    ^^         #",
"#########  #####################"]},
{ name:"THE WINE CELLAR", paper:BLACK, wall:BLUE+B, floor:RED+B, nasty:GREEN+B, extra:YELLOW,
  guardians:[{kind:'bat',dir:'h',x:100,y:104,min:100,max:180,speed:2,color:YELLOW+B}],
  map:[
"#                               ",
"#            ======             ",
"#                               ",
"#                     *         ",
"#     =====        =====        ",
"#                               ",
"#            =====        ===== ",
"#     *                         ",
"#   =====         =====         ",
"#                          *    ",
"#        =====          =====   ",
"#                               ",
"#             =====   =====     ",
"#    =====                      ",
"#          ^^         ^^     *  ",
"################################"]},
{ name:"UNDER THE DRIVE", paper:BLACK, wall:RED, floor:GREEN+B, nasty:CYAN+B, extra:WHITE,
  guardians:[{kind:'skull',dir:'h',x:130,y:104,min:130,max:200,speed:2,color:RED+B}],
  map:[
"                                ",
"                     ======     ",
"                                ",
"              *                 ",
"            =====               ",
"                       =====    ",
"      =====                  *  ",
"                            ====",
"          =====      =====      ",
"                                ",
"======          =====           ",
"           *                    ",
"         =====        =====     ",
"     =====                      ",
"        ^^          ^^          ",
">>>>>>>>>>>>>>##<<<<<<<<<<<<<<<<"]},
{ name:"TOOL SHED", paper:BLACK, wall:RED, floor:WHITE, nasty:RED+B, extra:GREEN+B,
  guardians:[{kind:'ghost',dir:'h',x:96,y:104,min:96,max:176,speed:2,color:GREEN+B}],
  map:[
"                                ",
"                         ====== ",
"                    =====       ",
"              *                 ",
"            =====               ",
"                       =====    ",
"      =====                     ",
"                           cccc ",
"          =====      =====      ",
"                                ",
"======          =====           ",
"           *                  * ",
"         =====        ccccc  ===",
"     =====                      ",
"        ^^          ^^          ",
"################################"]},
{ name:"THE OFF LICENCE", paper:BLACK, wall:RED, floor:CYAN+B, nasty:YELLOW+B, extra:MAGENTA+B,
  guardians:[{kind:'monk',dir:'h',x:96,y:104,min:96,max:200,speed:2,color:MAGENTA+B}],
  map:[
"                               #",
"       ======                  #",
"                               #",
"              *                #",
"            =====              #",
"                       =====   #",
"      =====                 *  #",
"                           ====#",
"          =====      =====     #",
"                               #",
"    =====       =====          #",
"           *                   #",
"         =====        =====    #",
"     =====                     #",
"        ^^          ^^     *   #",
"################################"]},
];
const START_ROOM = 10, START_X = 8, START_Y = 104;

// ---------------------------------------------------------------------------
// Rendering helpers (pre-rendered, cached bitmaps)
// ---------------------------------------------------------------------------
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const bmCache = new Map();
function bitmap(rows, color, flip, key) {
  const k = key + '|' + color + '|' + (flip ? 1 : 0);
  let c = bmCache.get(k);
  if (c) return c;
  const w = rows[0].length, h = rows.length;
  c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = PAL[color];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (rows[y][x] === 'X') g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
  bmCache.set(k, c);
  return c;
}
let glyphSeq = 0;
function drawText(str, x, y, ink, paper) {
  str = str.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    const ch = str[i], cols = FONT[ch] || FONT[' '];
    if (paper !== undefined) { ctx.fillStyle = PAL[paper]; ctx.fillRect(x, y, 8, 8); }
    const rows = [];
    for (let r = 0; r < 7; r++) { let s = ''; for (let c = 0; c < 5; c++) s += (cols[c] >> r) & 1 ? 'X' : '.'; rows.push(s); }
    ctx.drawImage(bitmap(rows, ink, false, 'g' + ch), x + 1, y);
    x += 8;
  }
}
function drawTextCentered(str, y, ink, paper) { drawText(str, Math.floor((W - str.length * 8) / 2), y, ink, paper); }

// ---------------------------------------------------------------------------
// Sound (WebAudio square waves)
// ---------------------------------------------------------------------------
let audio = null;
function initAudio() { if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (audio && audio.state === 'suspended') audio.resume(); }
function beep(freq, dur, when = 0, vol = 0.06, type = 'square') {
  if (!audio) return;
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol;
  o.connect(g); g.connect(audio.destination);
  const t = audio.currentTime + when; o.start(t); o.stop(t + dur);
}
function sfxJump(i) { beep(300 + i * 40, 0.03); }
function sfxItem() { beep(880, 0.05); beep(1320, 0.06, 0.05); }
function sfxDeath() { for (let i = 0; i < 12; i++) beep(600 - i * 45, 0.05, i * 0.05, 0.08, 'sawtooth'); }
function sfxWin() { [523,659,784,1047].forEach((f, i) => beep(f, 0.15, i * 0.15)); }
// "If I Were a Rich Man" - opening motif (title tune)
const TUNE = [[392,2],[392,1],[440,1],[392,2],[349,2],[330,2],[330,1],[349,1],[330,2],[294,2],[262,2],[294,1],[330,1],[349,2],[330,2],[294,4]];
function playTune() { let t = 0; for (const [f, d] of TUNE) { beep(f, d * 0.11, t, 0.05); t += d * 0.12; } return t; }

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
let rooms, items, state, keys = {}, tick = 0, timeMin = 0, tuneAt = 0;
const willy = {};

function buildRooms() {
  rooms = ROOM_DATA.map((r, id) => ({ ...r, id, map: r.map.map(s => s.split('')), crumble: {} }));
  items = [];
  rooms.forEach(r => r.map.forEach((row, y) => row.forEach((ch, x) => {
    if (ch === '*') { items.push({ room: r.id, x, y, got: false }); row[x] = ' '; }
  })));
  rooms.forEach(r => r.guardians.forEach(g => { g.d = 1; g.frame = 0; }));
}
function neighbour(id, dx, dy) {
  const c = (id & 3) + dx, r = (id >> 2) + dy;
  if (c < 0 || c > 3 || r < 0 || r > 3) return -1;
  return r * 4 + c;
}
function tileAt(room, cx, cy) {
  if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return ' ';
  return room.map[cy][cx];
}
const STAND = { '=':1, '#':1, '>':1, '<':1, 'c':1, 'B':1 };

function enterRoom(id, x, y) {
  state.room = id;
  willy.x = x; willy.y = y;
  state.entry = { room: id, x, y, jumping: willy.jumping, jf: willy.jf, dir: willy.dir };
}
function resetWilly() {
  Object.assign(willy, { x: START_X, y: START_Y, dir: 1, frame: 0, jumping: false, jf: 0, fall: 0, onGround: false });
}
function newGame() {
  buildRooms(); resetWilly();
  state = { mode: 'play', lives: START_LIVES, collected: 0, room: START_ROOM, entry: null, dead: 0, msg: 0 };
  timeMin = 7 * 60; tick = 0;
  enterRoom(START_ROOM, START_X, START_Y);
}

// ---------------------------------------------------------------------------
// Physics
// ---------------------------------------------------------------------------
function blockedX(room, nx, y) {
  const c0 = Math.floor(nx / 8), c1 = Math.floor((nx + 7) / 8);
  const r0 = Math.floor(y / 8), r1 = Math.floor((y + 15) / 8);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (tileAt(room, c, r) === '#') return true;
  return false;
}
function headBlocked(room, x, ny) {
  const c0 = Math.floor(x / 8), c1 = Math.floor((x + 7) / 8), r = Math.floor(ny / 8);
  return tileAt(room, c0, r) === '#' || tileAt(room, c1, r) === '#';
}
function standingTiles(room, x, feet) {
  if (feet % 8 !== 0) return null;
  const r = feet / 8, c0 = Math.floor(x / 8), c1 = Math.floor((x + 7) / 8), t = [];
  for (let c = c0; c <= c1; c++) { const ch = tileAt(room, c, r); if (STAND[ch]) t.push({ c, r, ch }); }
  return t.length ? t : null;
}
function die() {
  state.mode = 'dying'; state.dead = 0; sfxDeath();
}
function afterDeath() {
  state.lives--;
  if (state.lives < 0) { state.mode = 'gameover'; state.dead = 0; return; }
  const e = state.entry;
  Object.assign(willy, { x: e.x, y: e.y, dir: e.dir, jumping: e.jumping, jf: e.jf, fall: 0, frame: 0 });
  state.room = e.room; state.mode = 'play';
  // make sure the respawn spot is not instantly fatal
  const room = rooms[state.room];
  room.guardians.forEach(g => { if (g.dir === 'h' && Math.abs(g.x - willy.x) < 40) g.x = g.max; });
}

function updateWilly() {
  const room = rooms[state.room];
  let left = keys.left, right = keys.right, jump = keys.jump || keys.jumpPressed;
  keys.jumpPressed = false;
  // conveyor
  const feet = willy.y + 16;
  const st = standingTiles(room, willy.x, feet);
  willy.onGround = !!st && !willy.jumping;
  let conv = 0;
  if (st) for (const t of st) { if (t.ch === '>') conv = 1; if (t.ch === '<') conv = -1; }
  // crumbling floors
  if (st && !willy.jumping) for (const t of st) if (t.ch === 'c') {
    const k = t.c + ',' + t.r; room.crumble[k] = (room.crumble[k] || 0) + 1;
    if (room.crumble[k] >= 10) { room.map[t.r][t.c] = ' '; delete room.crumble[k]; }
  }
  let dx = 0;
  if (willy.jumping) {
    dx = willy.jdir * 2;
  } else {
    if (willy.onGround && conv) { // JSW conveyors: cannot walk against the belt
      if (conv === 1) { dx = right || !left ? 2 : 0; if (!left && !right) dx = 2; }
      else { dx = left || !right ? -2 : 0; if (!left && !right) dx = -2; }
      if (conv === 1 && left && !right) dx = 0;
      if (conv === -1 && right && !left) dx = 0;
      if (dx) willy.dir = Math.sign(dx);
    } else if (left && !right) { dx = -2; willy.dir = -1; }
    else if (right && !left) { dx = 2; willy.dir = 1; }
    if (willy.onGround && jump && !willy.jumpHeld) {
      willy.jumping = true; willy.jf = 0; willy.jdir = dx / 2; willy.fall = 0;
    }
  }
  willy.jumpHeld = jump;
  // horizontal move
  if (dx) {
    const nx = willy.x + dx;
    if (!blockedX(room, nx, willy.y)) { willy.x = nx; willy.frame = (willy.frame + 1) & 3; }
    else if (willy.jumping) { /* keep vertical motion */ }
  }
  // vertical move
  let dy = 0;
  if (willy.jumping) {
    dy = JUMP[willy.jf]; willy.jf++;
    if (willy.jf % 2 === 0 && dy < 0) sfxJump(willy.jf);
    if (dy < 0 && headBlocked(room, willy.x, willy.y + dy)) { willy.jf = 11; dy = 0; }
    if (willy.jf >= JUMP.length) { willy.jumping = false; willy.fall = 0; }
  } else if (!willy.onGround) {
    dy = FALL_SPEED;
  }
  if (dy > 0) {
    // check each tile boundary crossed while moving down
    let landed = false;
    for (let b = willy.y + 16 + 1; b <= willy.y + 16 + dy; b++) {
      if (b % 8 === 0 && standingTiles(room, willy.x, b)) {
        willy.y = b - 16; landed = true; break;
      }
    }
    if (landed) {
      if (willy.jumping) willy.jumping = false;
      if (willy.fall > FATAL_FALL) { die(); return; }
      willy.fall = 0;
    } else { willy.y += dy; willy.fall += dy; }
  } else if (dy < 0) {
    willy.y += dy; willy.fall = 0;
  }
  // room transitions
  if (willy.x < 0) {
    const n = neighbour(state.room, -1, 0);
    if (n >= 0) enterRoom(n, 248, willy.y); else willy.x = 0;
  } else if (willy.x > 248) {
    const n = neighbour(state.room, 1, 0);
    if (n >= 0) enterRoom(n, 0, willy.y); else willy.x = 248;
  }
  if (willy.y + 16 < 0) {
    const n = neighbour(state.room, 0, -1);
    if (n >= 0) enterRoom(n, willy.x, willy.y + 128);
  } else if (willy.y > 112) {
    const n = neighbour(state.room, 0, 1);
    if (n >= 0) enterRoom(n, willy.x, willy.y - 128); else willy.y = 112;
  }
  // tile interactions
  const cur = rooms[state.room];
  const c0 = Math.floor(willy.x / 8), c1 = Math.floor((willy.x + 7) / 8);
  const r0 = Math.floor(willy.y / 8), r1 = Math.floor((willy.y + 15) / 8);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const ch = tileAt(cur, c, r);
    if (ch === '^') { die(); return; }
    if (ch === 'B' && state.collected === items.length) { state.mode = 'won'; state.dead = 0; sfxWin(); return; }
  }
  for (const it of items) if (!it.got && it.room === state.room && it.x >= c0 && it.x <= c1 && it.y >= r0 && it.y <= r1) {
    it.got = true; state.collected++; sfxItem();
  }
}

function updateGuardians(room) {
  for (const g of room.guardians) {
    if (g.dir === 'h') {
      g.x += g.d * g.speed;
      if (g.x >= g.max) { g.x = g.max; g.d = -1; } else if (g.x <= g.min) { g.x = g.min; g.d = 1; }
    } else {
      g.y += g.d * g.speed;
      if (g.y >= g.max) { g.y = g.max; g.d = -1; } else if (g.y <= g.min) { g.y = g.min; g.d = 1; }
    }
    if (tick % 4 === 0) g.frame ^= 1;
  }
}
function pixelHit(g) {
  const gs = SPRITES[g.kind][g.frame], flip = g.dir === 'h' && g.d < 0;
  const ws = WILLY[willy.frame], wflip = willy.dir < 0;
  const x0 = Math.max(willy.x, g.x), x1 = Math.min(willy.x + 8, g.x + 16);
  const y0 = Math.max(willy.y, g.y), y1 = Math.min(willy.y + 16, g.y + 16);
  if (x0 >= x1 || y0 >= y1) return false;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    let wx = x - willy.x; if (wflip) wx = 7 - wx;
    let gx = x - g.x; if (flip) gx = 15 - gx;
    if (ws[y - willy.y][wx] === 'X' && gs[y - g.y][gx] === 'X') return true;
  }
  return false;
}

function update() {
  tick++;
  if (state.mode === 'title') { return; }
  if (state.mode === 'play') {
    if (tick % 60 === 0) timeMin++;
    updateWilly();
    if (state.mode !== 'play') return;
    const room = rooms[state.room];
    updateGuardians(room);
    for (const g of room.guardians) if (pixelHit(g)) { die(); return; }
  } else if (state.mode === 'dying') {
    if (++state.dead > 24) afterDeath();
  } else if (state.mode === 'gameover' || state.mode === 'won') {
    state.dead++;
    if (state.dead > 40 && (keys.jump || keys.left || keys.right || keys.any)) { state.mode = 'title'; keys.any = false; }
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function drawRoom(room) {
  ctx.fillStyle = PAL[room.paper]; ctx.fillRect(0, 0, W, PLAY_H);
  const cf = (tick >> 1) & 3;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const ch = room.map[y][x];
    if (ch === ' ') continue;
    let rows = TILES[ch], color = room.floor, key = 't' + ch;
    if (ch === '#') color = room.wall;
    else if (ch === '^') color = room.nasty;
    else if (ch === 'B') color = room.extra;
    else if (ch === '>' || ch === '<') {
      color = room.extra; const f = ch === '>' ? cf : 3 - cf;
      rows = [CONV_FRAMES[0], CONV_FRAMES[(1 + f) & 3].slice(0, 8), TILES[ch][2], 'XXXXXXXX', '........', 'XXXXXXXX', TILES[ch][6], CONV_FRAMES[(3 - f) & 3]];
      key = 'conv' + ch + f;
    } else if (ch === 'c') {
      const st = room.crumble[x + ',' + y] || 0; color = room.floor;
      if (st) { rows = TILES.c.map((r, i) => i < 8 - Math.floor(st * 0.8) ? r : '........'); key = 'crumb' + st; }
    }
    ctx.drawImage(bitmap(rows, color, false, key), x * 8, y * 8);
  }
  for (const it of items) if (!it.got && it.room === room.id) {
    const col = 8 + 1 + ((tick + it.x * 3 + it.y) >> 2) % 6; // cycling bright colours
    ctx.drawImage(bitmap((it.x + it.y) & 1 ? ITEM : ITEM2, col, false, 'item' + ((it.x + it.y) & 1)), it.x * 8, it.y * 8);
  }
  for (const g of room.guardians)
    ctx.drawImage(bitmap(SPRITES[g.kind][g.frame], g.color, g.dir === 'h' && g.d < 0, g.kind + g.frame), g.x, g.y);
}
function drawWilly(x, y, frame, dir, color) {
  ctx.drawImage(bitmap(WILLY[frame], color, dir < 0, 'w' + frame), x, y);
}
function drawStatus(room) {
  ctx.fillStyle = PAL[BLACK]; ctx.fillRect(0, PLAY_H, W, H - PLAY_H);
  ctx.fillStyle = PAL[YELLOW]; ctx.fillRect(0, 128, W, 8);
  drawTextCentered(room.name, 128, BLACK);
  const h = Math.floor(timeMin / 60) % 24, m = timeMin % 60;
  const hh = ((h + 11) % 12) + 1, ampm = h < 12 ? 'AM' : 'PM';
  drawText('ITEMS ' + String(state.collected).padStart(3, '0') + '/' + items.length, 8, 144, WHITE + B);
  drawText('TIME ' + String(hh).padStart(2, ' ') + ':' + String(m).padStart(2, '0') + ampm, 152, 144, WHITE + B);
  for (let i = 0; i < state.lives; i++) drawWilly(8 + i * 16, 168, (tick >> 2) & 3, 1, CYAN + B);
  if (state.mode === 'dying') { ctx.fillStyle = PAL[(tick & 1) ? RED + B : YELLOW]; ctx.fillRect(0, 0, W, 2); ctx.fillRect(0, PLAY_H - 2, W, 2); }
}
function drawTitle() {
  ctx.fillStyle = PAL[BLACK]; ctx.fillRect(0, 0, W, H);
  drawTextCentered('JET SET WILLY', 24, YELLOW + B);
  drawTextCentered('A BROWSER RECREATION', 40, CYAN);
  drawWilly(124, 60, (tick >> 3) & 3, 1, WHITE + B);
  drawTextCentered('O P   OR   ARROWS  MOVE', 92, WHITE);
  drawTextCentered('SPACE OR UP        JUMP', 104, WHITE);
  drawTextCentered('ENTER OR ESC      PAUSE', 116, WHITE);
  drawTextCentered('COLLECT ALL ' + items.length + ' ITEMS', 140, GREEN + B);
  drawTextCentered('THEN GO TO BED', 152, GREEN + B);
  if ((tick >> 4) & 1) drawTextCentered('PRESS JUMP TO START', 176, MAGENTA + B);
}
function draw() {
  if (state.mode === 'title') { drawTitle(); return; }
  const room = rooms[state.room];
  drawRoom(room);
  if (state.mode === 'play' || state.mode === 'paused' || state.mode === 'dying' || state.mode === 'won')
    drawWilly(willy.x, willy.y, willy.frame, willy.dir, state.mode === 'dying' ? (tick & 1 ? RED + B : WHITE + B) : WHITE + B);
  drawStatus(room);
  if (state.mode === 'paused') drawTextCentered('PAUSED', 60, WHITE + B, BLUE);
  if (state.mode === 'gameover') {
    drawTextCentered('GAME OVER', 56, RED + B, WHITE + B);
    if (state.dead > 40) drawTextCentered('PRESS JUMP', 72, WHITE + B, BLACK);
  }
  if (state.mode === 'won') {
    drawTextCentered('WILLY CAN GO TO BED!', 48, YELLOW + B, BLUE);
    drawTextCentered('YOU WIN', 64, WHITE + B, BLUE);
    if (state.dead > 40) drawTextCentered('PRESS JUMP', 80, WHITE + B, BLACK);
  }
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
const KEYMAP = { ArrowLeft: 'left', KeyQ: 'left', KeyO: 'left', KeyA: 'left',
                 ArrowRight: 'right', KeyW: 'right', KeyP: 'right', KeyD: 'right',
                 ArrowUp: 'jump', Space: 'jump', KeyM: 'jump', KeyZ: 'jump' };
// (Q/W and O/P both work; the original used Q/W/E... too. P alone pauses when not moving.)
window.addEventListener('keydown', e => {
  initAudio();
  const k = KEYMAP[e.code];
  if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'KeyH') {
    if (state.mode === 'play') state.mode = 'paused'; else if (state.mode === 'paused') state.mode = 'play';
  }
  if (k) { if (k === 'jump' && !keys.jump) keys.jumpPressed = true; keys[k] = true; e.preventDefault(); }
  keys.any = true;
  if (state.mode === 'title' && (k === 'jump' || e.code === 'Enter')) { newGame(); }
});
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
function bindTouch(id, key) {
  const el = document.getElementById(id);
  const on = e => { e.preventDefault(); initAudio(); if (key === 'jump' && !keys.jump) keys.jumpPressed = true; keys[key] = true; keys.any = true; if (state.mode === 'title' && key === 'jump') newGame(); };
  const off = e => { e.preventDefault(); keys[key] = false; };
  el.addEventListener('touchstart', on, { passive: false }); el.addEventListener('touchend', off, { passive: false });
  el.addEventListener('touchcancel', off, { passive: false });
  el.addEventListener('mousedown', on); el.addEventListener('mouseup', off); el.addEventListener('mouseleave', off);
}
bindTouch('bl', 'left'); bindTouch('br', 'right'); bindTouch('bj', 'jump');
canvas.addEventListener('pointerdown', () => { initAudio(); if (state.mode === 'title') newGame(); });
window.addEventListener('blur', () => { keys = {}; if (state && state.mode === 'play') state.mode = 'paused'; });

// ---------------------------------------------------------------------------
// Scaling and main loop
// ---------------------------------------------------------------------------
function resize() {
  const touch = matchMedia('(pointer:coarse)').matches;
  const availH = window.innerHeight * (touch ? 0.74 : 0.98), availW = window.innerWidth * 0.98;
  let s = Math.floor(Math.min(availW / W, availH / H)); if (s < 1) s = Math.min(availW / W, availH / H);
  canvas.style.width = (W * s) + 'px'; canvas.style.height = (H * s) + 'px';
}
window.addEventListener('resize', resize); resize();

buildRooms();
state = { mode: 'title' };
let last = performance.now(), acc = 0;
function loop(now) {
  acc += now - last; last = now;
  if (acc > 200) acc = 200;
  while (acc >= TICK_MS) { update(); acc -= TICK_MS; }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
