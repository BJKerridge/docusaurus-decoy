import React, { useState, useEffect, useRef } from 'react';

// ── System definitions (Western Delve, South Delve, Constellation) ─────────
const SYSTEM_DEFS = [
    { name:"ZA9-PY",  region:"wd" }, { name:"M5-CGW",  region:"wd" },
    { name:"MJXW-P",  region:"wd" }, { name:"RCI-VL",  region:"wd" },
    { name:"6Q-R50",  region:"wd" }, { name:"1-SMEB",  region:"wd" },
    { name:"Q-HESZ",  region:"wd" }, { name:"AJI-MA",  region:"wd" },
    { name:"HM-XR2",  region:"wd" }, { name:"NOL-M9",  region:"wd" },
    { name:"1B-VKF",  region:"wd" }, { name:"IP6V-X",  region:"wd" },
    { name:"E3OI-U",  region:"wd" }, { name:"RF-K9W",  region:"wd" },
    { name:"R5-MM8",  region:"wd" }, { name:"T-J6HT",  region:"wd" },
    { name:"LUA5-L",  region:"wd" }, { name:"QC-YX6",  region:"wd" },
    { name:"T-IPZB",  region:"wd" }, { name:"T-M0FA",  region:"wd" },
    { name:"Q-JQSG",  region:"wd" }, { name:"4O-239",  region:"wd" },
    { name:"F-9PXR",  region:"wd" }, { name:"31X-RE",  region:"wd" },
    { name:"5-6QW7",  region:"wd" }, { name:"HZAQ-W",  region:"wd" },
    { name:"39P-1J",  region:"wd" }, { name:"NIDJ-K",  region:"wd" },
    { name:"Y5C-YD",  region:"wd" }, { name:"Q-02UL",  region:"wd" },
    { name:"7UTB-F",  region:"wd" }, { name:"PS-94K",  region:"wd" },
    { name:"7G-QIG",  region:"8RQJ-2" }, { name:"8RQJ-2",  region:"wd" },
    { name:"O-IOAI",  region:"wd" }, { name:"QX-LIJ",  region:"wd" },
    { name:"4K-TRB",  region:"wd" }, { name:"D-W7F0",  region:"wd" },
    { name:"T5ZI-S",  region:"wd" }, { name:"JP4-AA",  region:"wd" },
    { name:"23G-XC",  region:"wd" }, { name:"4X0-8B",  region:"wd" },
    { name:"FM-JK5",  region:"wd" }, { name:"PDE-U3",  region:"wd" },
    { name:"KEE-N6",  region:"wd" }, { name:"M2-XFE",  region:"wd" },
    { name:"5-CQDA",  region:"wd" }, { name:"I-E3TG",  region:"wd" },
    { name:"ZXB-VC",  region:"wd" }, { name:"S-6HHN",  region:"wd" },
    { name:"MO-GZ5",  region:"wd" }, { name:"1DQ1-A",  region:"wd" },
    { name:"8WA-Z6",  region:"wd" }, { name:"N-8YET",  region:"wd" },
    { name:"5BTK-M",  region:"wd" }, { name:"3-DMQT",  region:"wd" },
    { name:"Y-OMTZ",  region:"wd" },
    { name:"YAW-7M",  region:"sd" }, { name:"9GNS-2",  region:"sd" },
    { name:"C3N-3S",  region:"sd" }, { name:"LWX-93",  region:"sd" },
    { name:"CX8-6K",  region:"sd" }, { name:"1-2J4P",  region:"sd" },
    { name:"M0O-JG",  region:"sd" },
    { name:"D-3GIQ",  region:"con" }, { name:"SVM-3K",  region:"con" },
    { name:"0-HDC8",  region:"con" }, { name:"PUIG-F",  region:"con" },
    { name:"W-KQPI",  region:"con" }, { name:"QY6-RK",  region:"con" },
    { name:"F-TE1T",  region:"con" }, { name:"J-LPX7",  region:"con" },
];

const ORIGIN_ID = 30004751; // K-6K16
const LY_CONSTANT = 9.4607e15;

export default function RaidableSkyhooks() {
  const [clock, setClock] = useState('--:--:--');
  const [targets, setTargets] = useState([]);
  const [rawSkyhooks, setRawSkyhooks] = useState([]);
  const [globalNameCache, setGlobalNameCache] = useState({}); // Stores both system and planet names
  const [currentFilter, setCurrentFilter] = useState('all');
  const [sortCol, setSortCol] = useState('start');
  const [sortDir, setSortDir] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initStage, setInitStage] = useState('Initializing tracker...');
  const [missingIds, setMissingIds] = useState([]);
  const [lastFetched, setLastFetched] = useState('');
  const [nowTs, setNowTs] = useState(Date.now());

  const nameCacheRef = useRef(globalNameCache);
  useEffect(() => { nameCacheRef.current = globalNameCache; }, [globalNameCache]);

  // Live clock engine
  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setNowTs(n.getTime());
      setClock(
        String(n.getUTCHours()).padStart(2, '0') + ':' +
        String(n.getUTCMinutes()).padStart(2, '0') + ':' +
        String(n.getUTCSeconds()).padStart(2, '0')
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // API Data Fetch Core
  const loadSkyhookData = async (activeTargets) => {
    setRefreshing(true);
    try {
      const res = await fetch('https://esi.evetech.net/skyhooks/raidable/', {
        headers: { 'X-Compatibility-Date': '2026-05-19', 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`ESI returned HTTP ${res.status}`);
      const data = await res.json();
      const skyhooks = data.skyhooks || [];
      setRawSkyhooks(skyhooks);

      // Create a localized map of target system IDs for fast regional matching
      const targetSystemIds = new Set(activeTargets.map(t => t.id));
      const newCache = { ...nameCacheRef.current };
      const systemIdsToResolve = new Set();
      const regionalPlanetRequests = [];

      skyhooks.forEach(h => {
        const sysId = parseInt(h.solar_system_id);
        const planetId = parseInt(h.planet_id);

        // 1. Gather unknown system IDs for bulk processing
        if (!newCache[sysId]) {
          systemIdsToResolve.add(sysId);
        }

        // 2. Safely isolate target regional planets to resolve individually
        if (targetSystemIds.has(sysId) && !newCache[planetId]) {
          // Push to parallel execution payload pool
          regionalPlanetRequests.push(
            fetch(`https://esi.evetech.net/v1/universe/planets/${planetId}/`, { headers: { 'Accept': 'application/json' } })
              .then(r => r.ok ? r.json() : null)
              .then(pData => {
                if (pData) newCache[planetId] = pData.name;
              })
              .catch(err => console.error(`Failed resolving planet ${planetId}`, err))
          );
        }
      });

      // Execute regional planet queries simultaneously
      if (regionalPlanetRequests.length > 0) {
        await Promise.all(regionalPlanetRequests);
      }

      // Execute global system name bulk lookup via POST
      if (systemIdsToResolve.size > 0) {
        const nameRes = await fetch('https://esi.evetech.net/latest/universe/names/?datasource=tranquility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify([...systemIdsToResolve])
        });
        if (nameRes.ok) {
          const namesData = await nameRes.json();
          namesData.forEach(n => { newCache[parseInt(n.id)] = n.name; });
        }
      }

      setGlobalNameCache(newCache);
      setLastFetched(new Date().toUTCString());
    } catch (e) {
      console.error(e);
      setInitStage(`Data loading failed: ${e.message}`);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // ESI Space Coordinate Calculations
  useEffect(() => {
    async function initTracker() {
      try {
        setInitStage('Resolving system IDs from ESI...');
        const names = SYSTEM_DEFS.map(s => s.name);
        const res = await fetch('https://esi.evetech.net/v1/universe/ids/?datasource=tranquility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(names)
        });
        if (!res.ok) throw new Error(`ID resolution failed: HTTP ${res.status}`);
        const idData = await res.json();
        const resolvedSystems = idData.systems || [];
        const idMap = {};
        resolvedSystems.forEach(s => { idMap[s.name] = s.id; });

        const unmapped = [];
        let cleanTargets = SYSTEM_DEFS.map(s => {
          const id = idMap[s.name];
          if (!id) unmapped.push(s.name);
          return { name: s.name, id: id || null, ly: null, region: s.region };
        }).filter(t => t.id !== null);

        setMissingIds(unmapped);

        setInitStage('Fetching spatial coordinates...');
        const fetchCoords = async (id) => {
          const r = await fetch(`https://esi.evetech.net/v4/universe/systems/${id}/`, {
            headers: { 'Accept': 'application/json' }
          });
          return r.ok ? r.json() : null;
        };

        const allIds = [ORIGIN_ID, ...cleanTargets.map(t => t.id)];
        const coordResults = await Promise.all(allIds.map(id => fetchCoords(id)));
        const coordMap = {};
        allIds.forEach((id, idx) => { if (coordResults[idx]) coordMap[id] = coordResults[idx].position; });

        const origin = coordMap[ORIGIN_ID];
        if (origin) {
          cleanTargets = cleanTargets.map(t => {
            const c = coordMap[t.id];
            if (c) {
              const dx = c.x - origin.x, dy = c.y - origin.y, dz = c.z - origin.z;
              return { ...t, ly: Math.sqrt(dx * dx + dy * dy + dz * dz) / LY_CONSTANT };
            }
            return t;
          });
        }

        setTargets(cleanTargets);
        await loadSkyhookData(cleanTargets);
      } catch (e) {
        setInitStage(`Initialization Error: ${e.message}`);
      }
    }
    initTracker();
  }, []);

  // Utility logic & helpers
  const fmtTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };

  // Helper to trim the system name prefix off the planet string for clean UI
  const formatPlanetClean = (systemName, planetId) => {
    const rawPlanetName = globalNameCache[parseInt(planetId)];
    if (!rawPlanetName) return '—';
    // e.g., Turns "9G5J-1 VIII" or "K-6K16 I" into just "VIII" or "I"
    return rawPlanetName.replace(systemName, '').trim();
  };

  const hookMap = {};
  rawSkyhooks.forEach(h => { 
    hookMap[h.solar_system_id] = h; 
  });

  const processedRows = targets.map(t => {
    const hook = hookMap[t.id] || null;
    return {
      ...t,
      hook,
      planetStr: hook ? formatPlanetClean(t.name, hook.planet_id) : '—',
      startTs: hook ? new Date(hook.theft_vulnerability.start).getTime() : null,
      endTs:   hook ? new Date(hook.theft_vulnerability.end).getTime() : null,
    };
  });

  const targetIds = new Set(targets.map(t => t.id));
  const anyTargetPresent = rawSkyhooks.some(h => targetIds.has(h.solar_system_id));
  const isStale = rawSkyhooks.length > 0 && !anyTargetPresent;

  const isOpen = (r) => r.hook && nowTs >= r.startTs && nowTs < r.endTs;
  const isSoon = (r) => r.hook && r.startTs > nowTs && (r.startTs - nowTs) < 3600000;

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(prev => prev * -1);
    else { setSortCol(col); setSortDir(1); }
  };

  if (loading) {
    return <div style={{ fontFamily: 'monospace', color: '#8a94a8', padding: '20px', textAlign: 'center', background: '#111318', border: '1px solid #1e2330', borderRadius: '6px' }}>{initStage}</div>;
  }

  const regionLabel = { wd: 'Western Delve', sd: 'South Delve', con: 'Our Constellation' };
  const regionClass = { wd: 'badge-wd', sd: 'badge-sd', con: 'badge-con' };
  const barColors = { wd: '#00c8ff', sd: '#00ff99', con: '#ff9900' };

  return (
    <div className="skyhook-dashboard-wrapper" style={{
      color: '#c8d0e0',
      background: '#0b0c10',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #1e2330',
      fontFamily: "'Exo 2', sans-serif"
    }}>
      <style>{`
        .skyhook-dashboard-wrapper h4 { font-size: 20px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #00c8ff; margin: 0; text-shadow: 0 0 20px rgba(0,200,255,0.3); }
        .skyhook-dashboard-wrapper .mono-text { font-family: 'Share Tech Mono', monospace; }
        .skyhook-dashboard-wrapper .badge { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 2px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .skyhook-dashboard-wrapper .badge-wd { background: rgba(0,200,255,0.1); color: #00c8ff; border: 1px solid rgba(0,200,255,0.25); }
        .skyhook-dashboard-wrapper .badge-sd { background: rgba(0,255,153,0.1); color: #00ff99; border: 1px solid rgba(0,255,153,0.25); }
        .skyhook-dashboard-wrapper .badge-con { background: rgba(255,148,0,0.1); color: #ff9900; border: 1px solid rgba(255,148,0,0.25); }
        .skyhook-dashboard-wrapper .f-btn { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; background: #181b22; color: #8a94a8; border: 1px solid #1e2330; padding: 6px 12px; border-radius: 3px; cursor: pointer; transition: all 0.15s; }
        .skyhook-dashboard-wrapper .f-btn:hover { border-color: #00c8ff; color: #00c8ff; }
        .skyhook-dashboard-wrapper .f-btn.active { background: rgba(0,200,255,0.1); border-color: #00c8ff; color: #00c8ff; }
        .skyhook-dashboard-wrapper .f-btn.green.active { background: rgba(0,255,153,0.1); border-color: #00ff99; color: #00ff99; }
        .skyhook-dashboard-wrapper th { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #5a6278; padding: 10px 14px; text-align: left; border-bottom: 1px solid #1e2330; cursor: pointer; user-select: none; }
        .skyhook-dashboard-wrapper th:hover { color: #00c8ff; }
        .skyhook-dashboard-wrapper td { padding: 10px 14px; border-bottom: 1px solid #1e2330; font-size: 13px; }
        .skyhook-dashboard-wrapper .s-open { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #00ff99; text-transform: uppercase; }
        .skyhook-dashboard-wrapper .s-open::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #00ff99; box-shadow: 0 0 6px #00ff99; }
        .skyhook-dashboard-wrapper .planet-highlight { color: #ffaa00; font-family: 'Share Tech Mono', monospace; font-weight: 600; }
      `}</style>

      {/* Header element components */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h4>⬡ Skyhook Tracker — Delve</h4>
          <p className="mono-text" style={{ fontSize: '12px', color: '#5a6278', marginTop: '4px' }}>Origin: K-6K16 · Western / South / Our Constellation</p>
        </div>
        <div className="mono-text" style={{ fontSize: '13px', color: '#00ff99', background: '#181b22', border: '1px solid #1e2330', padding: '8px 14px', borderRadius: '4px', textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#5a6278', marginBottom: '2px' }}>EVE Time (UTC)</span>
          {clock}
        </div>
      </div>

      {/* Stats Counters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tracked Systems', val: processedRows.length, color: '#00c8ff' },
          { label: 'Open Now', val: processedRows.filter(r => isOpen(r)).length, color: '#00ff99' },
          { label: 'Opening Soon', val: processedRows.filter(r => isSoon(r)).length, color: '#ff9900' },
          { label: 'Not Listed', val: processedRows.filter(r => !r.hook).length, color: '#c8d0e0' }
        ].map((st, i) => (
          <div key={i} style={{ background: '#111318', border: '1px solid #1e2330', borderRadius: '4px', padding: '10px 16px', minWidth: '120px', flex: '1' }}>
            <label style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5a6278', display: 'block', marginBottom: '4px' }}>{st.label}</label>
            <span className="mono-text" style={{ fontSize: '20px', fontWeight: '600', color: st.color }}>{st.val}</span>
          </div>
        ))}
      </div>

      {/* Unlisted Warnings Banner */}
      {isStale && (
        <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,148,0,0.08)', border: '1px solid rgba(255,148,0,0.35)', borderRadius: '5px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#ff9900' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>⚠</div>
          <div>
            <strong>No target systems in current feed</strong>
            <p style={{ fontSize: '12px', color: '#8a94a8', margin: 0, lineHeight: 1.5 }}>None of our tracked alliance systems appear in the current ESI feed ({rawSkyhooks.length} returned globally).</p>
          </div>
        </div>
      )}

      {/* Interface Filter Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`f-btn ${currentFilter === 'all' ? 'active' : ''}`} onClick={() => setCurrentFilter('all')}>Delve</button>
        <button className={`f-btn green ${currentFilter === 'open' ? 'active' : ''}`} onClick={() => setCurrentFilter('open')}>Open Now</button>
        <button className={`f-btn ${currentFilter === 'wd' ? 'active' : ''}`} onClick={() => setCurrentFilter('wd')}>Western Delve</button>
        <button className={`f-btn ${currentFilter === 'sd' ? 'active' : ''}`} onClick={() => setCurrentFilter('sd')}>South Delve</button>
        <button className={`f-btn ${currentFilter === 'con' ? 'active' : ''}`} onClick={() => setCurrentFilter('con')}>Our Constellation</button>
        <button className={`f-btn ${currentFilter === 'missing' ? 'active' : ''}`} onClick={() => setCurrentFilter('missing')}>Not Listed</button>
        <button className={`f-btn ${currentFilter === 'global' ? 'active' : ''}`} onClick={() => setCurrentFilter('global')}>Global Feed</button>

        <button className="f-btn" style={{ marginLeft: 'auto', border: '1px solid #00c8ff', color: '#00c8ff', background: 'rgba(0,200,255,0.05)' }} disabled={refreshing} onClick={() => loadSkyhookData(targets)}>
          {refreshing ? '↻ Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Main Board Layout Rendering System */}
      <div style={{ background: '#111318', border: '1px solid #1e2330', borderRadius: '6px', overflowX: 'auto' }}>
        {currentFilter === 'global' ? (
          /* Global ESI Feed Output Mode */
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>System</th>
                <th onClick={() => handleSort('planet')}>Planet</th>
                <th onClick={() => handleSort('id')}>System ID</th>
                <th onClick={() => handleSort('start')}>Window Opens</th>
                <th onClick={() => handleSort('end')}>Window Closes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...rawSkyhooks]
                .sort((a, b) => {
                  let va, vb;
                  if (sortCol === 'name') {
                    va = globalNameCache[parseInt(a.solar_system_id)] || '';
                    vb = globalNameCache[parseInt(b.solar_system_id)] || '';
                  } else if (sortCol === 'planet') {
                    va = globalNameCache[parseInt(a.planet_id)] || '';
                    vb = globalNameCache[parseInt(b.planet_id)] || '';
                  } else if (sortCol === 'id') {
                    va = a.solar_system_id; vb = b.solar_system_id;
                  } else if (sortCol === 'end') {
                    va = new Date(a.theft_vulnerability.end).getTime();
                    vb = new Date(b.theft_vulnerability.end).getTime();
                  } else {
                    va = new Date(a.theft_vulnerability.start).getTime();
                    vb = new Date(b.theft_vulnerability.start).getTime();
                  }
                  return va < vb ? -sortDir : va > vb ? sortDir : 0;
                })
                .map((h, i) => {
                  const sName = globalNameCache[parseInt(h.solar_system_id)] || String(h.solar_system_id);
                  const pClean = formatPlanetClean(sName, h.planet_id);
                  const startT = new Date(h.theft_vulnerability.start).getTime();
                  const endT = new Date(h.theft_vulnerability.end).getTime();
                  const active = nowTs >= startT && nowTs < endT;
                  const soon = startT > nowTs && (startT - nowTs) < 3600000;

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #1e2330' }}>
                      <td><strong style={{ color: '#fff' }} className="mono-text">{sName}</strong></td>
                      <td><span className="planet-highlight">{pClean}</span></td>
                      <td style={{ color: '#8a94a8' }} className="mono-text">{h.solar_system_id}</td>
                      <td style={{ color: '#8a94a8' }} className="mono-text">{fmtTime(startT)}</td>
                      <td style={{ color: '#8a94a8' }} className="mono-text">{fmtTime(endT)}</td>
                      <td>
                        {active ? <span className="s-open">Open</span> : soon ? <span style={{ fontSize: '11px', fontWeight: '600', color: '#ff9900' }}>In {Math.round((startT - nowTs) / 60000)}m</span> : <span style={{ fontSize: '11px', color: '#5a6278' }}>CLOSED</span>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        ) : (
          /* Regional Alliance Framework Mode */
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>System</th>
                <th onClick={() => handleSort('planet')}>Planet</th>
                <th onClick={() => handleSort('region')}>Region</th>
                <th onClick={() => handleSort('ly')}>Distance (K-6)</th>
                <th onClick={() => handleSort('start')}>Window Opens</th>
                <th onClick={() => handleSort('end')}>Window Closes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processedRows
                .filter(r => {
                  if (currentFilter === 'open') return isOpen(r);
                  if (currentFilter === 'wd') return r.region === 'wd';
                  if (currentFilter === 'sd') return r.region === 'sd';
                  if (currentFilter === 'con') return r.region === 'con';
                  if (currentFilter === 'missing') return !r.hook;
                  return true;
                })
                .sort((a, b) => {
                  let va, vb;
                  if (sortCol === 'ly') { va = a.ly ?? Infinity; vb = b.ly ?? Infinity; }
                  else if (sortCol === 'planet') { va = a.planetStr; vb = b.planetStr; }
                  else if (sortCol === 'start') { va = a.startTs || Infinity; vb = b.startTs || Infinity; }
                  else if (sortCol === 'end') { va = a.endTs || Infinity; vb = b.endTs || Infinity; }
                  else if (sortCol === 'region') { va = a.region; vb = b.region; }
                  else { va = a.name; vb = b.name; }
                  return va < vb ? -sortDir : va > vb ? sortDir : 0;
                })
                .map((r, i) => {
                  const maxLy = Math.max(...targets.map(t => t.ly || 1), 1);
                  const barPct = r.ly ? Math.round((r.ly / maxLy) * 100) : 0;

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #1e2330' }}>
                      <td><strong style={{ color: '#fff' }} className="mono-text">{r.name}</strong></td>
                      <td><span className="planet-highlight">{r.planetStr}</span></td>
                      <td><span className={`badge ${regionClass[r.region]}`}>{regionLabel[r.region]}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '4px', background: '#181b22', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${barPct}%`, background: barColors[r.region], borderRadius: '2px' }} />
                          </div>
                          <span style={{ color: '#8a94a8' }} className="mono-text">{r.ly ? `${r.ly.toFixed(2)} ly` : '—'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#8a94a8' }} className="mono-text">{fmtTime(r.startTs)}</td>
                      <td style={{ color: '#8a94a8' }} className="mono-text">{fmtTime(r.endTs)}</td>
                      <td>
                        {!r.hook ? (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#5a6278', borderBottom: '1px dashed rgba(255,148,0,0.3)', cursor: 'help' }} title="System is currently outside tracking buffer feed parameters. Window inactive or unlisted.">NOT LISTED</span>
                        ) : isOpen(r) ? (
                          <span className="s-open">Open</span>
                        ) : isSoon(r) ? (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#ff9900' }}>In {Math.round((r.startTs - nowTs) / 60000)}m</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#5a6278' }}>CLOSED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Meta Data Outputs */}
      <div className="mono-text" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a6278', marginTop: '10px' }}>
        <span>Last updated: {lastFetched || 'Connecting...'}</span>
        <span>Global Feed Pipeline Capacity: {rawSkyhooks.length} Nodes</span>
      </div>
    </div>
  );
}