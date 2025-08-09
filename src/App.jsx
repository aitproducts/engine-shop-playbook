import React, { useEffect, useMemo, useState } from 'react'

const tabs = ['ADs', 'HazMat', 'SDS', 'ATA']

const PRESET_ENGINES = [
  'CFM56-7B','LEAP-1A','LEAP-1B','V2500-A5','PW1100G-JM','PW1500G','Trent 700','Trent 1000','GE90','CF6-80C2'
]
const PRESET_ATA = ['70','71','72','73','74','75','76','77','78','79','80']

// Stable entry points
const FAA_SEARCH = 'https://drs.faa.gov/search'
const FAA_AD_RULES = 'https://drs.faa.gov/browse/ADFRAWD/doctypeDetails'
const FAA_EAD = 'https://drs.faa.gov/browse/ADFREAD/doctypeDetails'
const EASA_MAIN = 'https://ad.easa.europa.eu/'
const EASA_ADV = 'https://ad.easa.europa.eu/search/advanced'
const NIOSH_SEARCH = 'https://www.cdc.gov/niosh/npg/search.html'
const PHMSA_TABLE = 'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-172/subpart-B/section-172.101#p-172.101(c)(1)'

// localStorage helpers
const LS_RECENTS = 'esp_recent_searches'
const LS_FAVORITES = 'esp_favorite_searches'

function useLocalJSON(path) {
  const [data, setData] = useState([])
  useEffect(() => { fetch(path).then(r => r.json()).then(setData).catch(() => setData([])) }, [path])
  return data
}

function useLocalList(key, initial = []) {
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return initial }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(list)) }, [key, list])
  return [list, setList]
}

function openNew(url) { window.open(url, '_blank', 'noopener,noreferrer') }

function copy(text) {
  navigator.clipboard.writeText(text)
}

function AdSearch({ engines }) {
  const [engine, setEngine] = useState('')
  const [ata, setAta] = useState('')
  const [kw, setKw] = useState('')

  const [recents, setRecents] = useLocalList(LS_RECENTS, [])
  const [favs, setFavs] = useLocalList(LS_FAVORITES, [])

  const queryText = useMemo(() => {
    return [engine, ata ? `ATA ${ata}` : '', kw].filter(Boolean).join(' ')
  }, [engine, ata, kw])

  function saveRecent() {
    const item = { engine, ata, kw, ts: Date.now() }
    const next = [item, ...recents].slice(0, 5)
    setRecents(next)
  }

  function addFavorite() {
    const label = queryText || 'Empty query'
    // prevent dupes
    if (!favs.find(f => f.engine === engine && f.ata === ata && f.kw === kw)) {
      setFavs([{ engine, ata, kw, label }, ...favs].slice(0, 20))
    }
  }

  function loadSearch(s) {
    setEngine(s.engine || '')
    setAta(s.ata || '')
    setKw(s.kw || '')
  }

  function clearSearch() {
    setEngine(''); setAta(''); setKw('')
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 800 }}>
        <div>
          <input placeholder="Engine model" list="engine-list" value={engine} onChange={e => setEngine(e.target.value)} style={{ width: '100%', padding: 8 }} />
          <datalist id="engine-list">
            {engines.map((e, i) => <option key={i} value={e.model} />)}
            {PRESET_ENGINES.filter(p => !engines.find(e => e.model === p)).map((p, i) => <option key={'p'+i} value={p} />)}
          </datalist>
        </div>
        <div>
          <input placeholder="ATA chapter (e.g., 72)" value={ata} onChange={e => setAta(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div>
          <input placeholder="Keyword (e.g., hot section)" value={kw} onChange={e => setKw(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <strong>Quick picks - engines:</strong>
          {PRESET_ENGINES.map(e => (
            <button key={e} onClick={() => setEngine(e)} style={{ marginLeft: 6, padding: '4px 8px' }}>{e}</button>
          ))}
        </div>
        <div>
          <strong>ATA:</strong>
          {PRESET_ATA.map(a => (
            <button key={a} onClick={() => setAta(a)} style={{ marginLeft: 6, padding: '4px 8px' }}>{a}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => { openNew(FAA_SEARCH); saveRecent() }}>Open FAA search</button>
        <button onClick={() => { openNew(FAA_AD_RULES); saveRecent() }}>Open FAA AD rules</button>
        <button onClick={() => { openNew(FAA_EAD); saveRecent() }}>Open FAA Emergency ADs</button>
        <button onClick={() => { openNew(EASA_MAIN); saveRecent() }}>Open EASA ADs</button>
        <button onClick={() => { openNew(EASA_ADV); saveRecent() }}>Open EASA advanced</button>
        <button onClick={() => { openNew(FAA_SEARCH); openNew(EASA_ADV); saveRecent() }}>Open both</button>
        <button onClick={() => copy(queryText)}>Copy query text</button>
        <button onClick={addFavorite}>Star favorite</button>
        <button onClick={clearSearch}>Clear</button>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
        <div>
          <h3 style={{ margin: '8px 0' }}>Recent searches</h3>
          {recents.length === 0 && <div style={{ color: '#777' }}>No recent searches yet.</div>}
          <ul>
            {recents.map((r, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <button onClick={() => loadSearch(r)} style={{ marginRight: 8 }}>Load</button>
                <span>{[r.engine, r.ata ? `ATA ${r.ata}` : '', r.kw].filter(Boolean).join(' ')}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 style={{ margin: '8px 0' }}>Favorites</h3>
          {favs.length === 0 && <div style={{ color: '#777' }}>No favorites yet.</div>}
          <ul>
            {favs.map((f, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <button onClick={() => loadSearch(f)} style={{ marginRight: 8 }}>Load</button>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 12 }}>
        Tip - After opening FAA/EASA, paste the copied query text into their search box.
      </p>
    </div>
  )
}

function HazMat({ items }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return items.filter(it =>
      String(it.un).includes(s) ||
      (it.name || '').toLowerCase().includes(s) ||
      (it.class || '').toLowerCase().includes(s) ||
      (it.pg || '').toLowerCase().includes(s)
    )
  }, [q, items])

  return (
    <div>
      <input placeholder="Search UN, name, class, PG" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, width: '100%', maxWidth: 420 }} />
      <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>UN</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Proper shipping name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Class</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>PG</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Open PHMSA</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it, i) => (
            <tr key={i}>
              <td>{it.un}</td>
              <td>{it.name}</td>
              <td>{it.class}</td>
              <td>{it.pg}</td>
              <td>
                <button onClick={() => window.open(PHMSA_TABLE, '_blank')}>Open table</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SDS() {
  const [term, setTerm] = useState('')
  const url = useMemo(() => {
    return NIOSH_SEARCH
  }, [])

  return (
    <div>
      <input placeholder="Chemical or CAS" value={term} onChange={e => setTerm(e.target.value)} style={{ padding: 8 }} />
      <button style={{ marginLeft: 8 }} onClick={() => window.open(url, '_blank')}>Open NIOSH Pocket Guide</button>
      <p style={{ marginTop: 12, fontSize: 12 }}>Search the chemical on the NIOSH page.</p>
    </div>
  )
}

function ATA({ chapters }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return chapters.filter(c =>
      c.chapter.includes(s) || c.name.toLowerCase().includes(s)
    )
  }, [q, chapters])

  return (
    <div>
      <input placeholder="Search ATA" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, width: '100%', maxWidth: 420 }} />
      <ul>
        {filtered.map((c, i) => <li key={i}>{c.chapter} - {c.name}</li>)}
      </ul>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('ADs')
  const engines = useLocalJSON('/engines.json')
  const chapters = useLocalJSON('/ata_chapters.json')
  const hazmat = useLocalJSON('/hazmat_min.json')

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial', padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <h1>Engine Shop Playbook</h1>
      <p style={{ fontSize: 14, color: '#555' }}>Public data. Planning and reference only.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActive(t)}
            style={{ padding: '6px 10px', border: '1px solid #ccc', background: active === t ? '#eee' : '#fff' }}
          >
            {t}
          </button>
        ))}
      </div>

      {active === 'ADs' && <AdSearch engines={engines} />}
      {active === 'HazMat' && <HazMat items={hazmat} />}
      {active === 'SDS' && <SDS />}
      {active === 'ATA' && <ATA chapters={chapters} />}

      <hr style={{ margin: '24px 0' }} />
      <small>
        Disclaimer - This app points to official sources and generic references. It does not replace OEM manuals or instructions.
      </small>
    </div>
  )
}
