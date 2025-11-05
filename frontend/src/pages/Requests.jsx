import React, { useEffect, useState } from 'react'
import { authFetch } from '../api'

export default function Requests(){
  const [incoming,setIncoming] = useState([]);
  const [outgoing,setOutgoing] = useState([]);

  async function load(){
    try{
      const data = await authFetch('/swaps/my-requests');
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    }catch(e){ alert(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  async function respond(id, accept){
    try{
      await authFetch(`/swaps/swap-response/${id}`, { method:'POST', body: JSON.stringify({ accept }) });
      alert(accept ? 'Accepted' : 'Rejected');
      load();
    }catch(e){ alert(e.message); }
  }

  return (
    <div>
      <h3>Incoming Requests</h3>
      <ul>
        {incoming.map(r=> (
          <li key={r._id} style={{marginBottom:8}}>
            From: {r.fromUser?.name} — offering: {r.mySlot?.title} — requesting: {r.theirSlot?.title} — <em>{r.status}</em>
            {r.status === 'PENDING' && (
              <div>
                <button onClick={()=>respond(r._id,true)}>Accept</button>
                <button onClick={()=>respond(r._id,false)}>Reject</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <h3>Outgoing Requests</h3>
      <ul>
        {outgoing.map(r=> (
          <li key={r._id} style={{marginBottom:8}}>
            To: {r.toUser?.name} — my: {r.mySlot?.title} — their: {r.theirSlot?.title} — <em>{r.status}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
