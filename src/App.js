// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Character from './components/Character';
import Game from './components/Game';
import UI from './components/UI';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/game" component={Game} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
