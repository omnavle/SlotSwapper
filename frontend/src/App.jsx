import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Requests from './pages/Requests'

function App(){
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }
  return (
    <div style={{padding:20,fontFamily:'Arial,Helvetica,sans-serif'}}>
      <header style={{display:'flex',gap:10,alignItems:'center',marginBottom:20}}>
        <h2 style={{margin:0}}>SlotSwapper</h2>
        <nav style={{marginLeft:20}}>
          <Link to="/">Dashboard</Link> | <Link to="/market">Marketplace</Link> | <Link to="/requests">Requests</Link>
        </nav>
        <div style={{marginLeft:'auto'}}>
          {user ? (<>
            <span style={{marginRight:10}}>Hi, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>) : (<>
            <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link>
          </>)}
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/" element={<Dashboard/>} />
        <Route path="/market" element={<Marketplace/>} />
        <Route path="/requests" element={<Requests/>} />
      </Routes>
    </div>
  );
}

export default App;
