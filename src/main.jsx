import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Bell, Check, ChevronDown, CircleHelp, Clock3, Crosshair, Eye, LocateFixed, MapPin, Menu, MessageSquareText, Pause, Play, Radio, Shield, ShieldCheck, Siren, Smartphone, Users, Waves, X } from 'lucide-react';
import './style.css';

const initialAlerts = [
  { title: 'Elephant activity detected', detail: 'Movement near the eastern forest boundary', time: '2 min ago', type: 'warning' },
  { title: 'Patrol team acknowledged', detail: 'Field unit 02 is moving to checkpoint C', time: '18 min ago', type: 'success' },
  { title: 'Perimeter sensor online', detail: 'East watchtower · Signal strong', time: '41 min ago', type: 'normal' }
];
const people = [
  { name: 'Lakshmi Devi', role: 'Village coordinator', initials: 'LD', color: 'lavender' },
  { name: 'Arun Kumar', role: 'Forest patrol', initials: 'AK', color: 'peach' },
  { name: 'Meena Rani', role: 'Community volunteer', initials: 'MR', color: 'mint' },
  { name: 'Ravi Shankar', role: 'Village resident', initials: 'RS', color: 'blue' }
];

function VillageMap({ running, alertLevel, setAlertLevel }) {
  const herdRef = React.useRef(null);
  if (!herdRef.current) {
    const startPoints = [[650,145],[720,190],[680,280],[550,300],[740,330]];
    herdRef.current = startPoints.map(([x,y], index) => ({
      id: index + 1, x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
      turns: 3 + Math.floor(Math.random() * 8), trail: [{x,y}]
    }));
  }
  const [, renderMotion] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      herdRef.current = herdRef.current.map(animal => {
        let {x,y,vx,vy,turns} = animal;
        turns -= 1;
        if (turns <= 0) {
          const heading = Math.atan2(vy || 1, vx || 1) + (Math.random() - 0.5) * 1.6;
          const speed = 2.2 + Math.random() * 2.8;
          vx = Math.cos(heading) * speed; vy = Math.sin(heading) * speed;
          turns = 4 + Math.floor(Math.random() * 10);
        }
        let nx = x + vx, ny = y + vy;
        if (nx < 515 || nx > 778) { vx = -vx; nx = Math.max(515, Math.min(778, nx)); }
        if (ny < 82 || ny > 390) { vy = -vy; ny = Math.max(82, Math.min(390, ny)); }
        return {...animal, x:nx, y:ny, vx, vy, turns, trail:[...animal.trail,{x:nx,y:ny}].slice(-14)};
      });
      renderMotion(frame => frame + 1);
    }, 500);
    return () => clearInterval(id);
  }, [running]);
  const herd = herdRef.current;
  return <div className="map-wrap">
    <div className="map-toolbar"><div className="map-title"><span className="live-dot"/><span>LIVE SIMULATION</span><span className="map-time">09:42:16 IST</span></div><button className="icon-btn map-locate" aria-label="Recenter map"><LocateFixed size={16}/></button></div>
    <svg className="village-map" viewBox="0 0 820 460" role="img" aria-label="Illustrated village map showing forest, village and elephant activity">
      <defs>
        <pattern id="grass" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="3" cy="5" r="1" fill="#dce8d3"/><circle cx="16" cy="18" r="1" fill="#dce8d3"/></pattern>
        <pattern id="forest" width="31" height="27" patternUnits="userSpaceOnUse"><circle cx="9" cy="11" r="8" fill="#2f654b"/><circle cx="20" cy="18" r="9" fill="#397353"/><circle cx="23" cy="4" r="7" fill="#477d5a"/></pattern>
        <filter id="soft"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <rect width="820" height="460" fill="#edf3e8"/><rect width="820" height="460" fill="url(#grass)"/>
      <path d="M580 0H820V460H647c24-51 13-89 35-130 17-31 13-64-8-91-30-40-11-83-42-113-26-26-23-66-52-126Z" fill="#c7d8b7"/>
      <path d="M610 0H820V460H674c31-59 20-89 39-128 17-33 5-60-13-90-22-36-5-79-37-109-28-26-27-73-53-133Z" fill="url(#forest)" opacity=".94"/>
      <path d="M0 359C98 337 150 381 241 359s136-18 218 2 111 18 163-1" fill="none" stroke="#bbd8dc" strokeWidth="14" opacity=".8"/><path d="M0 359C98 337 150 381 241 359s136-18 218 2 111 18 163-1" fill="none" stroke="#dff0ec" strokeWidth="5"/>
      <path d="M89 0c10 70 5 123 45 164 37 39 31 77 19 119-12 40 12 79 41 120M320 0c18 66 7 93 35 137 23 35 18 74 4 108-15 37-5 99 30 144M0 262c83 9 130 3 192 21s125 32 187 11 126-20 214-6" fill="none" stroke="#fff8e9" strokeWidth="9" strokeLinecap="round"/><path d="M89 0c10 70 5 123 45 164 37 39 31 77 19 119-12 40 12 79 41 120M320 0c18 66 7 93 35 137 23 35 18 74 4 108-15 37-5 99 30 144M0 262c83 9 130 3 192 21s125 32 187 11 126-20 214-6" fill="none" stroke="#e9dabc" strokeWidth="1.5" strokeDasharray="4 6"/>
      {/* home clusters */}
      {[[100,120],[142,139],[187,111],[226,154],[100,202],[148,216],[207,197],[271,119],[307,162],[370,108],[395,176],[269,245],[334,235],[412,252],[173,295],[252,316],[363,309],[450,174],[462,221]].map(([hx,hy],i)=><g key={i} transform={`translate(${hx} ${hy})`}><rect x="-11" y="-5" width="22" height="15" rx="2" fill={i%3===0?'#d48d69':'#e4ae7d'} stroke="#fff7e8" strokeWidth="2"/><path d="M-14-5 0-16 14-5Z" fill="#805448"/><rect x="-2" y="2" width="5" height="8" fill="#fff1d7"/></g>)}
      {/* fields */}
      <path d="M25 57h155v29H25zM230 335h166v23H230zM406 52h122v44H406z" fill="#dbe6b8" stroke="#c7d29f" strokeWidth="2"/><path d="M35 64h135M35 73h135M240 343h145M416 63h100M416 76h100" stroke="#c4d19d" strokeWidth="2"/>
      {/* sensor posts */}
      {[[536,108,'A'],[548,300,'B'],[476,58,'C']].map(([sx,sy,label])=><g key={label}><circle cx={sx} cy={sy} r="13" fill="#fff" stroke="#71a98a" strokeWidth="2"/><path d={`M${sx} ${sy-5}v10m-4-5h8`} stroke="#377e5a" strokeWidth="2"/><text x={sx+17} y={sy+4} className="sensor-label">SENSOR {label}</text></g>)}
      <text x="657" y="45" className="map-region">EASTERN FOREST</text><text x="657" y="63" className="map-small">KALAKAD–MUNDANTHURAI BUFFER</text>
      <text x="222" y="185" className="map-region village-label">KAVERI VILLAGE</text><text x="222" y="201" className="map-small">RESIDENTIAL ZONE · 128 HOMES</text>
      <text x="72" y="44" className="map-small">NORTH FIELDS</text><text x="695" y="349" className="map-small">FOREST EDGE</text>
      {/* Five independent random-walk tracks; each continues from its current position. */}
      {herd.map((elephant,index)=>{
        const colors=['#e6a344','#dc8067','#6d94bc','#8b79aa','#4f9a75'];
        const points=elephant.trail.map(point=>`${point.x},${point.y}`).join(' ');
        return <g key={elephant.id} aria-label={`Simulated elephant ${elephant.id}`}>
          <polyline points={points} fill="none" stroke={colors[index]} strokeWidth="2.2" strokeDasharray="4 5" strokeLinecap="round" opacity=".65"/>
          <circle cx={elephant.x} cy={elephant.y} r="27" fill={colors[index]} opacity=".1"/>
          <g transform={`translate(${elephant.x} ${elephant.y})`}><circle r="17" fill="#fff" stroke={colors[index]} strokeWidth="2.5"/><text textAnchor="middle" dominantBaseline="central" fontSize="18">🐘</text></g>
          <g transform={`translate(${elephant.x+14} ${elephant.y-24})`}><rect width="23" height="16" rx="8" fill="#fff"/><text x="11.5" y="11.5" textAnchor="middle" className="elephant-tag">E{elephant.id}</text></g>
        </g>;
      })}
      {/* patrol */}<g transform="translate(349 265)"><circle r="13" fill="#fff" stroke="#5d89bb" strokeWidth="2"/><path d="M-4 3l4-8 4 8M-6 5h12" fill="none" stroke="#4f7ead" strokeWidth="1.8"/></g><text x="366" y="270" className="map-small">PATROL 02</text>
      {alertLevel && <g><circle cx="645" cy="220" r="45" fill="#e77b64" opacity=".12"/><circle cx="645" cy="220" r="30" fill="none" stroke="#dd765d" strokeWidth="2" strokeDasharray="5 5"/></g>}
    </svg>
    <div className="map-legend"><span><i className="legend-dot elephant-dot"/>5 roaming elephants</span><span><i className="legend-dot sensor-dot"/>Sensor</span><span><i className="legend-dot patrol-dot"/>Patrol unit</span><span><i className="legend-line"/>Village boundary</span></div>
    <div className="map-footer"><span><Crosshair size={14}/> Last collar packet · 2 min ago</span><span>Map data is simulated for demo purposes</span></div>
  </div>
}

function App() {
  const [running, setRunning] = useState(true);
  const [alertLevel, setAlertLevel] = useState(false);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [toast, setToast] = useState('');
  const [phone, setPhone] = useState('');
  const [smsAdminPin, setSmsAdminPin] = useState('');
  const [smsState, setSmsState] = useState('');
  const [smsBusy, setSmsBusy] = useState(false);
  const [smsMode, setSmsMode] = useState('demo');
  const [smsMissing, setSmsMissing] = useState([]);
  const [tab, setTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(i); }, []);
  useEffect(() => { fetch('/api/status').then(r=>r.json()).then(d=>{setSmsMode(d.mode);setSmsMissing(d.missing||[])}).catch(()=>setSmsMissing(['API status unavailable'])); }, []);
  useEffect(() => {
    const events = new EventSource('/api/events');
    events.onmessage = event => {
      try {
        const alert = JSON.parse(event.data);
        setAlertLevel(true); setAlerts(items=>[alert,...items]);
        setToast(`Alert delivered to ${alert.recipients} connected demo session${alert.recipients===1?'':'s'}.`);
        if ('Notification' in window && Notification.permission === 'granted') new Notification('MaMothy safety alert',{body:alert.detail});
      } catch { /* Ignore malformed demo events. */ }
    };
    return () => events.close();
  }, []);
  useEffect(() => { if(!toast)return; const t=setTimeout(()=>setToast(''),4000); return ()=>clearTimeout(t); }, [toast]);
  const clock = useMemo(()=>now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}),[now]);

  function navigateTo(name, selector) {
    setTab(name); setMenuOpen(false);
    if (name === 'overview') window.scrollTo({top: 0, behavior: 'smooth'});
    else requestAnimationFrame(() => document.querySelector(selector)?.scrollIntoView({behavior: 'smooth', block: 'center'}));
  }
  async function broadcast() {
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    try {
      const response=await fetch('/api/alerts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({detail:'Elephant sighting · Kaveri east boundary'})});
      if(!response.ok) throw new Error('Could not broadcast the alert.');
      const result=await response.json();
      setToast(`Demo alert sent to ${result.recipients} connected session${result.recipients===1?'':'s'} · 128-member audience is simulated.`);
    } catch { setToast('Alert broadcast failed. Check that the demo server is running.'); }
  }
  async function sendSms(e) {
    e.preventDefault(); setSmsBusy(true); setSmsState('');
    try {
      const rawPhone=phone.trim();
      const digits=rawPhone.replace(/\D/g,'');
      const normalizedPhone=rawPhone.startsWith('+')?`+${digits}`:digits.startsWith('91')&&digits.length===12?`+${digits}`:`+91${digits.replace(/^0/,'')}`;
      const res=await fetch('/api/sms',{method:'POST',headers:{'Content-Type':'application/json','X-SMS-Admin-Pin':smsAdminPin},body:JSON.stringify({phone:normalizedPhone})});
      const data=await res.json(); if(!res.ok)throw new Error(data.error||'Unable to send SMS.');
      setSmsState(data.message || (data.mode==='live'?'MSG91 accepted the SMS request. Check MSG91 SMS Logs for delivery.':'Demo SMS queued — no message was sent to a mobile network.'));
      setSmsMode(data.mode); setPhone(''); setSmsAdminPin('');
      setAlerts(a=>[{title:data.mode==='live'?'MSG91 SMS queued':'Demo SMS queued',detail:`${data.mode==='demo'?'Preview for':'To'} ${normalizedPhone}`,time:'Just now',type:'success'},...a]);
    } catch(err) {setSmsState(err.message)} finally {setSmsBusy(false)}
  }
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><span>m</span></div><div><strong>MaMothy</strong><small>VILLAGE SAFETY</small></div><button className="mobile-close" onClick={()=>setMenuOpen(false)}><X size={19}/></button></div>
      <div className="workspace"><div className="workspace-icon">KV</div><div><strong>Kaveri Village</strong><span>Community dashboard</span></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav"><button onClick={()=>navigateTo('overview')} className={tab==='overview'?'active':''}><Activity size={18}/>Overview</button><button onClick={()=>navigateTo('map','.map-card')} className={tab==='map'?'active':''}><MapPin size={18}/>Live map<span className="nav-live"/></button><button onClick={()=>navigateTo('alerts','.alert-panel')} className={tab==='alerts'?'active':''}><Bell size={18}/>Alerts<span className="nav-count">3</span></button><button onClick={()=>navigateTo('community','.community-panel')} className={tab==='community'?'active':''}><Users size={18}/>Community</button></nav>
      <div className="sidebar-spacer"/><div className="sidebar-status"><div className="status-icon"><ShieldCheck size={19}/></div><div><strong>System protected</strong><span>All sensors operational</span></div><span className="status-green"/></div>
      <div className="profile"><div className="avatar avatar-user">PK</div><div><strong>Praveen Kumar</strong><span>Village administrator</span></div><MoreIcon/></div>
    </aside>
    {menuOpen&&<div className="scrim" onClick={()=>setMenuOpen(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="menu-btn" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button><div className="breadcrumb">Kaveri Village <span>/</span> <b>{tab==='overview'?'Overview':tab==='map'?'Live map':tab==='alerts'?'Alerts':'Community'}</b></div><div className="topbar-right"><span className="top-clock"><Clock3 size={15}/>{clock} IST</span><button className="icon-btn bell-button" onClick={()=>navigateTo('alerts','.alert-panel')} aria-label="View alerts"><Bell size={18}/><i/></button><div className="avatar avatar-user top-avatar">PK</div></div></header>
      <section className="content">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-mark"/>FIELD OPERATIONS</div><h1>{tab==='overview'?'Village overview':tab==='map'?'Live village map':tab==='alerts'?'Community alerts':'Community contacts'}</h1><p>{tab==='alerts'?'Review and broadcast important village safety updates.':tab==='community'?'Meet the people keeping Kaveri village safe.':'Monitor wildlife activity and keep your community safe.'}</p></div><div className="heading-actions"><span className="date-pill"><span className="date-dot"/>{now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span><button className="help-btn"><CircleHelp size={16}/> Help</button></div></div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>COMMUNITY MEMBERS</span><div className="stat-icon purple"><Users size={17}/></div></div><div className="stat-value">128 <span className="stat-change">+4 this week</span></div><div className="stat-foot">Registered for safety alerts</div></div>
          <div className="stat-card"><div className="stat-top"><span>LORA GATEWAY</span><div className="stat-icon green"><Radio size={17}/></div></div><div className="stat-value">1<span className="stat-total"> / 1</span><span className="online-pill"><i/>Online</span></div><div className="stat-foot">Collar telemetry · 2 min ago</div></div>
          <div className="stat-card"><div className="stat-top"><span>SIMULATED ELEPHANTS</span><div className="stat-icon amber"><Waves size={17}/></div></div><div className="stat-value">5 <span className="activity-status"><i/>Roaming</span></div><div className="stat-foot">Independent paths · moving continuously</div></div>
          <div className="stat-card"><div className="stat-top"><span>RESPONSE TEAMS</span><div className="stat-icon blue"><Shield size={17}/></div></div><div className="stat-value">2 <span className="team-status">On patrol</span></div><div className="stat-foot">Team 02 · East checkpoint</div></div>
        </div>
        <div className="section-heading"><div><h2>Village activity</h2><p>Live overview of your community and surrounding area</p></div><div className="map-actions"><button className={`simulation-pill ${running?'sim-running':''}`}><span/>{running?'Simulation running':'Simulation paused'}</button><button className="pause-btn" onClick={()=>setRunning(!running)}>{running?<><Pause size={15}/> Pause</>:<><Play size={15}/> Resume</>}</button></div></div>
        <div className="map-card"><VillageMap running={running} alertLevel={alertLevel} setAlertLevel={setAlertLevel}/></div>
        <div className="lower-grid">
          <section className="panel alert-panel"><div className="panel-header"><div><h3>Recent alerts</h3><p>Latest activity across your village</p></div><button className="text-link" onClick={()=>navigateTo('alerts','.alert-panel')}>View all <span>→</span></button></div>
            <div className="alert-list">{alerts.slice(0,3).map((a,i)=><div className="alert-row" key={`${a.title}-${i}`}><div className={`alert-symbol ${a.type}`}>{a.type==='warning'?<AlertTriangle size={16}/>:a.type==='success'?<Check size={16}/>:<Radio size={16}/>}</div><div className="alert-copy"><strong>{a.title}</strong><span>{a.detail}</span></div><time>{a.time}</time></div>)}</div>
          </section>
          <section className="panel community-panel"><div className="panel-header"><div><h3>Community contacts</h3><p>People keeping Kaveri safe</p></div><button className="text-link" onClick={()=>navigateTo('community','.community-panel')}>128 members <span>→</span></button></div><div className="people-list">{people.slice(0,3).map(p=><div className="person-row" key={p.initials}><div className={`avatar ${p.color}`}>{p.initials}</div><div className="person-copy"><strong>{p.name}</strong><span>{p.role}</span></div><span className="person-online"><i/>Active</span></div>)}</div></section>
        </div>
        <section className="sms-card"><div className="sms-icon"><Smartphone size={20}/></div><div className="sms-main"><div className="sms-heading"><div><h3>Send a test SMS</h3><p>{smsMode==='live'?'Uses your approved MSG91 DLT template; check MSG91 Logs for delivery.':'Configure MSG91 to send your approved SMS template.'}</p></div><span className={`mode-pill ${smsMode}`}><i/>{smsMode==='live'?'MSG91 LIVE':'DEMO MODE'}</span></div><form className="sms-form" onSubmit={sendSms}><label className="phone-field"><span>PHONE NUMBER</span><div className="phone-input"><span className="country-code">{phone.trim().startsWith('+')?'🌐 Intl':'🇮🇳 +91'}</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="98765 43210" inputMode="tel" aria-label="Phone number" required/><span className="input-hint">10-digit Indian number or +country code</span></div></label><label className="sms-pin-field"><span>ADMIN PIN</span><input type="password" value={smsAdminPin} onChange={e=>setSmsAdminPin(e.target.value)} placeholder={smsMode==='live'?'Enter PIN':'Set SMS_ADMIN_PIN on server'} autoComplete="off" minLength={smsMode==='live'?8:undefined} required={smsMode==='live'} aria-label="SMS admin PIN"/><small>Sent securely to the server; not saved.</small></label><button className="send-btn" disabled={smsBusy}>{smsBusy?'Sending…':<><MessageSquareText size={16}/> Send test SMS</>}</button></form>{smsState&&<div className={`sms-result ${smsState.includes('successfully')||smsState.includes('queued')||smsState.includes('accepted')?'ok':'error'}`}>{smsState}</div>}<div className="sms-foot"><ShieldCheck size={14}/>{smsMode==='live'?'MSG91 template request accepted; final delivery is shown in MSG91 SMS Logs.':smsMissing.length?`Demo mode: server cannot see ${smsMissing.join(', ')}. Add them in the server environment and restart/redeploy.`:'Demo mode: no real SMS is sent until MSG91 is configured.'}</div></div></section>
        <footer className="footer"><span>MaMothy village safety simulator <span className="footer-sep">·</span> Demo environment</span><span><span className="footer-green"/>All systems operational</span></footer>
      </section>
    </main>
    <button className="broadcast-fab" onClick={broadcast}><Siren size={17}/> Broadcast alert <span>128</span></button>
    {toast&&<div className="toast"><div className="toast-check"><Check size={16}/></div><div><strong>Alert broadcast</strong><span>{toast}</span></div><button onClick={()=>setToast('')}><X size={16}/></button></div>}
  </div>
}
function MoreIcon(){return <button className="more-btn" aria-label="More options"><span/><span/><span/></button>}

createRoot(document.getElementById('root')).render(<App/>);
