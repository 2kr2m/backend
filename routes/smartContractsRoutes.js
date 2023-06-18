import solc from 'solc';
import fs from 'fs';
import Web3 from 'web3';
import express from 'express';
import dotenv from "dotenv";

dotenv.config();
const contractRouter = express.Router()

const blockchainURI=process.env.BOCKCHAIN_URI;
// console.log(blockchainURI);
// 'http://172.21.0.3:8545'
const web3 =new Web3(new Web3.providers.HttpProvider("http://blockchain.docker.local"));
const file = fs.readFileSync("initial.sol").toString();

const input = {
    language: 'Solidity',
    sources: {
      'initial.sol': {
        content: file
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contractABI = output.contracts['initial.sol']['initial'].abi;
  const contractBytecode = output.contracts['initial.sol']['initial'].evm.bytecode.object;

//set Default Account
// contractRouter.post('/setDefaultAccount', async (req,res) => {
//   const {account,password}=req.body;
//   const accounts = await web3.eth.getAccounts();
//   const a=accounts.find(u => u === account);
//   if(a){
//     await web3.eth.personal.unlockAccount(account, password , 1600);
//     web3.eth.defaultAccount = account;
//     console.log(web3.eth.defaultAccount);
//     res.json('default account have been set')
//   }else{
//     res.json('account not found')
//   }

// });


//Deploy Contract
contractRouter.post('/deploy-contract', async (req, res) => {
  const {account,password}=req.body;
 
  const accounts = await web3.eth.getAccounts();
  const a=accounts.find(u => u === account);
 
  if(a){
    
    try {
      const contract = new web3.eth.Contract(contractABI);
      await web3.eth.personal.unlockAccount(account, password , 1600);
      
      contract.deploy({
        data: contractBytecode
      }).send({
        from: account,
        gas: 10000000,
        gasPrice: 0
      }).on('receipt', (receipt) => {
         res.json({
           receipt
          });
      });

    } catch (err) {
      console.error(err);
      res.status(500).send('Error deploying contract');
    }

  }else{
    res.status(400).send('account doesnt exist');
  }

});



//create new account
contractRouter.post("/createAccount",async (req,res)=>{
  const {password} = req.body;
  await web3.eth.personal.newAccount(password, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.status(201).json(result);
    }
  });
});

//Get transaction details
contractRouter.get("/trxDetails", async(req,res)=> {
   const {hash} = req.body;
   try {
     const transaction = await web3.eth.getTransaction(hash);
       if (transaction) {
         res.status(200).json({
           status: "success",
           transaction,
         });
        } else {
           res.status(404).json({
             status: "error",
             message: "Transaction not found",
            });
          }
    } catch (error) {
       res.status(500).json({
         status: "error",
          message: "Server error",
        });
      }});

//get list accounts
contractRouter.get('/getListAccounts', async (req, res) => {
     try {
       const accounts = await web3.eth.getAccounts();
       const accountBalances = await Promise.all(accounts.map(async (account) => {
          const balance = await web3.eth.getBalance(account);
          const balanceInEth = web3.utils.fromWei(balance, 'ether');
          return {
            account,
            balance: balanceInEth
          };
        }));
       res.status(200).json(accountBalances);
    } catch (err) {
       console.error(err);
       res.status(500).send('Error getting accounts list');
      }});
export default contractRouter;