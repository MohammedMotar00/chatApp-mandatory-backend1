import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';

import Main from './Components/Main';
import Chat from './Components/Chat';

function App() {
  return (
    <div className="App">
      <Router>
        <Route exact path="/" component={Main} />
        <Route path="/chat" component={Chat} />
      </Router>
    </div>
  );
}

export default App;
