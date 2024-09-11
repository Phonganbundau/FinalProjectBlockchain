import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Web3 from 'web3';
import TimeLimitedOwnership from './contracts/TimeLimitedOwnership.json';
import Homepage from './components/Homepage';
import TransferToken from './components/Transfer';
import TokenList from './components/TokenList';
import AllTokenList from './components/AllTokenList';
import CreateToken from './components/CreateToken';
import RentProperty from './components/RentProperty';

function App() {
  /*const [account, setAccount] = useState(""); // Holds the connected account
  const [contract, setContract] = useState(null);


  const transferToken = async (toAddress, tokenId) => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      await contract.methods.transferDuringPeriod(toAddress, tokenId).send({ from: account });
      alert("Token transferred successfully!");
    } catch (error) {
      console.error("Error transferring token:", error);
    }
  };*/

  return (
    <Router>
      <Routes>
        
        <Route
          path="/transfer"
          element={
            <TransferToken
              transferToken={transferToken}
            />
          }
        />
        <Route
        path="/tokenlist"
        element={
          <TokenList/>  }
      />
      <Route
      path="/all"
      element={
        <AllTokenList/>  }
    />
      <Route
      path="/"
      element={
        <CreateToken/>  }
    />
    <Route
    path="/rent"
    element={
      <RentProperty/>  }
  />
      </Routes>
    </Router>
  );
}

export default App;

