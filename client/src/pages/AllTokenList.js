

import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Card, CardContent, CardMedia, CircularProgress, Button, Box } from "@mui/material";
import Grid2 from '@mui/material/Grid2';
import BedIcon from '@mui/icons-material/Bed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import PlaceIcon from '@mui/icons-material/Place';
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json";

const AllTokensList = () => {
  const [contract, setContract] = useState(null);
  const [tokens, setTokens] = useState([]); // State để lưu các token và metadata
  const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái tải
  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = TimeLimitedOwnership.networks[networkId];

          if (deployedNetwork && deployedNetwork.address) {
            const contractInstance = new web3.eth.Contract(
              TimeLimitedOwnership.abi,
              deployedNetwork.address
            );
            setContract(contractInstance);
            await fetchAllTokens(contractInstance); // Đảm bảo fetchAllTokens hoàn thành trước khi tiếp tục
          } else {
            alert("Contract not deployed on the current network.");
          }
        } catch (error) {
          console.error("Error connecting to contract:", error);
        }
      } else {
        alert("Please install MetaMask to use this app.");
      }
    };

    initContract();
  }, []);

  // Hàm lấy danh sách tất cả token và metadata
  const fetchAllTokens = async (contract) => {
    try {
      const tokenIds = await contract.methods.getAllTokens().call();
      const tokenData = [];

      for (let i = 0; i < tokenIds.length; i++) {
        const tokenId = tokenIds[i].toString(); // Chuyển đổi BigInt thành chuỗi
        const tokenURI = await contract.methods.tokenURI(tokenId).call();
        
        // Lấy dữ liệu metadata từ IPFS
        const metadata = await axios.get(tokenURI);

        // Lấy giá thuê mỗi ngày từ hợp đồng
        const pricePerDay = await contract.methods.leasePeriods(tokenId).call();
        const priceInEth = Web3.utils.fromWei(pricePerDay.pricePerDay, 'ether'); // Chuyển từ Wei sang ETH

        tokenData.push({
          tokenId,  // Lưu tokenId đã chuyển thành chuỗi vào đối tượng token
          ...metadata.data, // Trộn metadata từ IPFS vào object token
          pricePerDay: priceInEth // Giá thuê mỗi ngày
        });
      }
  
      setTokens(tokenData); // Lưu các token và metadata vào state
      setLoading(false);    // Dừng trạng thái loading khi dữ liệu đã tải xong
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setLoading(false);    // Dừng trạng thái loading ngay cả khi có lỗi
    }
  };

  // Hàm xử lý khi người dùng click vào nút "Rent Now"
  const handleRentClick = (tokenId) => {
    navigate(`/rent`, { state: { tokenId } }); // Điều hướng đến RentProperty với tokenId đã chọn
  };



  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
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
    All Tokens Available for Rent
  </Typography>
  

      {loading ? (
        <CircularProgress /> // Hiển thị vòng tròn tải khi đang tải dữ liệu
      ) : tokens.length === 0 ? (
        <Typography variant="h6">No tokens found.</Typography> // Hiển thị khi không có token nào
      ) : (
        <Grid2 container spacing={3}>
          {tokens.map((token) => (
            <Grid2 item xs={12} sm={6} md={4} key={token.tokenId}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={token.image} // Hình ảnh từ metadata
                  alt={token.name}
                />
                <CardContent sx={{ paddingBottom: '16px' }}>
  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold'}}>
    House for rent 
    </Typography>
    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold', color: '#6200ea' }}>
    {token.pricePerDay} ETH/day
  </Typography>
  
  </Box>

  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
    <PlaceIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
    {token.attributes.find(attr => attr.trait_type === "Địa chỉ").value}
  </Typography>

  <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
    <Typography variant="body2" color="textSecondary">
      <BedIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
      {token.attributes.find(attr => attr.trait_type === "Số phòng").value} Rooms
    </Typography>
    <Typography variant="body2" color="textSecondary">
      <SquareFootIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
      {token.attributes.find(attr => attr.trait_type === "Diện tích (m2)").value} m²
    </Typography>
  </Box>

  <Button
    variant="contained"
    color="primary"
    fullWidth
    onClick={() => handleRentClick(token.tokenId)} // Gọi hàm khi nhấn nút
    sx={{ mt: 1, borderRadius: 2, backgroundColor: '#6200ea', color: 'white', textTransform: 'none' }}
  >
    Rent Now
  </Button>
</CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Container>
  );
};

export default AllTokensList;