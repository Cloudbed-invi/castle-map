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
            <li>Use the <strong>Show Tools</strong> button at the top to open the Paint Toolbar.</li>
            <li>Click any color in <em>"Add to Palette"</em> to add it to your <strong>Active Colors</strong>.</li>
            <li>Select an Active Color, then <strong>click and drag</strong> over the diamond grid to paint multiple cells quickly!</li>
            <li>To erase, simply paint over an already colored cell with the same active color.</li>
          </ul>

          <h3>🏷️ 2. Customizing the Legend</h3>
          <ul style={{ margin: '0 0 1.5rem 1.5rem', padding: 0 }}>
            <li>Open <strong>⚙️ Settings</strong> to assign labels to your colors (e.g., "Team A", "Main Base").</li>
            <li>Any unassigned colors are automatically hidden from the final exported image.</li>
            <li>You can completely remove a color from your palette by clicking the red <strong>×</strong> in Settings.</li>
          </ul>

          <h3>🔤 3. Floating Text Labels</h3>
          <ul style={{ margin: '0 0 1.5rem 1.5rem', padding: 0 }}>
            <li>In Settings, scroll to the <strong>Floating Texts</strong> section and click <strong>Add New Text Label</strong>.</li>
            <li>You can drag the label anywhere on the map.</li>
            <li>To <strong>delete</strong> a label directly from the map, click on it (it will highlight with a blue dashed box) and press the <strong>Delete</strong> or <strong>Backspace</strong> key.</li>
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
