import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { rollDice } from './store/diceSlice';
import './App.css';

function App() {
  const diceValue = useSelector((state) => state.dice.value);
  const dispatch = useDispatch();

  const handleRoll = () => {
    dispatch(rollDice());
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dice Game</h1>
        <div className="dice-container">
          <div className="dice">{diceValue}</div>
        </div>
        <button className="roll-button" onClick={handleRoll}>
          Roll Dice
        </button>
      </header>
    </div>
  );
}

export default App;
