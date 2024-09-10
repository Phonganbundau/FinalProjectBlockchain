

/*import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Container, TextField, Button, Box, Typography, Grid } from "@mui/material";
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json"; 

const RentProperty = () => {
  const [tokenId, setTokenId] = useState(""); // Người thuê nhập Token ID
  const [startDateTime, setStartDateTime] = useState(""); // Thời gian bắt đầu thuê
  const [endDateTime, setEndDateTime] = useState(""); // Thời gian kết thúc thuê
  const [rentPerDay, setRentPerDay] = useState(0); // Giá thuê mỗi ngày
  const [totalRent, setTotalRent] = useState(0); // Tổng số tiền cần trả
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

  // Hàm lấy giá thuê mỗi ngày
  const fetchRentPerDay = async (tokenId) => {
    if (contract) {
      const price = await contract.methods.leasePeriods(tokenId).call();
      setRentPerDay(Web3.utils.fromWei(price.pricePerDay, 'ether')); // Chuyển đổi từ Wei sang ETH
    }
  };

  // Tính toán tổng số tiền thuê dựa trên số ngày thuê
  const calculateTotalRent = () => {
    const startTimeUnix = Math.floor(new Date(startDateTime).getTime() / 1000);
    const endTimeUnix = Math.floor(new Date(endDateTime).getTime() / 1000);

    const numberOfDays = Math.floor((endTimeUnix - startTimeUnix) / (60 * 60 * 24)); // Tính số ngày
    const total = numberOfDays * rentPerDay;
    setTotalRent(total);
  };

  useEffect(() => {
    if (tokenId && startDateTime && endDateTime) {
      fetchRentPerDay(tokenId); // Lấy giá thuê mỗi ngày khi nhập tokenId
      calculateTotalRent(); // Tính toán tổng số tiền thuê khi có đầy đủ thông tin
    }
  }, [tokenId, startDateTime, endDateTime]);

  const rentProperty = async () => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }
  
    try {
      const startTimeUnix = Math.floor(new Date(startDateTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endDateTime).getTime() / 1000);
      const rentInWei = Web3.utils.toWei(totalRent.toString(), 'ether'); // Chuyển đổi từ ETH sang Wei
  
      await contract.methods.rentToken(tokenId, startTimeUnix, endTimeUnix).send({
        from: account,
        value: rentInWei,
        gas: 500000
      });
      alert("Property rented successfully!");
    } catch (error) {
      console.error("Error renting property:", error);
      alert("Error during the rental process. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Rent a Property
      </Typography>
      <Typography variant="body1" gutterBottom>
        Connected account: {account || "Not connected"}
      </Typography>

      <Box>
        <Typography variant="h5" gutterBottom>
          Enter Property Token ID, Rental Period, and Payment
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
            <Typography variant="body1">Rent per day: {rentPerDay} ETH</Typography>
            <Typography variant="body1">Total Rent: {totalRent} ETH</Typography>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={rentProperty}
          sx={{ mt: 2 }}
        >
          Rent Property
        </Button>
      </Box>
    </Container>
  );
};

export default RentProperty;

*/

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Container, TextField, Button, Box, Typography, Grid } from "@mui/material";
import { useLocation } from "react-router-dom"; // Sử dụng useLocation để lấy dữ liệu truyền vào
import TimeLimitedOwnership from "../contracts/TimeLimitedOwnership.json"; 

const RentProperty = () => {
  const { state } = useLocation(); // Lấy tokenId từ state khi navigate từ AllTokensList
  const [tokenId, setTokenId] = useState(state?.tokenId || ""); // Nếu có tokenId từ state, đặt mặc định vào
  const [startDateTime, setStartDateTime] = useState(""); // Thời gian bắt đầu thuê
  const [endDateTime, setEndDateTime] = useState(""); // Thời gian kết thúc thuê
  const [rentPerDay, setRentPerDay] = useState(0); // Giá thuê mỗi ngày
  const [totalRent, setTotalRent] = useState(0); // Tổng số tiền cần trả
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

  // Hàm lấy giá thuê mỗi ngày
  const fetchRentPerDay = async (tokenId) => {
    if (contract) {
      const price = await contract.methods.leasePeriods(tokenId).call();
      setRentPerDay(Web3.utils.fromWei(price.pricePerDay, 'ether')); // Chuyển đổi từ Wei sang ETH
    }
  };

  // Tính toán tổng số tiền thuê dựa trên số ngày thuê
  const calculateTotalRent = () => {
    const startTimeUnix = Math.floor(new Date(startDateTime).getTime() / 1000);
    const endTimeUnix = Math.floor(new Date(endDateTime).getTime() / 1000);

    const numberOfDays = Math.floor((endTimeUnix - startTimeUnix) / (60 * 60 * 24)); // Tính số ngày
    const total = numberOfDays * rentPerDay;
    setTotalRent(total);
  };

  useEffect(() => {
    if (tokenId && startDateTime && endDateTime) {
      fetchRentPerDay(tokenId); // Lấy giá thuê mỗi ngày khi nhập tokenId
      calculateTotalRent(); // Tính toán tổng số tiền thuê khi có đầy đủ thông tin
    }
  }, [tokenId, startDateTime, endDateTime]);

  const rentProperty = async () => {
    if (!contract || !account) {
      alert("Please connect your wallet.");
      return;
    }
  
    try {
      const startTimeUnix = Math.floor(new Date(startDateTime).getTime() / 1000);
      const endTimeUnix = Math.floor(new Date(endDateTime).getTime() / 1000);
      const rentInWei = Web3.utils.toWei(totalRent.toString(), 'ether'); // Chuyển đổi từ ETH sang Wei
  
      await contract.methods.rentToken(tokenId, startTimeUnix, endTimeUnix).send({
        from: account,
        value: rentInWei,
        gas: 500000
      });
      alert("Property rented successfully!");
    } catch (error) {
      console.error("Error renting property:", error);
      alert("Error during the rental process. Please try again.");
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
  Rent A Property
  </Typography>

      <Box sx={{ mt: 4, p: 3, borderRadius: 4, boxShadow: 3, backgroundColor: "#f9f9f9" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Token ID"
              variant="outlined"
              fullWidth
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)} // Người dùng có thể sửa nếu cần
              sx={{ mb: 2 }} // Thêm khoảng cách dưới trường nhập liệu
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
              sx={{ mb: 2 }} // Thêm khoảng cách dưới trường nhập liệu
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
              sx={{ mb: 2 }} // Thêm khoảng cách dưới trường nhập liệu
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Rent per day: <strong>{rentPerDay}</strong> ETH
            </Typography>
            <Typography variant="body1">
              Total Rent: <strong>{totalRent}</strong> ETH
            </Typography>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={rentProperty}
          sx={{ mt: 3, borderRadius: 3, backgroundColor: '#6200ea', textTransform: 'none' }}
        >
          Rent Property
        </Button>
      </Box>
    </Container>
  );
};

export default RentProperty;