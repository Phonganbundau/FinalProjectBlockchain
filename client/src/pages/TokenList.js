import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { Container, Typography, Grid, Card, CardContent, CardMedia, CircularProgress, Button, Box } from "@mui/material";
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json";
import Grid2 from '@mui/material/Grid2';

const TokenList = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [tokens, setTokens] = useState([]); // Danh sách token thuộc sở hữu hiện tại
  const [rentedTokens, setRentedTokens] = useState([]); // Danh sách token cho thuê
  const [ownedByRenter, setOwnedByRenter] = useState([]);
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0].toLowerCase()); // Chuyển địa chỉ thành chữ thường

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = TimeLimitedOwnership.networks[networkId];

          if (deployedNetwork && deployedNetwork.address) {
            const contractInstance = new web3.eth.Contract(TimeLimitedOwnership.abi, deployedNetwork.address);
            setContract(contractInstance);
            await fetchTokens(contractInstance, accounts[0]);
          } else {
            alert("Contract not deployed on the current network.");
          }
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      } else {
        alert("Please install MetaMask to use this app.");
      }
    };

    connectWallet();
  }, []);

  const fetchTokens = async (contract, account) => {
    try {
      const totalSupply = await contract.methods.totalSupply().call(); // Lấy tổng số token
      const allTokens = [];
      const rented = [];
      const ownedByRenter = [];
  
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = (await contract.methods.tokenByIndex(i).call()).toString();
        const tokenURI = await contract.methods.tokenURI(tokenId).call();
        const metadata = await axios.get(tokenURI);
        const leasePeriod = await contract.methods.leasePeriods(tokenId).call();
        const currentTime = Math.floor(Date.now() / 1000);
        const owner = (await contract.methods.ownerOf(tokenId).call()).toLowerCase();
        const originalOwner = (await contract.methods.getOriginalOwner(tokenId).call()).toLowerCase();
        const endTime = Number(leasePeriod.endTime);
        let timeRemaining = endTime - currentTime;
        if (timeRemaining <= 0) {
          timeRemaining = 0;
        }
  
        const pricePerDay = Web3.utils.fromWei(leasePeriod.pricePerDay.toString(), 'ether');
  
        const tokenData = {
          tokenId,
          ...metadata.data,
          pricePerDay,
          timeRemaining,
          startTime: Number(leasePeriod.startTime),
          endTime,
          owner,
          originalOwner,
        };
  
        // Nếu người dùng là chủ sở hữu gốc
        if (originalOwner === account) {
          if (owner !== account && timeRemaining > 0) {
            rented.push(tokenData); // Token đang được cho thuê
          } else {
            allTokens.push(tokenData); // Token thuộc sở hữu hiện tại của chủ sở hữu gốc
          }
        }
  
        // Nếu người dùng hiện tại là người thuê token
        if (owner === account && originalOwner !== account) {
          ownedByRenter.push(tokenData); // Token mà người dùng đang thuê
        }
      }
  
      setTokens(allTokens); // Lưu token của người dùng hiện tại
      setRentedTokens(rented); // Lưu token đang được cho thuê
      setOwnedByRenter(ownedByRenter); // Lưu token mà người dùng đang thuê
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setLoading(false);
    }
  };
  
  

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const formatTimeRemaining = (timeRemaining) => {
    const days = Math.floor(timeRemaining / (3600 * 24));
    const hours = Math.floor((timeRemaining % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#3f51b5', letterSpacing: '0.1rem', padding: '10px 0', borderBottom: '2px solid #3f51b5' }}>
        My Tokens
      </Typography>
  
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : tokens.length === 0 && rentedTokens.length === 0 && ownedByRenter.length === 0 ? (
        <Typography variant="h6" align="center">No tokens found.</Typography>
      ) : (
        <>
          {/* Hiển thị các token hiện tại thuộc sở hữu của người dùng */}
          <Typography variant="h5" gutterBottom sx={{ color: '#3f51b5', marginTop: 3 }}>
            Currently Owned Tokens
          </Typography>
          <Grid2 container spacing={3}>
            {tokens.map((token) => (
              <Grid2 item xs={12} sm={6} key={token.tokenId}>
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardMedia component="img" height="160" image={token.image} alt={token.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h6">{token.name}</Typography>
                    <Typography variant="body2" color="textSecondary">Token ID: {token.tokenId}</Typography>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
  
          {/* Hiển thị các token thuộc sở hữu gốc của người dùng nhưng đang cho thuê */}
          <Typography variant="h5" gutterBottom sx={{ color: '#3f51b5', marginTop: 3 }}>
            Tokens Currently Rented Out
          </Typography>
          <Grid2 container spacing={3}>
            {rentedTokens.map((token) => (
              <Grid2 item xs={12} sm={6} key={token.tokenId}>
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardMedia component="img" height="160" image={token.image} alt={token.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h6">{token.name}</Typography>
                    <Typography variant="body2" color="textSecondary">Token ID: {token.tokenId}</Typography>
                    <Typography variant="body2" color="textSecondary">
                    Rent Period: from {formatTimestamp(token.startTime)} to {formatTimestamp(token.endTime)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Time Remaining: {token.timeRemaining > 0 ? formatTimeRemaining(token.timeRemaining) : 'Lease Expired'}</Typography>

                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
  
          {/* Hiển thị các token mà người dùng đang thuê */}
          <Typography variant="h5" gutterBottom sx={{ color: '#3f51b5', marginTop: 3 }}>
            Tokens I Am Renting
          </Typography>
          <Grid2 container spacing={3}>
            {ownedByRenter.map((token) => (
              <Grid2 item xs={12} sm={6} key={token.tokenId}>
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardMedia component="img" height="160" image={token.image} alt={token.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h6">{token.name}</Typography>
                    <Typography variant="body2" color="textSecondary">Token ID: {token.tokenId}</Typography>
                    <Typography variant="body2" color="textSecondary">
                    Rent Period: from {formatTimestamp(token.startTime)} to {formatTimestamp(token.endTime)}
                  </Typography>
                    <Typography variant="body2" color="textSecondary">Time Remaining: {token.timeRemaining > 0 ? formatTimeRemaining(token.timeRemaining) : 'Lease Expired'}</Typography>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </>
      )}
    </Container>
  );  
};

export default TokenList;
