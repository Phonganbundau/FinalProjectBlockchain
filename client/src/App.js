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
  const [account, setAccount] = useState(""); // Holds the connected account
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
  };

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

/*
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLimitedOwnership is ERC721Enumerable, Ownable {
    struct LeasePeriod {
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => LeasePeriod) public leasePeriods;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("TimeLimitedOwnership", "TLO") {}

    // Mint token chỉ với thông tin metadata (không yêu cầu thời gian thuê)
    function mint(address to, uint256 tokenId, string memory tokenURI) public onlyOwner {
        require(!_exists(tokenId), "Token already exists.");
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI); // Lưu metadata của token
    }

    // Hàm nội bộ để lưu tokenURI
    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = tokenURI;
    }

    // Hàm để lấy thông tin URI của token
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Người thuê gọi hàm này để thuê token với thời gian sở hữu giới hạn
function rentToken(uint256 tokenId, uint256 _startTime, uint256 _endTime) public {
    require(ownerOf(tokenId) != msg.sender, "You are already the owner of this token.");
    require(_startTime < _endTime, "Start time must be before end time.");
    require(block.timestamp <= _startTime, "Start time is in the past.");

    leasePeriods[tokenId] = LeasePeriod(_startTime, _endTime);

    // Chuyển token từ người bán (chủ sở hữu ban đầu) sang người thuê
    address owner = ownerOf(tokenId);
    
    // Sử dụng _transfer để thực hiện việc chuyển token
    _transfer(owner, msg.sender, tokenId);
}


    // Hàm thu hồi token sau khi hết hạn thuê
    function reclaimToken(uint256 tokenId) public {
        require(block.timestamp > leasePeriods[tokenId].endTime, "Lease period has not ended yet.");
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, owner(), tokenId);  // Chuyển token về chủ sở hữu ban đầu sau khi hết hạn
    }

    // Gia hạn thời gian thuê
    function extendLease(uint256 tokenId, uint256 newEndTime) public {
        require(ownerOf(tokenId) == msg.sender, "Only the current tenant can extend the lease.");
        require(newEndTime > leasePeriods[tokenId].endTime, "New end time must be later than the current end time.");
        leasePeriods[tokenId].endTime = newEndTime;
    }
}*/