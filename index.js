const rpcUrl = "https://ropsten.infura.io/v3/68d671068abe4705bf8af8874836729a";
const web3 = new Web3(rpcUrl);

let account = "";
const PRIVATE_KEY_1 = "";

const contractAddress = "0x2664Bc06D5C2b112DB3239e35bfFA0e03572d0a1";
const abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "text",
        type: "string",
      },
      {
        internalType: "int256",
        name: "val",
        type: "int256",
      },
    ],
    name: "addTransaction",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getBalance",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getTransactions",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "text",
            type: "string",
          },
          {
            internalType: "int256",
            name: "amount",
            type: "int256",
          },
        ],
        internalType: "struct expenseTracker.transaction[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contract = new web3.eth.Contract(abi, contractAddress);
let transactionList;

setAccount = (value) => {
  if (value) {
    console.log(value);
    account = value;
    getAccountBalance();
    getTransactionsFromBlockchain();
    document.getElementById("account").disabled = true;
  }
  if (!PRIVATE_KEY_1) alert("Please set Private Key in file");
};

getAccountBalance = () => {
  if (account) {
    console.log(account);
    contract.methods.getBalance(account).call((err, balance) => {
      console.log("Balance:", balance > 0 ? "+" + balance : "-" + balance);
      document.getElementById("balance").innerHTML =
        balance > 0 ? "+" + balance : "-" + balance;
    });
  }
};

addToTransactionList = () => {
  let sign = "";
  let income = 0,
    expense = 0;
  document.getElementById("myUl").innerHTML = "";

  for (let txn in transactionList) {
    // console.log(txn);
    sign = transactionList[txn].amount < 0 ? "-" : "+";
    if (transactionList[txn].amount > 0)
      income += Number(transactionList[txn].amount);
    else expense += Number(transactionList[txn].amount);

    let listItem = document.createElement("li");
    let spanItem =
      transactionList[txn].text +
      " <span> " +
      sign +
      Math.abs(transactionList[txn].amount) +
      " </span>";
    listItem.innerHTML = spanItem;
    // console.log(listItem);
    document.getElementById("myUl").appendChild(listItem);
  }
  document.getElementById("income").innerHTML = "+" + income;
  document.getElementById("expense").innerHTML = expense;
  let bal = income + expense;
  document.getElementById("balance").innerHTML = bal > 0 ? "+" + bal : bal;
};

getTransactionsFromBlockchain = () => {
  contract.methods.getTransactions(account).call((err, transaction) => {
    if (err) {
      alert(err);
      console.log(err);
    }
    console.log("transactions:", transaction);
    transactionList = transaction;
    addToTransactionList();
  });
};

// Adding txn to ethereum blockchain
addTransaction = async (desc, amt) => {
  const data = contract.methods.addTransaction(desc, amt).encodeABI();
  const privateKey = buffer.Buffer.from(PRIVATE_KEY_1, "hex");

  console.log(data);
  web3.eth.getTransactionCount(account, (err, txCount) => {
    if (err) {
      alert(err);
      console.log(err);
    }
    console.log("txCount : ", txCount);
    const txObject = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(4700000),
      gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
      to: contractAddress,
      data,
    };

    const tx = new ethereumjs.Tx(txObject, { chain: "ropsten" });
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    const raw = "0x" + serializedTx.toString("hex");

    web3.eth.sendSignedTransaction(raw, (err, txHash) => {
      if (err) {
        alert(err);
        console.log(err);
      } else {
        console.log("TxHash: ", txHash);
        console.log(transactionList);
        transactionList = [
          ...transactionList,
          ...[{ text: desc, amount: amt }],
        ];
        console.log(transactionList);
        addToTransactionList();
        document.getElementById("myForm").reset();
      }
    });
  });
};

onSubmit = () => {
  if (PRIVATE_KEY_1) {
    const text = document.getElementById("text").value;
    const amount = document.getElementById("value").value;
    addTransaction(text, amount);
    console.log(text, amount);
  } else alert("Please set Private Key in file index.js");
};
