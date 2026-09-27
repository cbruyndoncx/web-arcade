/**
 * NEO-QIX Automated Test Suite
 * Validates grid math, partition flood-fill, Qix physics, Sparx navigation,
 * and game rules.
 */

import { Grid, CELL_EMPTY, CELL_BORDER, CELL_FILLED_FAST, CELL_FILLED_SLOW } from '../js/grid.js';
import { Player } from '../js/player.js';
import { Qix } from '../js/qix.js';
import { Sparx } from '../js/sparx.js';
import { PowerupManager, POWERUP_TYPES } from '../js/powerups.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- 1. Testing Grid Initialization & Boundary Properties ---');
const grid = new Grid(100, 100);
assert(grid.width === 100 && grid.height === 100, 'Grid dimensions 100x100');
assert(grid.isBorder(0, 0), 'Corner (0,0) is BORDER');
assert(grid.isBorder(99, 99), 'Corner (99,99) is BORDER');
assert(grid.isBorder(50, 0), 'Top perimeter is BORDER');
assert(grid.isBorder(50, 99), 'Bottom perimeter is BORDER');
assert(grid.isBorder(0, 50), 'Left perimeter is BORDER');
assert(grid.isBorder(99, 50), 'Right perimeter is BORDER');
assert(grid.isEmpty(50, 50), 'Center (50,50) is EMPTY');
assert(grid.totalPlayableCells === 98 * 98, 'Total playable cells is 98*98 = 9604');

console.log('\n--- 2. Testing Stix Territory Partitioning & Flood Fill ---');
// Draw a vertical line cutting down the middle from (50, 0) to (50, 99)
const stix = [];
for (let y = 0; y < 100; y++) {
  stix.push({ x: 50, y });
}

// Place Qix on the left side: (25, 50)
const mockQix = [{ x: 25, y: 50 }];

const result = grid.partition(stix, 'fast', mockQix);
console.log(`  Partition Result: newPercent=${result.newPercent.toFixed(2)}%, totalPercent=${result.totalPercent.toFixed(2)}%`);

assert(result.newCellsCount > 0, 'New cells captured > 0');
assert(Math.abs(result.newPercent - 50) < 3.0, 'Right half (~50%) of playfield captured');
assert(grid.isEmpty(25, 50), 'Left side containing Qix remains EMPTY');
assert(grid.get(75, 50) === CELL_FILLED_FAST, 'Right side without Qix is FILLED_FAST');
assert(grid.isBorder(50, 50), 'Cut line became BORDER facing empty space');

console.log('\n--- 3. Testing Slow Draw (Molten Gold / 2x) Partition ---');
const grid2 = new Grid(100, 100);
const stix2 = [];
for (let x = 0; x < 100; x++) {
  stix2.push({ x, y: 30 });
}
const mockQix2 = [{ x: 50, y: 60 }]; // Qix in lower section
const result2 = grid2.partition(stix2, 'slow', mockQix2);

assert(grid2.get(50, 15) === CELL_FILLED_SLOW, 'Upper region filled with CELL_FILLED_SLOW');
assert(grid2.isEmpty(50, 60), 'Lower region containing Qix remains EMPTY');
assert(result2.newCellsCount > 0, 'Slow partition captured cells');

console.log('\n--- 4. Testing 2-Qix Separation (Qix Split Bonus) ---');
const grid3 = new Grid(100, 100);
const stix3 = [];
for (let y = 0; y < 100; y++) {
  stix3.push({ x: 50, y });
}
// 2 Qixes on opposite sides of the cut!
const qix1 = { x: 25, y: 50 };
const qix2 = { x: 75, y: 50 };
const splitResult = grid3.partition(stix3, 'fast', [qix1, qix2]);

assert(splitResult.qixSplit === true, 'Detected 2-Qix split across partitioned boundary!');

console.log('\n--- 5. Testing Qix Collision Detection & Near Miss ---');
const testQix = new Qix(grid3, { x: 50, y: 50, speed: 1.5 });
// Player draws a line passing directly through the Qix center
const intersectingStix = [
  { x: 30, y: 50 },
  { x: 70, y: 50 }
];
testQix.p1 = { x: 50, y: 30 };
testQix.p2 = { x: 50, y: 70 };
testQix.history = [{ p1: testQix.p1, p2: testQix.p2 }];

const didHit = testQix.checkCollisionWithStix(intersectingStix);
assert(didHit === true, 'Collision detected when Qix crosses active drawing line');

// Near miss test: line is 4 units away
const nearStix = [
  { x: 30, y: 26 },
  { x: 70, y: 26 }
];
const isNear = testQix.checkNearMiss(nearStix, 6);
assert(isNear === true, 'Near-miss accurately detected within 6 units');

console.log('\n--- 6. Testing Sparx Border Patrol & Tracking ---');
const sparx = new Sparx(grid, { x: 0, y: 0, direction: 1, moveInterval: 1 });
assert(grid.isBorder(sparx.x, sparx.y), 'Sparx starts on border');

for (let s = 0; s < 10; s++) {
  sparx.update({ x: 50, y: 0 }, null);
}
assert(grid.isBorder(sparx.x, sparx.y), 'Sparx remains on border after multiple steps');

// Super Sparx test
sparx.setSuper(true);
assert(sparx.isSuper === true, 'Sparx successfully transitions to Super Sparx');

console.log('\n--- 7. Testing Player Movement & Fuse Ignition ---');
const playerGrid = new Grid(100, 100);
const testPlayer = new Player(playerGrid, {});
assert(testPlayer.mode === 'BORDER', 'Player starts in BORDER mode');

// Simulate moving into void with drawFast = true
const inputs = { up: true, down: false, left: false, right: false, drawFast: true, drawSlow: false };
testPlayer.x = 50;
testPlayer.y = 99; // bottom border

testPlayer.update(inputs, null, null);
assert(testPlayer.mode === 'DRAWING', 'Player entered DRAWING mode when stepping into void');
assert(testPlayer.drawType === 'fast', 'Player drawing in FAST mode');
assert(testPlayer.stix.length >= 2, 'Stix path records points');

// Stand still for 30 ticks to trigger Fuse
const idleInputs = { up: false, down: false, left: false, right: false, drawFast: false, drawSlow: false };
for (let i = 0; i < 30; i++) {
  testPlayer.update(idleInputs, null, null);
}
assert(testPlayer.fuseLit === true, 'Fuse ignited after idle threshold while drawing');

console.log('\n--- 8. Testing Power-up Core Capture ---');
const powerupMgr = new PowerupManager(grid);
powerupMgr.activeCores = [
  { x: 75, y: 50, type: POWERUP_TYPES.EMP, life: 900, pulseAngle: 0 }
];
// In section 2, (75, 50) was filled!
const collected = powerupMgr.checkCapturedCores();
assert(collected.length === 1 && collected[0].id === 'emp', 'Power-up collected when enclosed in captured territory');

console.log('\n--- 9. Testing Dynamic Border Recovery (findClosestBorderCell) ---');
const filledCornerGrid = new Grid(100, 100);
const cutStix = [];
for (let x = 0; x < 100; x++) cutStix.push({ x, y: 50 });
filledCornerGrid.partition(cutStix, 'fast', [{ x: 50, y: 25 }]); // Top half has Qix, bottom half is filled
// Point (50, 99) is in filled territory
const closest = filledCornerGrid.findClosestBorderCell(50, 99);
assert(filledCornerGrid.isBorder(closest.x, closest.y), 'findClosestBorderCell finds a valid border cell from deep within captured territory');
assert(closest.y === 50, 'Closest border to (50,99) correctly found at y=50');

console.log('\n--- 10. Testing Sparx Stix Collision Detection ---');
const testSparx = new Sparx(filledCornerGrid, { x: 50, y: 50 });
const activeDrawingStix = [
  { x: 50, y: 48 },
  { x: 50, y: 49 },
  { x: 50, y: 50 },
  { x: 50, y: 51 }
];
assert(testSparx.checkCollisionWithStix(activeDrawingStix, 2.0), 'Sparx correctly detects collision with active Stix line');

console.log('\n=======================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('=======================================\n');

if (failed > 0) {
  process.exit(1);
}
