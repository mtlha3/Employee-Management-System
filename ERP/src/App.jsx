import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './Pages/Dashboard';

function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
  
  );
}

export default App;
