import './App.css';

import {useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage';
import LoggingIn from './pages/LoggingIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Homepage/>}></Route>
        <Route path="/callback" element={<LoggingIn/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
