import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'

const tabs = ['ADs', 'HazMat', 'SDS', 'ATA']

const PRESET_ENGINES = ['CFM56-7B','LEAP-1A','LEAP-1B','V2500-A5','PW1100G-JM','PW1500G','Trent 700','Trent 1000','GE90','CF6-80C2']
const PRESET_ATA = ['70','71','72','73','74','75','76','77','78','79','80']

const FAA_SEARCH = 'https://drs.faa.gov/search'
const FAA_AD_RULES = 'https://drs.faa.gov/browse/ADFRAWD/doctypeDetails'
const FAA_EAD = 'https://drs.faa.gov/browse/ADFREAD/doctypeDetails'
const EASA_MAIN = 'https://ad.easa.europa.eu/'
const EASA_ADV = 'https://ad.easa.europa.eu/search/advanced'
const NIOSH_SEARCH = 'https://www.cdc.gov/niosh/npg/search.html'
const PHMSA_TABLE = 'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-172/subpart-B/section-172.101#p-172.101(c)(1)'

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
function copy(text) { navigator.clipboard.writeText(text) }

// Build a bookmarklet that tries common selectors on FAA/EASA pages to paste the query into the main search box.
function makeBookmarklet(query) {
  const code = `(function(){try{var q=${JSON.stringify(query)};var els=[document.querySelector('input[type=search]'),document.querySelector('input[placeholder*="Search" i]'),document.querySelector('#searchInput'),document.querySelector('input[name="search"]'),document.querySelector('input[role="searchbox"]')].filter(Boolean);if(els.length){var el=els[0];el.focus();el.value=q;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}else{alert('Search box not found. Paste this manually: '+q);} }catch(e){alert('Paste this manually: '+${JSON.stringify(query)});} })();`
  return `javascript:${encodeURIComponent(code)}`
}

function AdSearch({ engines }) {
  const [engine, setEngine] = useState('')
  const [ata, setAta] = useState('')
  const [kw, setKw] = useState('')

  const [recents, setRecents] = useLocalList(LS_RECENTS, [])
  const [favs, setFavs] = useLocalList(LS_FAVORITES, [])

  const queryText = useMemo(() => {
    return [engine, ata ? 'ATA ' + ata : '', kw].filter(Boolean).join(' ')
  }, [engine, ata, kw])

  function saveRecent() {
    const item = { engine, ata, kw, ts: Date.now() }
    const next = [item, ...recents].slice(0, 5)
    setRecents(next)
  }
  function addFavorite() {
    const label = queryText || 'Empty query'
    if (!favs.find(f => f.engine === engine && f.ata === ata && f.kw === kw)) {
      setFavs([{ engine, ata, kw, label }, ...favs].slice(0, 20))
    }
  }
  function loadSearch(s) { setEngine(s.engine||''); setAta(s.ata||''); setKw(s.kw||'') }
  function clearSearch() { setEngine(''); setAta(''); setKw('') }

  const bookmarkletHref = useMemo(() => makeBookmarklet(queryText || ''), [queryText])

  return (
    <div className="grid">
      <div className="card">
        <h2>Airworthiness Directives Launchpad</h2>
        <p className="muted">Build your query, open FAA/EASA, then use the bookmarklet to auto-fill the search box on their site.</p>

        <div className="inputs" style={{marginTop:12}}>
          <input type="text" placeholder="Engine model (e.g., CFM56-7B)" list="engine-list" value={engine} onChange={e => setEngine(e.target.value)} />
          <datalist id="engine-list">
            {engines.map((e, i) => <option key={i} value={e.model} />)}
            {PRESET_ENGINES.filter(p => !engines.find(e => e.model === p)).map((p, i) => <option key={'p'+i} value={p} />)}
          </datalist>
          <input type="text" placeholder="ATA chapter (e.g., 72)" value={ata} onChange={e => setAta(e.target.value)} />
          <input type="text" placeholder="Keyword (e.g., hot section)" value={kw} onChange={e => setKw(e.target.value)} />
        </div>

        <div className="row" style={{marginTop:10}}>
          <span className="muted">Quick picks</span>
          {PRESET_ENGINES.map(e => <button key={e} className="chip" onClick={()=>setEngine(e)}>{e}</button>)}
        </div>
        <div className="row" style={{marginTop:8}}>
          <span className="muted">ATA</span>
          {PRESET_ATA.map(a => <button key={a} className="chip" onClick={()=>setAta(a)}>{a}</button>)}
        </div>

        <div className="row" style={{marginTop:12}}>
          <button className="btn primary" onClick={()=>{openNew(FAA_SEARCH); saveRecent()}}>Open FAA search</button>
          <button className="btn" onClick={()=>{openNew(FAA_AD_RULES); saveRecent()}}>FAA AD rules</button>
          <button className="btn" onClick={()=>{openNew(FAA_EAD); saveRecent()}}>FAA Emergency ADs</button>
          <button className="btn primary" onClick={()=>{openNew(EASA_ADV); saveRecent()}}>Open EASA advanced</button>
          <button className="btn" onClick={()=>{openNew(FAA_SEARCH); openNew(EASA_ADV); saveRecent()}}>Open both</button>
          <button className="btn" onClick={()=>copy(queryText)}>Copy query text</button>
          <button className="btn" onClick={addFavorite}>Star favorite</button>
          <button className="btn" onClick={clearSearch}>Clear</button>
        </div>

        <div className="card" style={{marginTop:12}}>
          <div className="split">
            <div>
              <h3>Bookmarklet</h3>
              <p className="muted">Drag this to your bookmarks bar. Then, after the FAA/EASA page opens, click the bookmark to auto-fill the search box.</p>
              <p><a className="btn primary" href={bookmarkletHref}>AD Autofill</a></p>
              <small>Works on most search pages. If it cannot find a search box, it will prompt you to paste the text manually.</small>
            </div>
            <div>
              <h3>Current query</h3>
              <p className="muted">{queryText || 'Nothing yet'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent searches</h3>
        {recents.length === 0 && <div className="muted">No recent searches yet.</div>}
        <ul className="list">
          {recents.map((r,i)=>(
            <li key={i}>
              <button className="btn" onClick={()=>loadSearch(r)}>Load</button>
              <span>{[r.engine, r.ata ? 'ATA '+r.ata : '', r.kw].filter(Boolean).join(' ')}</span>
            </li>
          ))}
        </ul>

        <h3 style={{marginTop:16}}>Favorites</h3>
        {favs.length === 0 && <div className="muted">No favorites yet.</div>}
        <ul className="list">
          {favs.map((f,i)=>(
            <li key={i}>
              <button className="btn" onClick={()=>loadSearch(f)}>Load</button>
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
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
    <div className="card">
      <h2>HazMat quick lookup</h2>
      <div className="row" style={{marginTop:8}}>
        <input type="text" placeholder="Search UN, name, class, PG" value={q} onChange={e => setQ(e.target.value)} style={{maxWidth:420}} />
        <button className="btn" onClick={()=>openNew(PHMSA_TABLE)}>Open PHMSA 172.101 Table</button>
      </div>
      <table style={{marginTop:12}}>
        <thead>
          <tr>
            <th>UN</th><th>Proper shipping name</th><th>Class</th><th>PG</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it,i)=>(
            <tr key={i}><td>{it.un}</td><td>{it.name}</td><td>{it.class}</td><td>{it.pg}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SDS() {
  const [term, setTerm] = useState('')
  return (
    <div className="card">
      <h2>NIOSH Pocket Guide</h2>
      <div className="row" style={{marginTop:8}}>
        <input type="text" placeholder="Chemical or CAS" value={term} onChange={e => setTerm(e.target.value)} style={{maxWidth:420}} />
        <button className="btn primary" onClick={()=>openNew(NIOSH_SEARCH)}>Open NIOSH</button>
      </div>
      <small>Use the search box on the NIOSH page.</small>
    </div>
  )
}

function ATA({ chapters }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return chapters.filter(c => c.chapter.includes(s) || c.name.toLowerCase().includes(s))
  }, [q, chapters])

  return (
    <div className="card">
      <h2>ATA chapters</h2>
      <input type="text" placeholder="Search ATA" value={q} onChange={e => setQ(e.target.value)} style={{marginTop:8, maxWidth:420}} />
      <ul className="list" style={{marginTop:8}}>
        {filtered.map((c,i)=>(<li key={i}>{c.chapter} - {c.name}</li>))}
      </ul>
    </div>
  )
}

export default function App(){
  const [active, setActive] = useState('ADs')
  const engines = useLocalJSON('/engines.json')
  const chapters = useLocalJSON('/ata_chapters.json')
  const hazmat = useLocalJSON('/hazmat_min.json')

  return (
    <div className="container">
      <div className="app-header">
        <div>
          <div className="brand">Engine Shop Playbook</div>
          <div className="tag">Public data - planning and reference only</div>
        </div>
        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={'tab'+(active===t?' active':'')} onClick={()=>setActive(t)}>{t}</button>
          ))}
        </div>
      </div>

      {active === 'ADs' && <AdSearch engines={engines} />}
      {active === 'HazMat' && <HazMat items={hazmat} />}
      {active === 'SDS' && <SDS />}
      {active === 'ATA' && <ATA chapters={chapters} />}

      <div style={{marginTop:18}}>
        <small>Disclaimer - This app points to official sources and generic references. It does not replace OEM manuals or instructions.</small>
      </div>
    </div>
  )
}
