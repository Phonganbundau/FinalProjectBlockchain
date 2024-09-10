import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { Container, TextField, Button, Box, Typography, Grid } from "@mui/material";

import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json"; 

const CreateToken = () => {
  const [address, setAddress] = useState("");    // Địa chỉ bất động sản
  const [area, setArea] = useState("");          // Diện tích bất động sản
  const [rooms, setRooms] = useState("");        // Số phòng của bất động sản
  const [pricePerDay, setPricePerDay] = useState(""); // Giá thuê mỗi ngày
  const [imageFile, setImageFile] = useState(null);  // Hình ảnh bất động sản
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

  // Upload hình ảnh lên Pinata IPFS
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

  // Upload metadata lên IPFS
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

  // Mint token với thông tin bất động sản, metadata, và giá thuê mỗi ngày
  const mintToken = async (tokenURI) => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const pricePerDayInWei = Web3.utils.toWei(pricePerDay, 'ether'); // Chuyển đổi từ ETH sang Wei

      // Gọi hàm mint với giá thuê theo ngày
      await contract.methods.mint(account, new Date().getTime(), tokenURI, pricePerDayInWei).send({ from: account });
      alert("Token minted successfully!");
    } catch (error) {
      console.error("Error minting token:", error);
    }
  };

  // Xử lý quy trình tạo token
  const handleMint = async () => {
    try {
      const imageURL = await uploadImageToIPFS(imageFile);  // Upload hình ảnh lên IPFS
      const metadata = createMetadata(imageURL);            // Tạo metadata JSON từ thông tin bất động sản và URL hình ảnh
      const tokenURI = await uploadMetadataToIPFS(metadata);  // Tải metadata lên IPFS và lấy tokenURI
      await mintToken(tokenURI);  // Gọi hàm mint token
    } catch (error) {
      console.error("Error in minting process:", error);
      alert("Error during the minting process. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="body1" gutterBottom>
        Connected account: {account || "Not connected"}
      </Typography>
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
  Mint a New Property Token
  </Typography>
  

      <Box sx={{ mt: 4, p: 3, borderRadius: 4, boxShadow: 3, backgroundColor: "#f9f9f9" }}>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Property Address"
              variant="outlined"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ mb: 2 }} // Thêm khoảng cách phía dưới
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Area (m2)"
              variant="outlined"
              fullWidth
              value={area}
              onChange={(e) => setArea(e.target.value)}
              sx={{ mb: 2 }} // Thêm khoảng cách phía dưới
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Number of Rooms"
              variant="outlined"
              fullWidth
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              sx={{ mb: 2 }} // Thêm khoảng cách phía dưới
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Price Per Day (ETH)"
              variant="outlined"
              fullWidth
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}  // Nhập giá thuê mỗi ngày
              sx={{ mb: 2 }} // Thêm khoảng cách phía dưới
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ borderRadius: 3, borderColor: "#6200ea", color: "#6200ea", mb: 2 }}
            >
              Upload Property Image
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
          sx={{ mt: 3, borderRadius: 3, backgroundColor: '#6200ea', textTransform: 'none' }}
        >
          Mint Property Token
        </Button>
      </Box>
    </Container>
  );
};

export default CreateToken;
