const LZString = require('lz-string');
const state = {
  cellColors: {},
  paletteColors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
  activeColor: '#ff0000',
  legendMap: { '#ff0000': 'Red Base', '#00ff00': 'Green Zone' },
  zigzagColor: '#000000',
  floatingTexts: [],
  mapTitle: 'Giant Map',
  mapSubtitle: 'Test',
  exportDate: true,
  lines: []
};
const colors = state.paletteColors;
for (let r = 0; r < 50; r++) {
  for (let c = 0; c < 50; c++) {
    state.cellColors[r + ',' + c] = colors[Math.floor(Math.random() * colors.length)];
  }
}
const json = JSON.stringify(state);
const compressed = LZString.compressToEncodedURIComponent(json);
const baseUrl = 'https://example.com/app/#';
const fullUrl = baseUrl + compressed;
console.log('JSON Length:', json.length);
console.log('Compressed URL Length:', fullUrl.length);
