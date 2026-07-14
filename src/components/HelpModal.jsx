import React from 'react';

export function HelpModal({ onClose }) {
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>How to Use the Map Editor</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="settings-section" style={{ lineHeight: '1.6', color: '#334155' }}>
          <h3 style={{ marginTop: '0' }}>🎨 1. Painting the Map</h3>
          <ul style={{ margin: '0 0 1.5rem 1.5rem', padding: 0 }}>
            <li>Select any color from the <strong>Palette</strong> at the bottom of the screen.</li>
            <li>In <strong>🖌️ Draw Mode</strong>, click and drag over the diamond grid to paint multiple cells quickly!</li>
            <li>To erase, select the active color again, then paint over cells to clear them.</li>
            <li>Add custom colors by clicking the <strong>+</strong> button on the palette.</li>
          </ul>

          <h3>🗺️ 2. Navigation</h3>
          <ul style={{ margin: '0 0 1.5rem 1.5rem', padding: 0 }}>
            <li><strong>PC:</strong> Scroll anywhere to zoom. Right-click and drag to pan instantly (or use 🖐️ Pan Mode). Double right-click (or double left-click) to reset the view.</li>
            <li><strong>Mobile:</strong> Use two fingers to pinch-to-zoom or pan around the map.</li>
            <li><strong>Borders:</strong> Click and drag the thick colored border lines (N/S/E/W) to resize the diamond grid.</li>
          </ul>

          <h3>🏷️ 3. Map Key & Labels</h3>
          <ul style={{ margin: '0 0 1.5rem 1.5rem', padding: 0 }}>
            <li>Open <strong>⚙️ Settings</strong> to assign labels to your colors (e.g., "Team A", "Main Base"). Unassigned colors are hidden from the final export.</li>
            <li>In Settings, you can also add <strong>Floating Texts</strong>. Drag them anywhere on the map, or select them and press Delete to remove.</li>
          </ul>

          <h3>💾 4. Saving & Sharing</h3>
          <ul style={{ margin: '0 0 1.5rem 1.5rem', padding: 0 }}>
            <li><strong>Auto-save:</strong> Your progress is automatically saved to your local browser! You won't lose it if you close the tab.</li>
            <li><strong>🔗 Share Link:</strong> Generates a URL that contains your exact map layout. You can share this link with anyone so they can see your map.</li>
            <li><strong>API Integrations:</strong> In Settings, you can optionally enter a <em>Bitly API Key</em> to generate short URLs, or an <em>ImgBB API Key</em> to instantly upload the map picture to the web.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
