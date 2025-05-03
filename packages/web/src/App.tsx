import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppSelector } from 'core/src';
import HomePage from './components/pages/HomePage';

function App() {
  const theme = useAppSelector(state => state.ui.theme);
  
  return (
    <div className={`app ${theme}`}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
