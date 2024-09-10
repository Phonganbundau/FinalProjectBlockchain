// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLimitedOwnership is ERC721Enumerable, Ownable {
    struct LeasePeriod {
        uint256 startTime;
        uint256 endTime;
        uint256 pricePerDay; // Giá thuê mỗi ngày
    }

    mapping(uint256 => LeasePeriod) public leasePeriods;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public originalOwner; // Thêm mapping để lưu chủ sở hữu ban đầu của token

    constructor() ERC721("TimeLimitedOwnership", "TLO") {}

    // Mint token chỉ với thông tin metadata và đặt giá thuê mỗi ngày
    function mint(address to, uint256 tokenId, string memory tokenURI, uint256 pricePerDay) public{
        require(!_exists(tokenId), "Token already exists.");
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI); // Lưu metadata của token

        // Lưu chủ sở hữu ban đầu khi mint token
        originalOwner[tokenId] = to;

        // Đặt giá thuê mặc định theo ngày
        leasePeriods[tokenId] = LeasePeriod(0, 0, pricePerDay);
    }

    // Hàm lấy chủ sở hữu ban đầu của token
    function getOriginalOwner(uint256 tokenId) public view returns (address) {
        return originalOwner[tokenId];
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

    // Hàm lấy danh sách toàn bộ token
    function getAllTokens() public view returns (uint256[] memory) {
        uint256 totalTokens = totalSupply();
        uint256[] memory tokens = new uint256[](totalTokens);
        
        for (uint256 i = 0; i < totalTokens; i++) {
            tokens[i] = tokenByIndex(i);  // Lấy tokenId tại index i
        }
        
        return tokens;
    }

    // Người thuê gọi hàm này để thuê token với thời gian sở hữu giới hạn và thanh toán theo ngày
    function rentToken(uint256 tokenId, uint256 _startTime, uint256 _endTime) public payable {
        require(ownerOf(tokenId) != msg.sender, "You are already the owner of this token.");
        require(_startTime < _endTime, "Start time must be before end time.");
        require(block.timestamp <= _startTime, "Start time is in the past.");

        // Tính số ngày thuê
        uint256 numberOfDays = (_endTime - _startTime) / 1 days; // Sử dụng 1 days để tính số ngày
        require(numberOfDays > 0, "The rental period must be at least one day.");

        // Tính toán số tiền phải trả
        uint256 totalPrice = numberOfDays * leasePeriods[tokenId].pricePerDay;
        require(msg.value >= totalPrice, "Insufficient payment for rent.");

        // Lưu thông tin thời gian thuê
        leasePeriods[tokenId] = LeasePeriod(_startTime, _endTime, leasePeriods[tokenId].pricePerDay);

        // Chuyển token từ chủ sở hữu hiện tại sang người thuê
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, msg.sender, tokenId);

        // Thanh toán tiền thuê cho chủ sở hữu
        address owner = originalOwner[tokenId];
        payable(owner).transfer(msg.value);
    }

    // Người thuê có thể chuyển nhượng quyền thuê cho người khác trong thời gian thuê
    function transferDuringLeasePeriod(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Only the current tenant can transfer the token.");
        require(block.timestamp < leasePeriods[tokenId].endTime, "Lease period has ended.");
        
        // Chuyển token cho người nhận mới
        _transfer(msg.sender, to, tokenId);
    }

    // Đặt giá thuê mỗi ngày cho tài sản
    function setRentPricePerDay(uint256 tokenId, uint256 pricePerDay) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can set the rent price.");
        leasePeriods[tokenId].pricePerDay = pricePerDay;
    }

    // Hàm thu hồi token sau khi hết hạn thuê
    function reclaimToken(uint256 tokenId) public {
        require(block.timestamp > leasePeriods[tokenId].endTime, "Lease period has not ended yet.");
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, originalOwner[tokenId], tokenId);  // Chuyển token về chủ sở hữu ban đầu sau khi hết hạn
    }

    // Gia hạn thời gian thuê
    function extendLease(uint256 tokenId, uint256 newEndTime) public payable {
        require(ownerOf(tokenId) == msg.sender, "Only the current tenant can extend the lease.");
        require(newEndTime > leasePeriods[tokenId].endTime, "New end time must be later than the current end time.");

        uint256 additionalDays = (newEndTime - leasePeriods[tokenId].endTime) / 1 days;
        uint256 additionalPrice = additionalDays * leasePeriods[tokenId].pricePerDay;

        require(msg.value >= additionalPrice, "Insufficient payment for extending lease.");

        // Cập nhật thời gian thuê
        leasePeriods[tokenId].endTime = newEndTime;

        // Thanh toán tiền gia hạn thuê cho chủ sở hữu
        address owner = ownerOf(tokenId);
        payable(owner).transfer(msg.value);
    }
}
