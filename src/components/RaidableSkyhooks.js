import React, { useState, useEffect } from 'react';
import './RaidableSkyhooks.css';
// Import your offline SDE matrix data
import universeData from './universeData.json';

const SYSTEM_DEFS = [
  { name: "ZA9-PY", region: "wd" }, { name: "M5-CGW", region: "wd" }, { name: "MJXW-P", region: "wd" }, { name: "RCI-VL", region: "wd" },
  { name: "6Q-R50", region: "wd" }, { name: "1-SMEB", region: "wd" }, { name: "Q-HESZ", region: "wd" }, { name: "AJI-MA", region: "wd" },
  { name: "HM-XR2", region: "wd" }, { name: "NOL-M9", region: "wd" }, { name: "1B-VKF", region: "wd" }, { name: "IP6V-X", region: "wd" },
  { name: "E3OI-U", region: "wd" }, { name: "RF-K9W", region: "wd" }, { name: "R5-MM8", region: "wd" }, { name: "T-J6HT", region: "wd" },
  { name: "LUA5-L", region: "wd" }, { name: "QC-YX6", region: "wd" }, { name: "T-IPZB", region: "wd" }, { name: "T-M0FA", region: "wd" },
  { name: "Q-JQSG", region: "wd" }, { name: "4O-239", region: "wd" }, { name: "F-9PXR", region: "wd" }, { name: "31X-RE", region: "wd" },
  { name: "5-6QW7", region: "wd" }, { name: "HZAQ-W", region: "wd" }, { name: "39P-1J", region: "wd" }, { name: "NIDJ-K", region: "wd" },
  { name: "Y5C-YD", region: "wd" }, { name: "Q-02UL", region: "wd" }, { name: "7UTB-F", region: "wd" }, { name: "PS-94K", region: "wd" },
  { name: "7G-QIG", region: "wd" }, { name: "8RQJ-2", region: "wd" }, { name: "O-IOAI", region: "wd" }, { name: "QX-LIJ", region: "wd" },
  { name: "4K-TRB", region: "wd" }, { name: "D-W7F0", region: "wd" }, { name: "T5ZI-S", region: "wd" }, { name: "JP4-AA", region: "wd" },
  { name: "23G-XC", region: "wd" }, { name: "4X0-8B", region: "wd" }, { name: "FM-JK5", region: "wd" }, { name: "PDE-U3", region: "wd" },
  { name: "KEE-N6", region: "wd" }, { name: "M2-XFE", region: "wd" }, { name: "5-CQDA", region: "wd" }, { name: "I-E3TG", region: "wd" },
  { name: "ZXB-VC", region: "wd" }, { name: "S-6HHN", region: "wd" }, { name: "MO-GZ5", region: "wd" }, { name: "1DQ1-A", region: "wd" },
  { name: "8WA-Z6", region: "wd" }, { name: "N-8YET", region: "wd" }, { name: "5BTK-M", region: "wd" }, { name: "3-DMQT", region: "wd" },
  { name: "Y-OMTZ", region: "wd" }, { name: "YAW-7M", region: "sd" }, { name: "9GNS-2", region: "sd" }, { name: "C3N-3S", region: "sd" },
  { name: "LWX-93", region: "sd" }, { name: "CX8-6K", region: "sd" }, { name: "1-2J4P", region: "sd" }, { name: "M0O-JG", region: "sd" },
  { name: "D-3GIQ", region: "con" }, { name: "SVM-3K", region: "con" }, { name: "0-HDC8", region: "con" }, { name: "PUIG-F", region: "con" },
  { name: "W-KQPI", region: "con" }, { name: "QY6-RK", region: "con" }, { name: "F-TE1T", region: "con" }, { name: "J-LPX7", region: "con" }
];

const ORIGIN_ID = 30004751, LY_CONSTANT = 9.4607e15;
const REAGENT_MAP = {
  12: { type: 'Ice', reagent: 'Superionic Ice', icon: 'https://images.evetech.net/types/81144/icon?size=64', color: '#00ccff' },
  2015: { type: 'Lava', reagent: 'Magmatic Gas', icon: 'https://images.evetech.net/types/81143/icon?size=64', color: '#ff4400' }
};

const REGION_LABELS = { wd: 'Western Delve', sd: 'South Delve', con: 'Our Constellation' };
const REGION_CLASSES = { wd: 'badge-wd', sd: 'badge-sd', con: 'badge-con', unknown: 'muted' };
const BAR_COLORS = { wd: '#00c8ff', sd: '#00ff99', con: '#ff9900', unknown: '#5a6278' };

export default function RaidableSkyhooks() {
  const [clock, setClock] = useState('--:--:--');
  const [targets, setTargets] = useState([]);
  const [rawSkyhooks, setRawSkyhooks] = useState([]);
  const [sort, setSort] = useState({ col: 'start', dir: 1 });
  const [state, setState] = useState({ loading: true, refreshing: false, stage: 'Initializing tracker...', lastFetched: '' });
  const [nowTs, setNowTs] = useState(Date.now());
  const [showAll, setShowAll] = useState(false);

  const anchorNode = Object.values(universeData).find(p => p.sid === ORIGIN_ID);
  const originCoords = anchorNode?.p;

  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setNowTs(n.getTime());
      setClock([n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()].map(v => String(v).padStart(2, '0')).join(':'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadSkyhookData = async () => {
    setState(p => ({ ...p, refreshing: true }));
    try {
      const data = await fetch('https://esi.evetech.net/skyhooks/raidable/', {
        headers: { 'X-Compatibility-Date': '2026-05-19', 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : { skyhooks: [] });

      setRawSkyhooks(data.skyhooks || []);
      setState(p => ({ ...p, lastFetched: new Date().toUTCString(), loading: false }));
    } catch (e) {
      setState(p => ({ ...p, stage: `ESI Link Failure: ${e.message}`, refreshing: false }));
    }
  };

  useEffect(() => {
    const systemToPlanetMap = {};
    Object.values(universeData).forEach(p => {
      if (!systemToPlanetMap[p.sn]) {
        systemToPlanetMap[p.sn] = p;
      }
    });

    const cleanTargets = SYSTEM_DEFS.map(def => {
      const sdeMatch = systemToPlanetMap[def.name];
      let distanceLy = null;

      if (originCoords && sdeMatch?.p) {
        const dx = sdeMatch.p.x - originCoords.x;
        const dy = sdeMatch.p.y - originCoords.y;
        const dz = sdeMatch.p.z - originCoords.z;
        distanceLy = Math.sqrt(dx * dx + dy * dy + dz * dz) / LY_CONSTANT;
      }

      return {
        name: def.name,
        id: sdeMatch ? sdeMatch.sid : null,
        ly: distanceLy,
        region: def.region
      };
    }).filter(t => t.id);

    setTargets(cleanTargets);
    loadSkyhookData();
  }, []);

  const fmtTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };

  const handleSort = (col) => setSort(p => ({ col, dir: p.col === col ? p.dir * -1 : 1 }));

  // Helper utility to render countdowns for ongoing and upcoming raid events
  const renderStatusCell = (startTs, endTs) => {
    if (nowTs >= startTs && nowTs < endTs) {
      const timeLeftMs = endTs - nowTs;
      const hours = Math.floor(timeLeftMs / 3600000);
      const mins = Math.floor((timeLeftMs % 3600000) / 60000);

      // Dynamic rendering layout switcher based on remaining duration thresholds
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      return <span className="s-open">{timeStr}</span>;
    }

    if (startTs > nowTs && (startTs - nowTs) < 3600000) {
      return <span className="status-soon">In {Math.round((startTs - nowTs) / 60000)}m</span>;
    }

    return <span className="status-closed">CLOSED</span>;
  };

  if (state.loading) return <div className="loading-panel mono-text">{state.stage}</div>;

  const targetMap = targets.reduce((acc, t) => ({ ...acc, [t.id]: t }), {});
  const maxLy = Math.max(...targets.map(t => t.ly || 1), 1);

  const presentationRows = rawSkyhooks.map(hook => {
    const planetId = String(hook.planet_id);
    const planetMeta = universeData[planetId];

    if (!planetMeta) return null;

    const targetMatch = targetMap[planetMeta.sid];
    if (!targetMatch && !showAll) return null;

    const displayRegionName = targetMatch ? REGION_LABELS[targetMatch.region] : planetMeta.r;
    const badgeClassKey = targetMatch ? targetMatch.region : 'unknown';
    const colorBarKey = targetMatch ? targetMatch.region : 'unknown';

    let lyDistance = targetMatch ? targetMatch.ly : null;
    if (!targetMatch && originCoords && planetMeta.p) {
      const dx = planetMeta.p.x - originCoords.x;
      const dy = planetMeta.p.y - originCoords.y;
      const dz = planetMeta.p.z - originCoords.z;
      lyDistance = Math.sqrt(dx * dx + dy * dy + dz * dz) / LY_CONSTANT;
    }

    return {
      id: planetMeta.sid,
      name: planetMeta.sn,
      ly: lyDistance,
      regionName: displayRegionName,
      badgeClass: REGION_CLASSES[badgeClassKey],
      barColor: BAR_COLORS[colorBarKey],
      hook,
      planetStr: planetMeta.pn,
      planetTypeId: planetMeta.pt,
      startTs: new Date(hook.theft_vulnerability.start).getTime(),
      endTs: new Date(hook.theft_vulnerability.end).getTime(),
    };
  }).filter(Boolean).sort((a, b) => {
    const accessors = {
      planet: r => r.planetStr,
      reagent: r => REAGENT_MAP[r.planetTypeId]?.reagent || '',
      start: r => r.startTs || Infinity,
      region: r => r.regionName,
      ly: r => r.ly ?? Infinity,
      default: r => r.name || r.planetStr
    };
    const va = (accessors[sort.col] || accessors.default)(a);
    const vb = (accessors[sort.col] || accessors.default)(b);
    return va < vb ? -sort.dir : va > vb ? sort.dir : 0;
  });

  return (
    <div className="skyhook-dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h4>⬡ Skyhook Tracker — {showAll ? 'Global Pipeline' : 'Delve'}</h4>
          <p className="mono-text header-subtitle">Origin: K-6K16 · {showAll ? 'All Cluster Nodes Visible' : 'Western / South / Our Constellation'}</p>
        </div>
        <div className="header-actions">
          <button className={`toggle-btn ${showAll ? 'active' : ''}`} onClick={() => setShowAll(!showAll)}>
            {showAll ? '■ Scope: All Skyhooks' : '⬡ Scope: Targeted'}
          </button>

          <div className="clock-panel mono-text">
            <span className="clock-label">EVE Time (UTC)</span>
            <span className="clock-time">{clock}</span>
          </div>
          <button className="refresh-btn" disabled={state.refreshing} onClick={loadSkyhookData} title="Refresh Data">
            <span className={state.refreshing ? 'spinning' : ''}>↻</span>
          </button>
        </div>
      </div>

      <div className="data-panel">
        <table>
          <thead>
            <tr>
              {['planet', 'reagent', 'region', 'ly', 'start'].map((c, idx) => (
                <th
                  key={c}
                  className={c === 'region' ? 'region-header' : c === 'ly' ? 'distance-header' : ''}
                  onClick={() => handleSort(c)}
                >
                  {['Skyhook', 'Reagent Type', 'Region Profile', 'Distance (K-6)', 'Window Opens'][idx]}
                </th>
              ))}
              <th className="status-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {presentationRows.map((r, i) => {
              const rMeta = REAGENT_MAP[r.planetTypeId];
              return (
                <tr key={i}>
                  <td><span className="planet-highlight" title={r.planetStr}>{r.planetStr}</span></td>
                  <td>
                    {rMeta ? (
                      <div className="reagent-cell" style={{ color: rMeta.color }}>
                        <img src={rMeta.icon} alt={rMeta.reagent} className="reagent-icon" />
                        <span>{rMeta.reagent}</span>
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td className="region-cell-fixed">
                    <span className={`badge ${r.badgeClass}`}>{r.regionName}</span>
                  </td>
                  <td className="distance-cell-fixed">
                    {r.ly ? (
                      <div className="flex-center gap-8">
                        {/* Only render the progress bar for tactical grid targets under 10 light-years */}
                        {r.ly < 10 && (
                          <div className="distance-bar">
                            <div
                              className="distance-fill"
                              style={{ width: `${Math.round((r.ly / maxLy) * 100)}%`, background: r.barColor }}
                            />
                          </div>
                        )}
                        <span className={`soft-text mono-text ${r.ly >= 10 ? 'text-right-fallback' : ''}`}>
                          {r.ly.toFixed(2)} ly
                        </span>
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td className="soft-text mono-text">{fmtTime(r.startTs)}</td>
                  <td className="status-cell-fixed mono-text">
                    {renderStatusCell(r.startTs, r.endTs)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="footer-row mono-text">
        <span>Last updated: {state.lastFetched || 'Connecting...'}</span>
        <span>Pipeline Capacity: {presentationRows.length} / {rawSkyhooks.length} Nodes Displayed</span>
      </div>
    </div>
  );
}