import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { Container, Typography, Grid, Card, CardContent, CardMedia, CircularProgress, Button, Box } from "@mui/material";
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json";
import Grid2 from '@mui/material/Grid2';
const TokenList = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [tokens, setTokens] = useState([]); // State để lưu các token và metadata
  const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái tải

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0].toLowerCase()); // Chuyển địa chỉ account thành chữ thường

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = TimeLimitedOwnership.networks[networkId];

          if (deployedNetwork && deployedNetwork.address) {
            const contractInstance = new web3.eth.Contract(
              TimeLimitedOwnership.abi,
              deployedNetwork.address
            );
            setContract(contractInstance);
            await fetchTokens(contractInstance, accounts[0]); // Đảm bảo fetchTokens hoàn thành trước khi tiếp tục
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

  // Hàm lấy danh sách token và metadata của người dùng
  const fetchTokens = async (contract, account) => {
    try {
      const balance = await contract.methods.balanceOf(account).call();
      const tokenData = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = (await contract.methods.tokenOfOwnerByIndex(account, i).call()).toString(); // Chuyển đổi BigInt thành chuỗi
        const tokenURI = await contract.methods.tokenURI(tokenId).call();
        
        // Lấy dữ liệu metadata từ IPFS
        const metadata = await axios.get(tokenURI);

        // Lấy thông tin về thời gian thuê từ hợp đồng
        const leasePeriod = await contract.methods.leasePeriods(tokenId).call();
        const currentTime = Math.floor(Date.now() / 1000); // Lấy thời gian hiện tại (Unix timestamp)

        // Lấy chủ sở hữu hiện tại của token
        const owner = (await contract.methods.ownerOf(tokenId).call()).toLowerCase(); // Chuyển thành chữ thường
        
        // Lấy chủ sở hữu thực sự
        const originalOwner = (await contract.methods.getOriginalOwner(tokenId).call()).toLowerCase(); 

        // Chuyển đổi rõ ràng giữa BigInt và Number trước khi thực hiện phép tính
        const endTime = Number(leasePeriod.endTime); // Chuyển đổi BigInt thành Number
        let timeRemaining = endTime - currentTime;

        // Nếu thời gian đã hết hạn
        if (timeRemaining <= 0) {
          timeRemaining = 0;
        }

        // Chuyển từ Wei sang ETH
        const pricePerDay = Web3.utils.fromWei(leasePeriod.pricePerDay.toString(), 'ether'); // Chuyển BigInt thành chuỗi

        tokenData.push({
          tokenId,  // Lưu tokenId đã chuyển thành chuỗi vào đối tượng token
          ...metadata.data, // Trộn metadata từ IPFS vào object token
          pricePerDay, // Giá thuê mỗi ngày
          timeRemaining, // Thời gian thuê còn lại
          startTime: Number(leasePeriod.startTime), // Chuyển đổi BigInt thành Number
          endTime, // Đã chuyển thành Number ở trên
          owner, // Lưu chủ sở hữu hiện tại
          originalOwner, // Lưu chủ sở hữu thực sự
        });
      }

      setTokens(tokenData); // Lưu các token và metadata vào state
      setLoading(false);    // Dừng trạng thái loading khi dữ liệu đã tải xong
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setLoading(false);    // Dừng trạng thái loading ngay cả khi có lỗi
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // Chuyển đổi từ Unix timestamp sang Date
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() trả về giá trị từ 0-11
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };
  
  // Hàm để chuyển đổi thời gian còn lại từ giây sang dạng ngày, giờ, phút, giây
  const formatTimeRemaining = (timeRemaining) => {
    const days = Math.floor(timeRemaining / (3600 * 24));
    const hours = Math.floor((timeRemaining % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Hàm thu hồi token nếu thời gian thuê đã hết
  const reclaimToken = async (tokenId) => {
    if (!contract) return;

    try {
      await contract.methods.reclaimToken(tokenId).send({ from: account });
      alert("Token reclaimed successfully!");
    } catch (error) {
      console.error("Error reclaiming token:", error);
      alert("Error reclaiming token. See console for details.");
    }
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
    My Tokens
  </Typography>
  
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : tokens.length === 0 ? (
        <Typography variant="h6" align="center">
          No tokens found.
        </Typography>
      ) : (
        <Grid2 container spacing={3}>
          {tokens.map((token) => (
            <Grid2 item xs={12} sm={6} key={token.tokenId}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={token.image} // Hình ảnh từ metadata
                  alt={token.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {token.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Địa chỉ: {token.attributes.find(attr => attr.trait_type === "Địa chỉ").value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Diện tích: {token.attributes.find(attr => attr.trait_type === "Diện tích (m2)").value} m²
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Số phòng: {token.attributes.find(attr => attr.trait_type === "Số phòng").value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Giá thuê mỗi ngày: {token.pricePerDay} ETH
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Token ID: {token.tokenId}
                  </Typography>

                  {/* Kiểm tra nếu người dùng hiện tại là chủ sở hữu thực sự */}
                  {token.originalOwner === account ? (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      You are the original owner of this token.
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Rent Period: from {formatTimestamp(token.startTime)} to {formatTimestamp(token.endTime)}
                    </Typography>
                      Time Remaining: {token.timeRemaining > 0 ? formatTimeRemaining(token.timeRemaining) : 'Lease Expired'}
                    </Typography>
                  )}

                  {/* Nút thu hồi token nếu hợp đồng thuê đã hết hạn và người dùng là chủ sở hữu thực sự */}
                  {token.originalOwner === account && token.timeRemaining === 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => reclaimToken(token.tokenId)}
                      sx={{ mt: 2, borderRadius: 3, backgroundColor: '#6200ea', textTransform: 'none' }}
                    >
                      Reclaim Token
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Container>
  );
};

export default TokenList;
