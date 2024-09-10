import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Container, TextField, Button, Typography, Grid, Box } from "@mui/material";
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json"; 

const TransferToken = () => {
  const [toAddress, setToAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false); // Trạng thái loading cho quá trình chuyển

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = TimeLimitedOwnership.networks[networkId];

          if (deployedNetwork && deployedNetwork.address) {
            const contractInstance = new web3.eth.Contract(
              TimeLimitedOwnership.abi,
              deployedNetwork.address
            );
            setContract(contractInstance);
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

  // Hàm xử lý chuyển nhượng token
  const transferToken = async (toAddress, tokenId) => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }

    setLoading(true);

    try {
      // Gọi hàm transferDuringLeasePeriod từ hợp đồng
      await contract.methods.transferDuringLeasePeriod(toAddress, tokenId).send({ from: account });
      alert("Token transferred successfully!");
    } catch (error) {
      console.error("Error transferring token:", error);
      alert("Error transferring token. See console for details.");
    } finally {
      setLoading(false); // Tắt trạng thái loading sau khi quá trình hoàn tất
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
    <Typography 
    variant="h4" 
    gutterBottom 
    sx={{ 
      color: '#3f51b5', 
      letterSpacing: '0.1rem',
      padding: '10px 0', 
      borderBottom: '2px solid #3f51b5', 
    }}
  >
    Transfer Token
  </Typography>
      <Box sx={{ p: 3, borderRadius: 4, boxShadow: 3, backgroundColor: "#f9f9f9" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="To Address"
              variant="outlined"
              fullWidth
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              sx={{ mb: 2 }} // Thêm khoảng cách phía dưới
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Token ID"
              variant="outlined"
              fullWidth
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              sx={{ mb: 2 }} // Thêm khoảng cách phía dưới
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => transferToken(toAddress, tokenId)}
          disabled={loading} // Vô hiệu hóa nút khi đang loading
          sx={{ mt: 2, borderRadius: 3, backgroundColor: '#6200ea', textTransform: 'none' }}
        >
          {loading ? "Transferring..." : "Transfer Token"}
        </Button>
      </Box>
    </Container>
  );
};

export default TransferToken;