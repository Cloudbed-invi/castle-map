import React from 'react';

export function SettingsPanel({ 
  colors, setColors, activeColor, setActiveColor, 
  legendMap, setLegendMap, 
  onAddColor, 
  zigzagColor, setZigzagColor,
  floatingTexts, setFloatingTexts,
  mapTitle, setMapTitle,
  mapSubtitle, setMapSubtitle,
  exportDate, setExportDate,
  imgbbKey, setImgbbKey,
  bitlyKey, setBitlyKey,
  onClose
}) {
  const recommendedColors = ['#f472b6', '#60a5fa', '#fb923c', '#86efac', '#c084fc', '#000000'];

  const handleAddText = () => {
    const offset = floatingTexts.length * 20;
    setFloatingTexts(prev => [
      ...prev,
      { id: Date.now(), text: 'New Label', x: offset, y: 350 + offset, size: 48, rotate: 0 }
    ]);
  };

  const handleUpdateText = (id, newText) => {
    setFloatingTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const handleUpdateTextProp = (id, prop, value) => {
    setFloatingTexts(prev => prev.map(t => t.id === id ? { ...t, [prop]: value } : t));
  };

  const handleDeleteText = (id) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Map Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="settings-section">
          <h3>Border Line</h3>
          <div className="color-options">
            <div className="color-picker-wrapper" style={{ borderColor: zigzagColor, width: '28px', height: '28px' }}>
               <input 
                 type="color" 
                 className="color-picker-input"
                 value={zigzagColor}
                 onChange={(e) => setZigzagColor(e.target.value)}
               />
               <div className="color-picker-btn" style={{ backgroundColor: zigzagColor, width: '100%', height: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: '1.5rem' }}>
          <h3>Titles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Map Title (e.g. SunFire Castle)"
              value={mapTitle} 
              onChange={(e) => setMapTitle(e.target.value)}
              style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input 
              type="text" 
              placeholder="Map Subtitle (e.g. Team A vs Team B)"
              value={mapSubtitle} 
              onChange={(e) => setMapSubtitle(e.target.value)}
              style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Export Date</span>
              <input 
                type="date" 
                value={exportDate} 
                onChange={(e) => setExportDate(e.target.value)}
                style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        <div className="settings-section" style={{ marginTop: '1.5rem' }}>
          <h3>Floating Texts</h3>
          <button onClick={handleAddText} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}>+ Add Text</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {floatingTexts.map(item => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={item.text} 
                    onChange={(e) => handleUpdateText(item.id, e.target.value)}
                    style={{ flex: 1, padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button onClick={() => handleDeleteText(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 0.5rem' }}>X</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', width: '30px', color: '#64748b' }}>Size</span>
                  <input type="range" min="12" max="150" value={item.size || 48} onChange={(e) => handleUpdateTextProp(item.id, 'size', Number(e.target.value))} style={{ flex: 1, cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.7rem', width: '20px', color: '#64748b', textAlign: 'right' }}>{item.size || 48}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', width: '30px', color: '#64748b' }}>Angle</span>
                  <input type="range" min="-180" max="180" value={item.rotate || 0} onChange={(e) => handleUpdateTextProp(item.id, 'rotate', Number(e.target.value))} style={{ flex: 1, cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.7rem', width: '20px', color: '#64748b', textAlign: 'right' }}>{item.rotate || 0}°</span>
                </div>
              </div>
            ))}
            {floatingTexts.length === 0 && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No floating texts</span>}
          </div>
        </div>
        <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <h3>API Keys (Optional)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>ImgBB API Key</label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>
              To upload maps directly to ImgBB, enter your free API key from <a href="https://api.imgbb.com" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>api.imgbb.com</a>.
            </p>
            <input 
              type="text" 
              placeholder="Your ImgBB API Key"
              value={imgbbKey} 
              onChange={(e) => setImgbbKey(e.target.value)}
              style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#334155' }}>Bitly API Key (URL Shortener)</label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>
              To shorten Share Links, enter a Bitly API Key (Bearer Token).
            </p>
            <input 
              type="text" 
              placeholder="Your Bitly Access Token"
              value={bitlyKey} 
              onChange={(e) => setBitlyKey(e.target.value)}
              style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
            />
          </div>
        </div>

        {colors.length > 0 && (
          <div className="settings-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <h3>Map Key Labels</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>These will appear below the map when exporting.</p>
            <div className="legend-grid" style={{ gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              {colors.map((color, index) => (
                <div key={`${color}-${index}`} className="legend-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div className="legend-swatch" style={{ backgroundColor: color, width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0 }} />
                  <input
                    type="text"
                    className="legend-input"
                    placeholder="Label..."
                    value={legendMap[color] || ''}
                    onChange={(e) => setLegendMap(prev => ({ ...prev, [color]: e.target.value }))}
                    style={{ flex: 1, padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button 
                    onClick={() => {
                      setColors(prev => prev.filter(c => c !== color));
                      setLegendMap(prev => { const next = {...prev}; delete next[color]; return next; });
                    }}
                    style={{ padding: '0.25rem', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    title="Remove from Legend"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
