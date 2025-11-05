import React, { useEffect, useState } from 'react'
import { authFetch } from '../api'

export default function Marketplace(){
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState(null);

  async function load(){
    try{
      const s = await authFetch('/swaps/swappable-slots');
      setSlots(s);
      const mine = await authFetch('/events/me');
      setMySwappables(mine.filter(x=>x.status === 'SWAPPABLE'));
    }catch(e){ console.error(e); alert(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  async function requestSwap(){
    if(!selectedTheirSlot || !selectedMySlot) return alert('Select both slots');
    try{
      await authFetch('/swaps/swap-request', { method:'POST', body: JSON.stringify({ mySlotId: selectedMySlot, theirSlotId: selectedTheirSlot }) });
      alert('Swap requested');
      setSelectedTheirSlot(null); setSelectedMySlot(null); load();
    }catch(e){ alert(e.message); }
  }

  return (
    <div>
      <h3>Marketplace — Available Swappable Slots</h3>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <ul>
            {slots.map(s=> (
              <li key={s._id} style={{marginBottom:8}}>
                <strong>{s.title}</strong> — {new Date(s.startTime).toLocaleString()} — owner: {s.owner?.name}
                <div>
                  <button onClick={()=>setSelectedTheirSlot(s._id)}>{selectedTheirSlot===s._id ? 'Selected' : 'Select'}</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{width:300}}>
          <h4>Your SWAPPABLE slots</h4>
          <ul>
            {mySwappables.map(m=> (
              <li key={m._id} style={{marginBottom:8}}>
                {m.title} — {new Date(m.startTime).toLocaleString()}
                <div>
                  <button onClick={()=>setSelectedMySlot(m._id)}>{selectedMySlot===m._id ? 'Selected' : 'Select'}</button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{marginTop:20}}>
            <button onClick={requestSwap}>Request Swap</button>
          </div>
        </div>
      </div>
    </div>
  );
}
