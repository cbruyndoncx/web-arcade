/**
 * NEO-QIX Entry Point
 */

import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const game = new Game(canvas);

  // Expose to window for debugging if needed
  window.__NEO_QIX_GAME__ = game;
});
