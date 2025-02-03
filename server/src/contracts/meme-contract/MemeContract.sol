// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MemeContract is ERC20, Ownable {
    uint256 public constant TOKEN_PRICE = 0.001 ether;
    address public platformWallet;

    struct Meme {
        address creator;
        bool isAvailable;
    }

    mapping(string => Meme) public memes;
    string[] private memeList; 
    string[] public winnerMemes;
    mapping(string => uint256) public totalStaked;
    mapping(string => mapping(address => uint256)) public stakes;
    mapping(string => mapping(address => bool)) public isStaker;
    mapping(string => address[]) private stakers;

    event MemeSubmitted(string cid, address creator);
    event TokensStaked(string cid, address staker, uint256 amount);
    event WinnerDeclared(string cid, address winner);

    constructor(address initialOwner, address _platformWallet)
        ERC20("MemeToken", "MTK")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1000000 * 10 ** decimals());
        platformWallet = _platformWallet;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 amountToBuy = (msg.value / TOKEN_PRICE) * 10**decimals();
        require(balanceOf(owner()) >= amountToBuy, "Not enough tokens in contract");
        _transfer(owner(), msg.sender, amountToBuy);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function submitMeme(string memory _cid, address _creator) public onlyOwner {
        require(memes[_cid].creator == address(0), "Meme already exists");
        memes[_cid] = Meme(_creator, true);
        memeList.push(_cid);
        totalStaked[_cid] = 0;
        emit MemeSubmitted(_cid, _creator);
    }

    function stakeTokens(string memory _cid, uint256 _amount) public {
        require(balanceOf(msg.sender) >= _amount, "Insufficient token balance");
        require(allowance(msg.sender, address(this)) >= _amount, "Approve contract first");
        require(memes[_cid].isAvailable, "Meme is no longer available for staking");
        require(stakes[_cid][msg.sender] == 0, "You have already staked on this meme");

        _transfer(msg.sender, address(this), _amount);
        stakes[_cid][msg.sender] = _amount;
        totalStaked[_cid] += _amount;

        if (!isStaker[_cid][msg.sender]) {
            stakers[_cid].push(msg.sender);
            isStaker[_cid][msg.sender] = true;
        }

        emit TokensStaked(_cid, msg.sender, _amount);
    }

    function declareWinner(string memory _cid) public onlyOwner {
        require(memes[_cid].isAvailable, "This meme is no longer available");
        require(totalStaked[_cid] > 0, "No stakes on this meme");

        memes[_cid].isAvailable = false;
        winnerMemes.push(_cid);

        address winner = memes[_cid].creator;
        uint256 creatorReward = (totalStaked[_cid] * 70) / 100;
        uint256 voterReward = (totalStaked[_cid] * 20) / 100;
        uint256 platformReward = (totalStaked[_cid] * 10) / 100;

        _transfer(address(this), winner, creatorReward);
        distributeToVoters(_cid, voterReward);
        _transfer(address(this), platformWallet, platformReward);

        for (uint i = 0; i < memeList.length; i++) {
            string memory memeCid = memeList[i];
            if (memes[memeCid].isAvailable) {
                totalStaked[memeCid] = 0;
            }
        }

        emit WinnerDeclared(_cid, winner);
    }

    function distributeToVoters(string memory _cid, uint256 _rewardPool) private {
        require(totalStaked[_cid] > 0, "No stakes to distribute");
        for (uint i = 0; i < stakers[_cid].length; i++) {
            address staker = stakers[_cid][i];
            uint256 originalStake = stakes[_cid][staker];
            uint256 voterReward = (_rewardPool * originalStake) / totalStaked[_cid];
            _transfer(address(this), staker, originalStake + voterReward);
        }
    }
}
