import './App.css';

import {useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage';
import LoggingIn from './pages/LoggingIn';
import LoggingInSpotify from './pages/LoggingInSpotify';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Homepage/>}></Route>
        <Route path="/callback" element={<LoggingIn/>}></Route>
        <Route path="/spotify/callback" element={<LoggingInSpotify/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
