// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";


contract Token is ERC20, Ownable,Pausable {
    using SafeMath for uint256;

    string public tokenName;
    string public tokenSymbol;
    uint256 public tokenTotalSupply;
    uint256 public tokenPrice;
    address public companyWallet;
    address public thirdPartyWallet;
    uint256 public startDate;
    uint256 public endDate;
    string public RedemptionType;
    uint256 public yield;
    string public actionType;
    uint256 public investorsCount;
    address[] private tokenHolders;

    mapping(address => bool) public votingRights;
    mapping(address => bool) public isInvestor;
    mapping(address => uint256) public revenueShare; // New mapping to track revenue shares
    mapping(address => uint256) public debtBalance; // New mapping to track debt balances
    mapping(address => uint256) public dividendBalance; // New mapping to track dividend balances

    event RevenueDistributed(address indexed investor, uint256 amount);
    event InterestPaid(address indexed investor, uint256 amount);
    event DividendPaid(address indexed investor, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _tokenPrice,
        address _companyWallet,
        address _thirdPartyWallet,
        uint256 _campaignStartDate,
        uint256 _campaignEndDate,
        string memory _RedemptionType,
        uint256 _yield,
        string memory _actionType
    ) ERC20(_name, _symbol) {
        tokenName = _name;
        tokenSymbol = _symbol;
        tokenTotalSupply = _totalSupply;
        tokenPrice = _tokenPrice;
        companyWallet = _companyWallet;
        thirdPartyWallet = _thirdPartyWallet;
        RedemptionType = _RedemptionType;
        yield = _yield;
        startDate = _campaignStartDate;
        endDate = _campaignEndDate;
        actionType = _actionType;

        _mint(_thirdPartyWallet, _totalSupply);
        isInvestor[_thirdPartyWallet] = true;
        tokenHolders.push(_thirdPartyWallet);
    }

    // modifier onlyOwner() {
    //     require(msg.sender == thirdPartyWallet, "Only the owner can call this function.");
    //     _;
    // }

    modifier duringCampaign() {
        require(block.timestamp >= startDate && block.timestamp <= endDate, "Campaign is not active.");
        _;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance.");

        _transfer(msg.sender, to, amount);

        if (!isInvestor[to]) {
            isInvestor[to] = true;
            investorsCount++;
            tokenHolders.push(to);
        }

        return true;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(balanceOf(from) >= amount, "Insufficient balance.");
        require(allowance(from, msg.sender) >= amount, "Allowance exceeded.");

        _transfer(from, to, amount);
        _approve(from, msg.sender, allowance(from, msg.sender).sub(amount));

        if (!isInvestor[to]) {
            isInvestor[to] = true;
            investorsCount++;
            tokenHolders.push(to);
        }

        return true;
    }

    function setVotingRights(address[] calldata addresses, bool hasVotingRights) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            votingRights[addresses[i]] = hasVotingRights;
        }
    }

    // function calculateDividend(address investor) public view returns (uint256) {
    //     require(isInvestor[investor], "Address is not an investor.");

    //     uint256 investorBalance = balanceOf(investor);

    //     bytes memory dividendTypeBytes = bytes(RedemptionType);
    //     bytes memory yearlyBytes = bytes("yearly");
    //     bytes memory monthlyBytes = bytes("monthly");
    //     bytes memory quarterBytes = bytes("quarterly");

    //     if (dividendTypeBytes.length == yearlyBytes.length) {
    //         bool isYearly = true;

    //         for (uint256 i = 0; i < dividendTypeBytes.length; i++) {
    //             if (dividendTypeBytes[i] != yearlyBytes[i]) {
    //                 isYearly = false;
    //                 break;
    //             }
    //         }

    //         if (isYearly && block.timestamp > endDate + 31556926) {
    //             return investorBalance.mul(yield).div(100);
    //         }
    //     }

    //     if (dividendTypeBytes.length == monthlyBytes.length) {
    //         bool isMonthly = true;

    //         for (uint256 i = 0; i < dividendTypeBytes.length; i++) {
    //             if (dividendTypeBytes[i] != monthlyBytes[i]) {
    //                 isMonthly = false;
    //                 break;
    //             }
    //         }

    //         if (isMonthly && block.timestamp > endDate + 2629743) {
    //             return investorBalance.mul(yield).div(1200);
    //         }
    //     }

    //     if (dividendTypeBytes.length == quarterBytes.length) {
    //         bool isQuarterly = true;

    //         for (uint256 i = 0; i < dividendTypeBytes.length; i++) {
    //             if (dividendTypeBytes[i] != quarterBytes[i]) {
    //                 isQuarterly = false;
    //                 break;
    //             }
    //         }

    //         if (isQuarterly && block.timestamp > endDate + 7889229) {
    //             return investorBalance.mul(yield).div(300);
    //         }
    //     }

    //     return 0;
    // }

    function investorBalance(address investor) public view returns (uint256) {
        require(isInvestor[investor], "Address is not an investor.");
        return balanceOf(investor);
    }

    function getMinInvest() public view returns (uint256) {
        return tokenPrice;
    }

    function getMaxInvest() public view returns (uint256) {
        uint256 maxInvest = tokenPrice.mul(totalSupply());
        return maxInvest;
    }

    function distributeRevenueYearly(uint256 _revenue) external onlyOwner {
        require(keccak256(bytes(actionType)) == keccak256(bytes("revenue sharing")), "revenue sharing can only be paid for debt tokens.");
        require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Yearly")), "revenue sharing can only be paid Yearly.");    
        require(block.timestamp > endDate + 31556926,"You can use this function after 1 year of End date of campagin");

        require(_revenue > 0, "Revenue should be greater than zero");

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            address investor = tokenHolders[i];
            uint256 share = (_revenue * balanceOf(investor)) / totalSupply();
            revenueShare[investor] += share;

            emit RevenueDistributed(investor, share);
        }
    }
        function distributeRevenueMonthly(uint256 _revenue) external onlyOwner {
        require(keccak256(bytes(actionType)) == keccak256(bytes("revenue sharing")), "revenue sharing can only be paid for debt tokens.");
        require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Monthly")), "revenue sharing can only be paid Monthly.");    
        require(block.timestamp > endDate + 2629743,"You can use this function after 1 Month of End date of campagin");
        require(_revenue > 0, "Revenue should be greater than zero");

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            address investor = tokenHolders[i];
            uint256 share = (_revenue * balanceOf(investor)) / totalSupply();
            revenueShare[investor] += share;

            emit RevenueDistributed(investor, share);
        }
    }
        function distributeRevenueQuarterly(uint256 _revenue) external onlyOwner{
        require(keccak256(bytes(actionType)) == keccak256(bytes("revenue sharing")), "revenue can only be paid for revenue sharing tokens.");
        require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Quarterly")), "revenue sharing can only be paid Quarterly.");    
        require( block.timestamp > endDate + 7889229,"You can use this function after Quarter of End date of campagin");
        require(_revenue > 0, "Revenue should be greater than zero");

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            address investor = tokenHolders[i];
            uint256 share = (_revenue * balanceOf(investor)) / totalSupply();
            revenueShare[investor] += share;

            emit RevenueDistributed(investor, share);
        }
    }

function payInterestYearly( uint256 interestRatio) external onlyOwner {
    require(keccak256(bytes(actionType)) == keccak256(bytes("debt")), "Interest can only be paid for debt tokens.");
    require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Yearly")), "Interest can only be paid Yearly.");

    require(interestRatio > 0, "Interest rate should be greater than zero.");
    require(interestRatio <100, "Interest rate should be greater than zero.");
    require(block.timestamp > endDate + 31556926,"You can use this function after 1 year of End date of campagin");
    for (uint256 i = 0; i < tokenHolders.length; i++) {
        address investor = tokenHolders[i];
        uint256 share = (interestRatio * balanceOf(investor)) / 100;
        debtBalance[investor] += share;

        emit InterestPaid(investor, interestRatio);
    }
}
function payInterestMonthly( uint256 interestRatio) external onlyOwner {
    require(keccak256(bytes(actionType)) == keccak256(bytes("debt")), "Interest can only be paid for debt tokens.");
    require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Monthly")), "Interest can only be paid Monthly.");

    require(interestRatio > 0, "Interest rate should be greater than zero.");
    require(interestRatio <100, "Interest rate should be greater than zero.");
    require(block.timestamp > endDate + 2629743,"You can use this function after 1 Month of End date of campagin");

    for (uint256 i = 0; i < tokenHolders.length; i++) {
        address investor = tokenHolders[i];
        uint256 share = (interestRatio * balanceOf(investor)) / 1200;
        debtBalance[investor] += share;

        emit InterestPaid(investor, interestRatio);
    }
}
function payInterestQuarterly( uint256 interestRatio) external onlyOwner {
    require(keccak256(bytes(actionType)) == keccak256(bytes("debt")), "Interest can only be paid for debt tokens.");
    require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Quarterly")), "Interest can only be paid Quarterly.");

    require(interestRatio > 0, "Interest rate should be greater than zero.");
    require(interestRatio <100, "Interest rate should be greater than zero.");
    require( block.timestamp > endDate + 7889229,"You can use this function after Quarter of End date of campagin");

    for (uint256 i = 0; i < tokenHolders.length; i++) {
        address investor = tokenHolders[i];
        uint256 share = (interestRatio * balanceOf(investor)) / 300;
        debtBalance[investor] += share;

        emit InterestPaid(investor, interestRatio);
    }
}


    function payDividendYearly(uint256 amount) external onlyOwner {
    require(keccak256(bytes(actionType)) == keccak256(bytes("share")), "Dividend can only be paid for share tokens.");
    require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Yearly")), "Dividend can only be paid Yearly.");
    require(block.timestamp > endDate + 31556926,"You can use this function after 1 year of End date of campagin");

        require(amount > 0, "Dividend amount should be greater than zero.");

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            address investor = tokenHolders[i];
            uint256 share = (amount * balanceOf(investor)) / totalSupply();
        dividendBalance[investor] += share;

        emit DividendPaid(investor, amount);
    }
}
    function payDividendMonthly(uint256 amount) external onlyOwner {
    require(keccak256(bytes(actionType)) == keccak256(bytes("share")), "Dividend can only be paid for share tokens.");
    require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Monthly")), "Dividend can only be paid Yearly.");
    require(block.timestamp > endDate + 2629743,"You can use this function after 1 Month of End date of campagin");

        require(amount > 0, "Dividend amount should be greater than zero.");

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            address investor = tokenHolders[i];
            uint256 share = (amount * balanceOf(investor)) /(12*totalSupply());
        dividendBalance[investor] += share;

        emit DividendPaid(investor, amount);
    }
}
    function payDividendQuarterly(uint256 amount) external onlyOwner {
    require(keccak256(bytes(actionType)) == keccak256(bytes("share")), "Dividend can only be paid for share tokens.");
    require(keccak256(bytes(RedemptionType)) == keccak256(bytes("Quarterly")), "Dividend can only be paid Yearly.");
    require( block.timestamp > endDate + 7889229,"You can use this function after Quarter of End date of campagin");

        require(amount > 0, "Dividend amount should be greater than zero.");

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            address investor = tokenHolders[i];
            uint256 share = (amount * balanceOf(investor)) / (3*totalSupply());
        dividendBalance[investor] += share;

        emit DividendPaid(investor, amount);
    }
}
}
