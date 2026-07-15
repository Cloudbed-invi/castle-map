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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [interactionMode, setInteractionMode] = useState('draw'); // 'draw' or 'pan'
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgbbKey, setImgbbKey] = useState(() => localStorage.getItem('imgbbKey') || '');
  const [bitlyKey, setBitlyKey] = useState(() => localStorage.getItem('bitlyKey') || '');
  const [tinyUrlKey, setTinyUrlKey] = useState(() => localStorage.getItem('tinyUrlKey') || '');
  const [selectedTextId, setSelectedTextId] = useState(null);

  const [cellColors, setCellColors] = useState({});
  const [paletteColors, setPaletteColors] = useState(initialColors);
  const [activeColor, setActiveColor] = useState('#ef4444'); // Default red
  const [legendMap, setLegendMap] = useState({});
  const [paintState, setPaintState] = useState(null); // 'paint' or 'erase'
  const [history, setHistory] = useState([]);
  
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
    setHistory(prev => [...prev, cellColors].slice(-50)); // Keep last 50 states
    const mode = cellColors[cellNumber] === activeColor ? 'erase' : 'paint';
    setPaintState(mode);
    applyPaint(cellNumber, mode);
  };

  const handleCellPointerEnter = (e, cellNumber) => {
    if (interactionMode !== 'draw') return;
    if (e.buttons !== 1 || !paintState || !activeColor) return;
    applyPaint(cellNumber, paintState);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setCellColors(previousState);
      setHistory(newHistory);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history]);

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

  const handleCopyShortLink = async () => {
    const state = {
      cellColors, paletteColors, activeColor, legendMap, 
      zigzagColor, floatingTexts, mapTitle, mapSubtitle, exportDate, lines
    };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    const longUrl = window.location.origin + window.location.pathname + '#' + compressed;
    
    let urlToCopy = null;

    // Try free shortener first (is.gd supports CORS)
    try {
      const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.shorturl) urlToCopy = data.shorturl;
      }
    } catch (e) {
      console.log("Free shortener failed, falling back...");
    }

    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        alert("Short link copied to clipboard!");
      });
      return;
    }
    
    // Fallback to API keys
    if (tinyUrlKey) {
      try {
        const res = await fetch('https://api.tinyurl.com/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tinyUrlKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: longUrl, domain: "tinyurl.com" })
        });
        const data = await res.json();
        if (data.data && data.data.tiny_url) {
          urlToCopy = data.data.tiny_url;
        } else {
          console.error("TinyURL error:", data);
        }
      } catch (err) {
        console.error("TinyURL fetch error:", err);
      }
    } else if (bitlyKey) {
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
        }
      } catch (err) {
        console.error("Bitly fetch error:", err);
      }
    }

    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        alert("Short link copied to clipboard using your API Key!");
      });
    } else {
      alert("Map is too large for the free shortener! Please add a TinyURL or Bitly API Key in Settings.");
    }
  };

  const handleCopyLongLink = () => {
    const state = {
      cellColors, paletteColors, activeColor, legendMap, 
      zigzagColor, floatingTexts, mapTitle, mapSubtitle, exportDate, lines
    };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    const longUrl = window.location.origin + window.location.pathname + '#' + compressed;
    navigator.clipboard.writeText(longUrl).then(() => {
      alert("Full long link copied to clipboard! You can share this with anyone.");
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
    
    toPng(exportRef.current, { 
      backgroundColor: '#ffffff', 
      filter: filterExport, 
      pixelRatio: 3,
      style: { position: 'relative', left: '0px', top: '0px' }
    })
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

    toPng(exportRef.current, { 
      backgroundColor: '#ffffff', 
      filter: filterExport, 
      pixelRatio: 3,
      style: { position: 'relative', left: '0px', top: '0px' }
    })
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

  const mapAndLegend = (isExportMode) => (
    <>
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
        isExport={isExportMode}
      />
      
      {(paletteColors.some(c => legendMap[c]?.trim()) || exportDate) && (
        <div className="export-legend" style={{ marginTop: '20px', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            {paletteColors.some(c => legendMap[c]?.trim()) && <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#0f172a' }}>Map Key</h3>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              {paletteColors.filter(c => legendMap[c]?.trim()).map((color, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'max-content' }}>
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
    </>
  );

  return (
    <div className="app-container">
      <header className="header">
        <h1>SunFire Interactive Map</h1>
        <p>Interactive diamond grid map editor</p>
      </header>

      <div className="header-buttons">
          <div className="primary-actions">
            <div className="draw-pan-group" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.5)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button 
                className={interactionMode === 'draw' ? 'primary' : ''} 
                onClick={() => setInteractionMode('draw')}
                title="Draw Mode"
              >
                🖌️ Draw
              </button>
              <button 
                className={interactionMode === 'pan' ? 'primary' : ''} 
                onClick={() => setInteractionMode('pan')}
                title="Pan / Zoom Mode"
              >
                🖐️ Pan
              </button>
            </div>
            
            <button className="mobile-menu-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)} style={{ display: 'none' }}>
              {showMobileMenu ? '✕ Close' : '☰ Tools'}
            </button>
          </div>

          <div className={`action-buttons ${showMobileMenu ? 'show' : ''}`} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowHelp(true)}>
              ❓ Instructions
            </button>
            <button onClick={() => setShowSettings(true)}>
              ⚙️ Settings
            </button>
            <button onClick={handleResetBorders}>
              Reset Borders
            </button>
            <button onClick={handleCopyLongLink}>
              🔗 Copy Link
            </button>
            <button className="purple" onClick={handleCopyShortLink}>
              🪄 Short Link
            </button>
            <button className="warning" onClick={handleUploadImgbb}>
              ☁️ Upload ImgBB
            </button>
            <button className="success" onClick={handleExportImage}>
              Export Image
            </button>
          </div>
      </div>

      <main className="main-content">
        
        <div className="live-container">
          {mapAndLegend(false)}

          <div className="palette-overlay">
            <span style={{ fontWeight: 'bold', color: '#334155', alignSelf: 'center', marginRight: '10px' }}>Palette:</span>
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

            <div style={{ width: '2px', height: '28px', backgroundColor: '#e2e8f0', margin: '0 10px' }}></div>
            
            {paletteColors.length === 0 && <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center' }}>None selected</span>}
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

        {showSettings && (
          <SettingsPanel 
            colors={paletteColors}
            setColors={setPaletteColors}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            legendMap={legendMap}
            setLegendMap={setLegendMap}
            onAddColor={handleAddColor}
            cellColors={cellColors}
            lines={lines}
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
            tinyUrlKey={tinyUrlKey}
            setTinyUrlKey={(k) => { setTinyUrlKey(k); localStorage.setItem('tinyUrlKey', k); }}
            onClose={() => setShowSettings(false)}
          />
        )}
        
        {/* Off-screen Export Container */}
        <div 
          className="export-container" 
          ref={exportRef} 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            top: 0, 
            width: '840px', 
            backgroundColor: 'white', 
            padding: '20px',
            pointerEvents: 'none'
          }}
        >
          {mapAndLegend(true)}
        </div>

        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </main>
    </div>
  );
}

export default App;
