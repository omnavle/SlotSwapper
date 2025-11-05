import React, { useEffect, useState } from 'react'
import { authFetch } from '../api'

export default function Dashboard(){
  const [events,setEvents] = useState([]);
  const [title,setTitle] = useState('');
  const [startTime,setStart] = useState('');
  const [endTime,setEnd] = useState('');

  async function load(){
    try{ const data = await authFetch('/events/me'); setEvents(data); }catch(e){ console.error(e); alert(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  async function create(e){
    e.preventDefault();
    try{ await authFetch('/events', { method:'POST', body: JSON.stringify({ title, startTime, endTime }) }); setTitle(''); setStart(''); setEnd(''); load(); }catch(e){ alert(e.message); }
  }

  async function toggleSwappable(ev){
    const newStatus = ev.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
    try{ await authFetch(`/events/${ev._id}`, { method:'PUT', body: JSON.stringify({ status: newStatus }) }); load(); }catch(e){ alert(e.message); }
  }

  return (
    <div>
      <h3>My Events</h3>
      <form onSubmit={create} style={{display:'grid',gap:8,maxWidth:500}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
        <input type="datetime-local" value={startTime} onChange={e=>setStart(e.target.value)} required />
        <input type="datetime-local" value={endTime} onChange={e=>setEnd(e.target.value)} required />
        <button type="submit">Create Event</button>
      </form>

      <ul>
        {events.map(ev=> (
          <li key={ev._id} style={{marginTop:8}}>
            <strong>{ev.title}</strong> — {new Date(ev.startTime).toLocaleString()} to {new Date(ev.endTime).toLocaleString()} — <em>{ev.status}</em>
            <div>
              <button onClick={()=>toggleSwappable(ev)}>{ev.status === 'SWAPPABLE' ? 'Set Busy' : 'Make Swappable'}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
