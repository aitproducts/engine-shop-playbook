import React, { useEffect, useMemo, useState } from 'react'

const tabs = ['ADs', 'HazMat', 'SDS', 'ATA']

function useLocalJSON(path) {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch(path).then(r => r.json()).then(setData).catch(() => setData([]))
  }, [path])
  return data
}

function openInNew(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function AdSearch({ engines }) {
  const [engine, setEngine] = useState('')
  const [ata, setAta] = useState('')
  const [q, setQ] = useState('')

  const faaUrl = useMemo(() => {
    // FAA DRS search deep link pattern - leave as keyword search
    const params = encodeURIComponent([engine, ata, q].filter(Boolean).join(' '))
    return `https://drs.faa.gov/browse/AD?search=${params}`
  }, [engine, ata, q])

  const easaUrl = useMemo(() => {
    const params = encodeURIComponent([engine, ata, q].filter(Boolean).join(' '))
    return `https://www.easa.europa.eu/en/document-library/airworthiness-directives?search_api_fulltext=${params}`
  }, [engine, ata, q])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input placeholder="Engine model" list="engine-list" value={engine} onChange={e => setEngine(e.target.value)} />
        <datalist id="engine-list">
          {engines.map((e, i) => <option key={i} value={e.model} />)}
        </datalist>
        <input placeholder="ATA chapter" value={ata} onChange={e => setAta(e.target.value)} />
        <input placeholder="Keyword" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => openInNew(faaUrl)}>Open FAA AD search</button>
        <button onClick={() => openInNew(easaUrl)}>Open EASA AD search</button>
      </div>
      <p style={{ marginTop: 12, fontSize: 12 }}>
        You will search on the official sites. This app does not store or republish any OEM content.
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
      <input placeholder="Search UN, name, class, PG" value={q} onChange={e => setQ(e.target.value)} />
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
                <button onClick={() => window.open(`https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-172/subpart-B/section-172.101#p-172.101(c)(1)`, '_blank')}>Open table</button>
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
    const q = encodeURIComponent(term)
    return `https://www.cdc.gov/niosh/npg/results.html?inpTarget=${q}`
  }, [term])

  return (
    <div>
      <input placeholder="Chemical or CAS" value={term} onChange={e => setTerm(e.target.value)} />
      <button style={{ marginLeft: 8 }} onClick={() => window.open(url, '_blank')}>Open NIOSH Pocket Guide</button>
      <p style={{ marginTop: 12, fontSize: 12 }}>Links go to NIOSH. For planning only.</p>
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
      <input placeholder="Search ATA" value={q} onChange={e => setQ(e.target.value)} />
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
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
