import './App.css';

import {useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage';
import LoggingInTwitter from './pages/LoggingInTwitter';
import LoggingInSpotify from './pages/LoggingInSpotify';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Homepage/>}></Route>
        <Route path="/twitter/callback" element={<LoggingInTwitter/>}></Route>
        <Route path="/spotify/callback" element={<LoggingInSpotify/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
