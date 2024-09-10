
import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { Container, TextField, Button, Box, Typography, Grid } from "@mui/material";
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json"; 

const Homepage = () => {
  const [tokenId, setTokenId] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [address, setAddress] = useState("");   
  const [area, setArea] = useState("");         
  const [rooms, setRooms] = useState("");       
  const [imageFile, setImageFile] = useState(null);  // Thay thế imageURL bằng file hình ảnh
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

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

  // Hàm tạo metadata JSON
  const createMetadata = (imageURL) => {
    const metadata = {
      name: `Bất động sản tại ${address}`,
      description: `Bất động sản có diện tích ${area} m2 với ${rooms} phòng.`,
      image: imageURL, // URL của hình ảnh sau khi upload lên IPFS
      attributes: [
        { trait_type: "Địa chỉ", value: address },
        { trait_type: "Diện tích (m2)", value: area },
        { trait_type: "Số phòng", value: rooms }
      ]
    };
    return metadata;
  };

  // Hàm upload hình ảnh lên Pinata IPFS
  const uploadImageToIPFS = async (file) => {
    const pinataApiKey = "ef15d387e2b04da8af0f";    
    const pinataSecretApiKey = "c40861fdc2dca6e9aa3b5db60cc27331966e811873e69cd6438d7f69e15c5f66"; 
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append("file", file);

    try {
      const response = await axios.post(url, data, {
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
          "Content-Type": "multipart/form-data"
        },
      });
      const imageURL = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      return imageURL;
    } catch (error) {
      console.error("Error uploading image to IPFS:", error);
      throw new Error("Could not upload image to IPFS");
    }
  };

  // Hàm upload metadata lên IPFS
  const uploadMetadataToIPFS = async (metadata) => {
    const pinataApiKey = "ef15d387e2b04da8af0f";    
    const pinataSecretApiKey = "c40861fdc2dca6e9aa3b5db60cc27331966e811873e69cd6438d7f69e15c5f66"; 
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    try {
      const response = await axios.post(url, metadata, {
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      return tokenURI;
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      throw new Error("Could not upload metadata to IPFS");
    }
  };

  // Hàm mint token sau khi có tokenURI
  const mintToken = async (tokenId, startDateTime, endDateTime, tokenURI) => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const startTimeUnix = Math.floor(new Date(startDateTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endDateTime).getTime() / 1000);
      await contract.methods.mint(account, tokenId, startTimeUnix, endTimeUnix, tokenURI).send({ from: account });
      alert("Token minted successfully!");
    } catch (error) {
      console.error("Error minting token:", error);
    }
  };

  // Xử lý quy trình tự động hóa khi nhấn nút Mint Token
  const handleMint = async () => {
    try {
      const imageURL = await uploadImageToIPFS(imageFile);  // Upload hình ảnh lên IPFS
      const metadata = createMetadata(imageURL);            // Tạo metadata JSON từ thông tin bất động sản và URL hình ảnh
      const tokenURI = await uploadMetadataToIPFS(metadata);  // Tải lên IPFS và lấy tokenURI
      await mintToken(tokenId, startDateTime, endDateTime, tokenURI);  // Gọi hàm mint token
    } catch (error) {
      console.error("Error in minting process:", error);
      alert("Error during the minting process. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Time-Limited Ownership NFT - Mint Token
      </Typography>
      <Typography variant="body1" gutterBottom>
        Connected account: {account || "Not connected"}
      </Typography>

      <Box>
        <Typography variant="h5" gutterBottom>
          Mint Token
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Token ID"
              variant="outlined"
              fullWidth
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Time"
              type="datetime-local"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Time"
              type="datetime-local"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              value={address}  
              onChange={(e) => setAddress(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Area (m2)"
              variant="outlined"
              fullWidth
              value={area}  
              onChange={(e) => setArea(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Rooms"
              variant="outlined"
              fullWidth
              value={rooms}  
              onChange={(e) => setRooms(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              fullWidth
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}  // Lưu file hình ảnh
              />
            </Button>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleMint}
          sx={{ mt: 2 }}
        >
          Mint Token
        </Button>
      </Box>
    </Container>
  );
};

export default Homepage;
