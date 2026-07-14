import React, { useState, useRef, useEffect } from 'react';
import { MapGrid } from './components/MapGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { HelpModal } from './components/HelpModal';
import { toPng } from 'html-to-image';
import LZString from 'lz-string';

// Empty array so legends can be created dynamically
const initialColors = [];

function App() {
  const exportRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [interactionMode, setInteractionMode] = useState('draw'); // 'draw' or 'pan'
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgbbKey, setImgbbKey] = useState(() => localStorage.getItem('imgbbKey') || '');
  const [bitlyKey, setBitlyKey] = useState(() => localStorage.getItem('bitlyKey') || '');
  const [selectedTextId, setSelectedTextId] = useState(null);

  const [cellColors, setCellColors] = useState({});
  const [paletteColors, setPaletteColors] = useState(initialColors);
  const [activeColor, setActiveColor] = useState('#ef4444'); // Default red
  const [legendMap, setLegendMap] = useState({});
  const [paintState, setPaintState] = useState(null); // 'paint' or 'erase'
  
  const [zigzagColor, setZigzagColor] = useState('#000000'); // Default black for zigzag
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [mapTitle, setMapTitle] = useState('SunFire Castle');
  const [mapSubtitle, setMapSubtitle] = useState('Team A vs Team B');
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  // 2D Geometric Path state for the borders (explicit nodes)
  const initialLines = {
    n: [
      { "u": 3.5, "v": 3.5 }, { "u": 2.5, "v": 3.5 }, { "u": 2.5, "v": 2.5 },
      { "u": 1.5, "v": 2.5 }, { "u": 1.5, "v": 1.5 }, { "u": 0.5, "v": 1.5 },
      { "u": 0.5, "v": 0.5 }, { "u": -0.5, "v": 0.5 }
    ],
    s: [
      { "u": 9.5, "v": 9.5 }, { "u": 10.5, "v": 9.5 }, { "u": 10.5, "v": 10.5 },
      { "u": 11.5, "v": 10.5 }, { "u": 11.5, "v": 11.5 }, { "u": 12.5, "v": 11.5 },
      { "u": 12.5, "v": 12.5 }, { "u": 13.5, "v": 12.5 }
    ],
    e: [
      { "u": 9.5, "v": 3.5 }, { "u": 9.5, "v": 2.5 }, { "u": 10.5, "v": 2.5 },
      { "u": 10.5, "v": 1.5 }, { "u": 11.5, "v": 1.5 }, { "u": 11.5, "v": 0.5 },
      { "u": 12.5, "v": 0.5 }, { "u": 12.5, "v": -0.5 }
    ],
    w: [
      { "u": 3.5, "v": 9.5 }, { "u": 3.5, "v": 10.5 }, { "u": 2.5, "v": 10.5 },
      { "u": 2.5, "v": 11.5 }, { "u": 1.5, "v": 11.5 }, { "u": 1.5, "v": 12.5 },
      { "u": 0.5, "v": 12.5 }, { "u": 0.5, "v": 13.5 }
    ]
  };
  const [lines, setLines] = useState(initialLines);

  // Load state from URL hash or localStorage
  useEffect(() => {
    const loadState = () => {
      let savedState = null;
      if (window.location.hash) {
        try {
          const hash = window.location.hash.substring(1);
          const decompressed = LZString.decompressFromEncodedURIComponent(hash);
          savedState = JSON.parse(decompressed);
        } catch (e) {
          console.error("Failed to load from URL hash", e);
        }
      }
      if (!savedState) {
        try {
          const localStr = localStorage.getItem('sunfireMapState');
          if (localStr) savedState = JSON.parse(localStr);
        } catch (e) {
          console.error("Failed to load from local storage", e);
        }
      }

      if (savedState) {
        if (savedState.cellColors) setCellColors(savedState.cellColors);
        if (savedState.paletteColors) setPaletteColors(savedState.paletteColors);
        if (savedState.activeColor) setActiveColor(savedState.activeColor);
        if (savedState.legendMap) setLegendMap(savedState.legendMap);
        if (savedState.zigzagColor) setZigzagColor(savedState.zigzagColor);
        if (savedState.floatingTexts) setFloatingTexts(savedState.floatingTexts);
        if (savedState.mapTitle !== undefined) setMapTitle(savedState.mapTitle);
        if (savedState.mapSubtitle !== undefined) setMapSubtitle(savedState.mapSubtitle);
        if (savedState.exportDate !== undefined) setExportDate(savedState.exportDate);
        if (savedState.lines) setLines(savedState.lines);
      }
      setIsLoaded(true);
    };
    loadState();
  }, []);

  // Save state to localStorage automatically
  useEffect(() => {
    if (!isLoaded) return;
    const state = {
      cellColors, paletteColors, activeColor, legendMap, 
      zigzagColor, floatingTexts, mapTitle, mapSubtitle, exportDate, lines, showToolbar
    };
    localStorage.setItem('sunfireMapState', JSON.stringify(state));
  }, [isLoaded, cellColors, paletteColors, activeColor, legendMap, zigzagColor, floatingTexts, mapTitle, mapSubtitle, exportDate, lines, showToolbar]);

  useEffect(() => {
    const handleMouseUp = () => setPaintState(null);
    window.addEventListener('pointerup', handleMouseUp);
    return () => window.removeEventListener('pointerup', handleMouseUp);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (selectedTextId) {
          setFloatingTexts(prev => prev.filter(t => t.id !== selectedTextId));
          setSelectedTextId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextId]);

  const applyPaint = (cellNumber, mode) => {
    setCellColors(prev => {
      if (mode === 'erase' && prev[cellNumber] === activeColor) {
        const next = { ...prev };
        delete next[cellNumber];
        return next;
      } else if (mode === 'paint' && prev[cellNumber] !== activeColor) {
        return { ...prev, [cellNumber]: activeColor };
      }
      return prev;
    });
  };

  const handleCellPointerDown = (e, cellNumber) => {
    if (interactionMode !== 'draw') return;
    if (e.button !== 0 || !activeColor) return;
    const mode = cellColors[cellNumber] === activeColor ? 'erase' : 'paint';
    setPaintState(mode);
    applyPaint(cellNumber, mode);
  };

  const handleCellPointerEnter = (e, cellNumber) => {
    if (interactionMode !== 'draw') return;
    if (e.buttons !== 1 || !paintState || !activeColor) return;
    applyPaint(cellNumber, paintState);
  };

  const handleAddColor = (newColor) => {
    if (!paletteColors.includes(newColor)) {
      setPaletteColors([...paletteColors, newColor]);
    }
    setActiveColor(newColor);
  };

  const handleResetBorders = () => {
    setLines(initialLines);
  };

  const handleExportLayout = () => {
    const layoutStr = JSON.stringify(lines, null, 2);
    navigator.clipboard.writeText(layoutStr).then(() => {
      alert("Layout configuration copied to clipboard! Please paste it in our chat.");
    }).catch(err => {
      console.error("Failed to copy:", err);
      alert("Failed to copy. Please check the browser console to see the config.");
      console.log(layoutStr);
    });
  };

  const handleCopyShareLink = async () => {
    const state = {
      cellColors, paletteColors, activeColor, legendMap, 
      zigzagColor, floatingTexts, mapTitle, mapSubtitle, exportDate, lines
    };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    const longUrl = window.location.origin + window.location.pathname + '#' + compressed;
    
    let urlToCopy = longUrl;
    
    if (bitlyKey) {
      try {
        const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bitlyKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ long_url: longUrl, domain: "bit.ly" })
        });
        const data = await res.json();
        if (data.link) {
          urlToCopy = data.link;
        } else {
          console.error("Bitly error:", data);
          alert("Bitly shortening failed. Using long URL.");
        }
      } catch (err) {
        console.error("Bitly fetch error:", err);
        alert("Bitly shortening failed. Using long URL.");
      }
    }

    navigator.clipboard.writeText(urlToCopy).then(() => {
      alert("Shareable link copied to clipboard! You can share this with anyone.");
    }).catch(err => {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link.");
    });
  };

  const filterExport = (node) => {
    if (node.getAttribute && typeof node.getAttribute === 'function') {
      const cls = node.getAttribute('class') || '';
      if (cls.includes('drag-handle') || cls.includes('drag-node')) {
        return false;
      }
    }
    return true;
  };

  const handleUploadImgbb = () => {
    if (!imgbbKey) {
      alert("Please enter your ImgBB API key in the settings first.");
      setShowSettings(true);
      return;
    }
    if (!exportRef.current) return;
    
    toPng(exportRef.current, { backgroundColor: '#ffffff', filter: filterExport })
      .then((dataUrl) => {
        const base64Data = dataUrl.split(',')[1];
        const formData = new FormData();
        formData.append('image', base64Data);
        
        return fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: formData
        });
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigator.clipboard.writeText(data.data.url).then(() => {
            alert(`Map uploaded successfully! Link copied to clipboard:\n${data.data.url}`);
          });
        } else {
          alert(`Upload failed: ${data.error?.message || 'Unknown error'}`);
        }
      })
      .catch((err) => {
        console.error('Failed to upload image', err);
        alert('Could not upload image. See console for details.');
      });
  };

  const handleExportImage = () => {
    if (!exportRef.current) return;

    toPng(exportRef.current, { backgroundColor: '#ffffff', filter: filterExport })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'sunfire-map.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export image', err);
        alert('Could not export image. See console for details.');
      });
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>SunFire Interactive Map</h1>
        <p>Interactive diamond grid map editor</p>
        <div className="header-buttons" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowHelp(true)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ❓ Instructions
          </button>
          <button onClick={() => setShowSettings(true)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚙️ Settings
          </button>
          <button onClick={handleResetBorders} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Reset Borders
          </button>
          <button onClick={handleCopyShareLink} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer' }}>
            🔗 Share Link
          </button>
          <button onClick={handleUploadImgbb} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer' }}>
            ☁️ Upload ImgBB
          </button>
          <button onClick={handleExportImage} style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>
            Export Image
          </button>
          <button onClick={() => setShowToolbar(!showToolbar)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            {showToolbar ? 'Hide Tools' : 'Show Tools'}
          </button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {showToolbar && (
          <div className="toolbar" style={{ backgroundColor: 'white', borderRadius: '8px', marginBottom: '20px', width: '100%', maxWidth: '840px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
              <button 
                onClick={() => setInteractionMode('draw')}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: interactionMode === 'draw' ? '#e2e8f0' : 'white', cursor: 'pointer', fontWeight: interactionMode === 'draw' ? 'bold' : 'normal' }}
              >
                🖌️ Draw
              </button>
              <button 
                onClick={() => setInteractionMode('pan')}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: interactionMode === 'pan' ? '#e2e8f0' : 'white', cursor: 'pointer', fontWeight: interactionMode === 'pan' ? 'bold' : 'normal' }}
              >
                🖐️ Pan / Zoom
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: interactionMode === 'draw' ? 1 : 0.5, pointerEvents: interactionMode === 'draw' ? 'auto' : 'none' }}>
              <span style={{ fontWeight: 'bold', color: '#334155' }}>Add to Palette:</span>
              <div className="color-options">
                {['#f472b6', '#60a5fa', '#fb923c', '#86efac', '#c084fc', '#000000'].map(rc => (
                  <div 
                    key={rc}
                    className="color-swatch"
                    style={{ backgroundColor: rc }}
                    onClick={() => handleAddColor(rc)}
                    title="Add to palette"
                  />
                ))}
                <div className="color-picker-wrapper" style={{ width: '28px', height: '28px' }}>
                   <input 
                     type="color" 
                     className="color-picker-input"
                     onChange={(e) => handleAddColor(e.target.value)}
                     title="Add custom color"
                   />
                   <div className="color-picker-btn" style={{ fontSize: '1.2rem' }}>+</div>
                </div>
              </div>
            </div>

            <div style={{ width: '2px', height: '30px', backgroundColor: '#e2e8f0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#334155' }}>Active Color:</span>
              <div className="color-options">
                {paletteColors.length === 0 && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None added</span>}
                {paletteColors.map((color, index) => (
                  <div
                    key={`${color}-${index}`}
                    className={`color-swatch ${activeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                    title={legendMap[color] || 'Unlabeled'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="export-container" ref={exportRef} style={{ backgroundColor: 'white', width: '100%', maxWidth: '840px', borderRadius: '8px' }}>
          
          <MapGrid 
            cellColors={cellColors}
            activeColor={activeColor}
            onCellPointerDown={handleCellPointerDown}
            onCellPointerEnter={handleCellPointerEnter}
            zigzagColor={zigzagColor}
            lines={lines}
            setLines={setLines}
            floatingTexts={floatingTexts}
            setFloatingTexts={setFloatingTexts}
            selectedTextId={selectedTextId}
            setSelectedTextId={setSelectedTextId}
            mapTitle={mapTitle}
            mapSubtitle={mapSubtitle}
            interactionMode={interactionMode}
          />
          
          {/* Static Map Key for Export */}
          {(paletteColors.some(c => legendMap[c]?.trim()) || exportDate) && (
            <div className="export-legend" style={{ marginTop: '20px', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                {paletteColors.some(c => legendMap[c]?.trim()) && <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#0f172a' }}>Map Key</h3>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {paletteColors.filter(c => legendMap[c]?.trim()).map((color, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', backgroundColor: color, border: '1px solid #ccc', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>
                        {legendMap[color]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {exportDate && (
                <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', textAlign: 'right', marginLeft: '20px' }}>
                  {formatDate(exportDate)}
                </div>
              )}
            </div>
          )}
        </div>

        {showSettings && (
          <SettingsPanel 
            colors={paletteColors}
            setColors={setPaletteColors}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            legendMap={legendMap}
            setLegendMap={setLegendMap}
            onAddColor={handleAddColor}
            zigzagColor={zigzagColor}
            setZigzagColor={setZigzagColor}
            floatingTexts={floatingTexts}
            setFloatingTexts={setFloatingTexts}
            mapTitle={mapTitle}
            setMapTitle={setMapTitle}
            mapSubtitle={mapSubtitle}
            setMapSubtitle={setMapSubtitle}
            exportDate={exportDate}
            setExportDate={setExportDate}
            imgbbKey={imgbbKey}
            setImgbbKey={(k) => { setImgbbKey(k); localStorage.setItem('imgbbKey', k); }}
            bitlyKey={bitlyKey}
            setBitlyKey={(k) => { setBitlyKey(k); localStorage.setItem('bitlyKey', k); }}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </main>
    </div>
  );
}

export default App;
