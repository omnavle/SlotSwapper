import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Signup(){
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    try{
      const res = await fetch(`${API}/auth/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    }catch(err){ alert(err.message); }
  }

  return (
    <div>
      <h3>Sign up</h3>
      <form onSubmit={submit} style={{display:'grid',gap:8,maxWidth:400}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}
