import React, { useRef, useState } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';

const MapControls = () => {
  const { resetTransform } = useControls();
  return (
    <button 
      className="reset-view-btn" 
      onClick={() => resetTransform()} 
      title="Reset View"
    >
      🔄
    </button>
  );
};

function getCellNumber(u, v) {
  let r = Math.min(u, 13 - u, v, 13 - v);
  if (r > 3) return null;

  let min_c = r;
  let max_c = 13 - r;
  let start_vals = { 0: 109, 1: 65, 2: 29, 3: 1 };
  let val = start_vals[r];

  if (v === min_c && u > min_c) return val + (u - min_c - 1);
  val += (max_c - min_c);
  if (u === max_c && v > min_c) return val + (v - min_c - 1);
  val += (max_c - min_c);
  if (v === max_c && u < max_c) return val + (max_c - 1 - u);
  val += (max_c - min_c);
  if (u === min_c && v < max_c) return val + (max_c - 1 - v);

  if (u === 0 && v === 0) return 160;
  return null;
}

export function MapGrid({ cellColors, activeColor, onCellPointerDown, onCellPointerEnter, zigzagColor, lines, setLines, floatingTexts, setFloatingTexts, selectedTextId, setSelectedTextId, mapTitle, mapSubtitle, interactionMode = 'draw', isExport = false }) {
  const SIZE = 24; 
  const svgRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { id, cIndex, controlsU, nodeType, pointerId }

  const cells = [];
  const labelCells = [];
  const labels = { 'N': { u: 4, v: 4 }, 'E': { u: 9, v: 4 }, 'S': { u: 9, v: 9 }, 'W': { u: 4, v: 9 } };

  for (let u = 0; u <= 13; u++) {
    for (let v = 0; v <= 13; v++) {
      const num = getCellNumber(u, v);
      let label = null;
      for (const [l, coords] of Object.entries(labels)) {
        if (coords.u === u && coords.v === v) label = l;
      }
      if (num === null && !label) continue;
      const cx = (u - v) * SIZE;
      const cy = (u + v) * SIZE;
      const points = `${cx},${cy - SIZE} ${cx + SIZE},${cy} ${cx},${cy + SIZE} ${cx - SIZE},${cy}`;
      const fillColor = label ? '#ffffff' : (cellColors[num] || '#ffffff');
      
      const isDark = fillColor === '#000000' || fillColor === '#1e293b';
      const textColor = isDark ? '#ffffff' : (label ? "#94a3b8" : "#475569");
      const gridStroke = fillColor === '#000000' ? "#ef4444" : (isDark ? "rgba(255,255,255,0.3)" : "#cbd5e1");
      const thickStroke = label ? "#0f172a" : gridStroke; // Reverted back to dark slate
      const strokeWidth = label ? "4" : "1";

      const cellElement = (
        <g key={`${u}-${v}`} 
           data-cell={num}
           onPointerDown={(e) => label ? null : onCellPointerDown(e, num)}
           onPointerEnter={(e) => label ? null : onCellPointerEnter(e, num)}
        >
          <polygon points={points} fill={fillColor} stroke={thickStroke} strokeWidth={strokeWidth} className={label ? "" : "map-cell"} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={label ? "16" : "11"} fill={textColor} className="map-text">
            {label || num}
          </text>
        </g>
      );

      if (label) {
        labelCells.push(cellElement);
      } else {
        cells.push(cellElement);
      }
    }
  }

  const getPos = (u, v) => ({ x: (u - v) * SIZE, y: (u + v) * SIZE });
  const makePath = (points) => points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getPos(p.u, p.v).x} ${getPos(p.u, p.v).y}`).join(' ');

  const handleNodePointerDown = (e, id, nodeType) => {
    if (interactionMode !== 'draw') return;
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
    setDragState({ id, nodeType, pointerId: e.pointerId });
  };

  const handleTextPointerDown = (e, id) => {
    if (interactionMode !== 'draw') return;
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
    setDragState({ id, nodeType: 'floatingText', pointerId: e.pointerId });
    if (setSelectedTextId) setSelectedTextId(id);
    e.stopPropagation();
  };

  const handlePointerDown = (e, id, cIndex, controlsU) => {
    if (interactionMode !== 'draw') return;
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
    setDragState({ id, cIndex, controlsU, pointerId: e.pointerId });
  };

  const handlePointerMove = (e) => {
    if (!dragState) {
      if (interactionMode === 'draw' && e.buttons === 1) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) {
          const g = el.closest('[data-cell]');
          if (g) {
            const num = parseInt(g.getAttribute('data-cell'), 10);
            if (!isNaN(num) && onCellPointerEnter) {
              onCellPointerEnter(e, num);
            }
          }
        }
      }
      return;
    }
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    const { id, cIndex, controlsU, nodeType } = dragState;
    
    if (nodeType === 'floatingText') {
      setFloatingTexts(prev => prev.map(t => 
        t.id === id ? { ...t, x: svgP.x, y: svgP.y } : t
      ));
      return;
    }

    let u = Math.round((svgP.x + svgP.y) / (2 * SIZE) - 0.5) + 0.5;
    let v = Math.round((svgP.y - svgP.x) / (2 * SIZE) - 0.5) + 0.5;
    
    setLines(prev => {
      let newArray = [...prev[id]];
      
      if (nodeType) {
        if (nodeType === 'start') {
          let head = newArray[0];
          if (u === head.u && v === head.v) return prev;
          
          let existingIndex = newArray.findIndex(p => p.u === u && p.v === v);
          if (existingIndex !== -1) {
             newArray = newArray.slice(existingIndex);
             return { ...prev, [id]: newArray };
          }
          
          if (u !== head.u && v !== head.v) {
            let constantU = newArray.length >= 2 ? (newArray[0].u === newArray[1].u) : true;
            if (constantU) {
               newArray.unshift({ u: u, v: head.v });
            } else {
               newArray.unshift({ u: head.u, v: v });
            }
            newArray.unshift({ u: u, v: v });
          } else {
            let constantU = newArray.length >= 2 ? (newArray[0].u === newArray[1].u) : true;
            if (constantU && u === head.u) {
               newArray[0] = { u: u, v: v };
            } else if (!constantU && v === head.v) {
               newArray[0] = { u: u, v: v };
            } else {
               newArray.unshift({ u: u, v: v });
            }
          }
        } else if (nodeType === 'end') {
          let head = newArray[newArray.length - 1];
          if (u === head.u && v === head.v) return prev;
          
          let existingIndex = newArray.findIndex(p => p.u === u && p.v === v);
          if (existingIndex !== -1) {
             newArray = newArray.slice(0, existingIndex + 1);
             return { ...prev, [id]: newArray };
          }
          
          if (u !== head.u && v !== head.v) {
            let constantU = newArray.length >= 2 ? (newArray[newArray.length - 2].u === newArray[newArray.length - 1].u) : true;
            if (constantU) {
               newArray.push({ u: u, v: head.v });
            } else {
               newArray.push({ u: head.u, v: v });
            }
            newArray.push({ u: u, v: v });
          } else {
            let constantU = newArray.length >= 2 ? (newArray[newArray.length - 2].u === newArray[newArray.length - 1].u) : true;
            if (constantU && u === head.u) {
               newArray[newArray.length - 1] = { u: u, v: v };
            } else if (!constantU && v === head.v) {
               newArray[newArray.length - 1] = { u: u, v: v };
            } else {
               newArray.push({ u: u, v: v });
            }
          }
        }
      } else {
        let newVal = controlsU ? u : v;
        let p1 = newArray[cIndex];
        let p2 = newArray[cIndex+1];
        if (controlsU) {
          if (p1.u === newVal && p2.u === newVal) return prev;
          newArray[cIndex] = { ...p1, u: newVal };
          newArray[cIndex+1] = { ...p2, u: newVal };
        } else {
          if (p1.v === newVal && p2.v === newVal) return prev;
          newArray[cIndex] = { ...p1, v: newVal };
          newArray[cIndex+1] = { ...p2, v: newVal };
        }
      }
      return { ...prev, [id]: newArray };
    });
  };

  const handlePointerUp = (e) => {
    if (dragState) {
      if (svgRef.current) {
        try { svgRef.current.releasePointerCapture(dragState.pointerId); } catch(err) {}
      }
      setDragState(null);
    }
  };

  const renderHandle = (id, cIndex, p1, p2, controlsU) => {
    if (isExport) return null;
    const isActive = dragState && dragState.id === id && dragState.cIndex === cIndex;
    const classNames = `drag-handle ${isActive ? 'active' : ''}`;
    const cursorType = controlsU ? 'nwse-resize' : 'nesw-resize';
    return (
      <line
        x1={getPos(p1.u, p1.v).x} y1={getPos(p1.u, p1.v).y}
        x2={getPos(p2.u, p2.v).x} y2={getPos(p2.u, p2.v).y}
        strokeWidth="16" className={classNames}
        onPointerDown={(e) => handlePointerDown(e, id, cIndex, controlsU)}
        key={`drag-${id}-${cIndex}`}
        style={{ cursor: cursorType }}
      />
    );
  };

  const renderNodeHandle = (id, nodeType, p) => {
    if (isExport) return null;
    const isActive = dragState && dragState.id === id && dragState.nodeType === nodeType;
    return (
      <circle
        cx={getPos(p.u, p.v).x} cy={getPos(p.u, p.v).y}
        r="10" fill={isActive ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.2)"}
        stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2"
        className={`drag-node ${isActive ? 'active' : ''}`}
        onPointerDown={(e) => handleNodePointerDown(e, id, nodeType)}
        key={`node-${id}-${nodeType}`}
        style={{ cursor: 'move' }}
      />
    );
  };

  const buildLineObj = (id, points) => {
    const handles = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      let p1 = points[i];
      let p2 = points[i+1];
      let controlsU = (p1.u === p2.u); 
      handles.push(renderHandle(id, i, p1, p2, controlsU));
    }

    if (points.length > 0) {
      handles.push(renderNodeHandle(id, 'start', points[0]));
      handles.push(renderNodeHandle(id, 'end', points[points.length - 1]));
    }

    return { points, handles };
  };

  const nData = buildLineObj('n', lines.n);
  const sData = buildLineObj('s', lines.s);
  const eData = buildLineObj('e', lines.e);
  const wData = buildLineObj('w', lines.w);

  const svgContent = (
    <svg 
      ref={svgRef}
      width={isExport ? "800" : "100%"} 
      height={isExport ? "760" : "100%"} 
      viewBox="-400 -50 800 760"
      onPointerDown={() => { if (setSelectedTextId) setSelectedTextId(null); }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <g>
        {cells}
        {labelCells}
        <polygon points="0,-24 336,312 0,648 -336,312" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinejoin="round" />

        {(mapTitle || mapSubtitle) && (
          <>
            <rect x="-80" y="300" width="160" height={mapSubtitle ? "50" : "40"} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="4" />
            {mapTitle && <text x="0" y={mapSubtitle ? "322" : "326"} textAnchor="middle" fontSize="18" fontWeight="bold" className="map-title" fill="#0f172a">{mapTitle}</text>}
            {mapSubtitle && <text x="0" y="342" textAnchor="middle" fontSize="12" className="map-subtitle" fill="#64748b">{mapSubtitle}</text>}
          </>
        )}

        {floatingTexts?.map(t => {
          const isSelected = selectedTextId === t.id;
          return (
            <g key={t.id} transform={`translate(${t.x}, ${t.y}) rotate(${t.rotate || 0})`}>
              <text 
                textAnchor="middle" 
                fontSize={t.size || 48} 
                fontWeight="bold" 
                fill="#0f172a"
                stroke={isSelected ? "#3b82f6" : "#ffffff"}
                strokeWidth="6"
                paintOrder="stroke fill"
                className="map-title"
                style={{ cursor: 'move', userSelect: 'none', pointerEvents: 'auto' }}
                onPointerDown={(e) => handleTextPointerDown(e, t.id)}
              >
                {t.text}
              </text>
              {isSelected && !isExport && (
                <rect 
                  x={-(t.size || 48) * (t.text.length * 0.3)} 
                  y={-(t.size || 48) * 0.8} 
                  width={(t.size || 48) * (t.text.length * 0.6)} 
                  height={(t.size || 48) * 1.1} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        <path d={makePath(nData.points)} stroke={zigzagColor} strokeWidth="6" className="zigzag-path" style={{ pointerEvents: 'none', fill: 'none' }} />
        <path d={makePath(sData.points)} stroke={zigzagColor} strokeWidth="6" className="zigzag-path" style={{ pointerEvents: 'none', fill: 'none' }} />
        <path d={makePath(eData.points)} stroke={zigzagColor} strokeWidth="6" className="zigzag-path" style={{ pointerEvents: 'none', fill: 'none' }} />
        <path d={makePath(wData.points)} stroke={zigzagColor} strokeWidth="6" className="zigzag-path" style={{ pointerEvents: 'none', fill: 'none' }} />

        {nData.handles}
        {sData.handles}
        {eData.handles}
        {wData.handles}
      </g>
    </svg>
  );

  if (isExport) {
    return (
      <div className="map-container" style={{ padding: 0, width: '800px', height: '760px' }}>
        {svgContent}
      </div>
    );
  }

  return (
    <div className="map-container" style={{ padding: 0 }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        disabled={interactionMode === 'draw'}
        panning={{ disabled: interactionMode === 'draw' }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        wheel={{ disabled: interactionMode === 'draw' }}
        style={{ width: "100%", height: "100%" }}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
          {svgContent}
        </TransformComponent>
        <MapControls />
      </TransformWrapper>
    </div>
  );
}
