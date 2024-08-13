// Requirements
const ethers = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Load configuration
const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
const contractAddress = process.env.CONTRACT_ADDRESS;

const abi = [
    {
        "anonymous": false,
        "inputs": [],
        "name": "Ping",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "name": "Pong",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_txHash",
                "type": "bytes32"
            }
        ],
        "name": "pong",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Create contract
const contract = new ethers.Contract(contractAddress, abi, provider);

// Get private key of the wallet and connect to contract
const privateKey = process.env.PRIVATE_KEY; 
const wallet = new ethers.Wallet(privateKey, provider);
const contractWithSigner = contract.connect(wallet);


// ------------------------------
async function main() {
    console.log(`Using contract at address: ${contractAddress}`);
    let startBlock;

    // Verify if `startBlock.json` exists
    if (fs.existsSync('startBlock.json')) {
        // Reads startBlock if the file exists
        const startBlockData = JSON.parse(fs.readFileSync('startBlock.json', 'utf8'));
        startBlock = startBlockData.startBlock;
        console.log(`Starting from block: ${startBlock}`);
    } else {
        // If the file does not exists, latest block is loaded as startBlock and saved
        startBlock = await provider.getBlockNumber();
        console.log(`startBlock.json not found. Starting from the latest block: ${startBlock}`);

        fs.writeFileSync('startBlock.json', JSON.stringify({ startBlock: startBlock }, null, 2));
        console.log(`Saved starting block ${startBlock} to startBlock.json`);
    }

    // Get emitted Pong events
    const pongFilter = {
        address: contractAddress,
        fromBlock: startBlock,
        toBlock: 'latest',
        topics: [
            ethers.id("Pong(bytes32)")
        ]
    };

    // Gete txHashes of emitted Pong events
    const pongs = await provider.getLogs(pongFilter);
    const respondedTxHashes = new Set(pongs.map(log => ethers.hexlify(log.data)));

    while (true) {
        let latestBlock = await provider.getBlock('latest');

        // Update filter to process only new events
        const pingFilter = {
            address: contractAddress,
            fromBlock: startBlock,
            toBlock: latestBlock.number,
            topics: [
                ethers.id("Ping()")
            ]
        };
        // Get logs of Ping events
        const pings = await provider.getLogs(pingFilter);

        // Process Ping events found
        let highestBlockProcessed = startBlock;
        for (const log of pings) {
            const txHash =  log.transactionHash;
            const blockNumber = log.blockNumber;

            if (!respondedTxHashes.has(txHash)) {
                console.log(`Ping event detected. Calling pong() with tx hash: ${txHash}`);

                try {
                    const pongTx = await contractWithSigner.pong(txHash); // Pong call
                    await pongTx.wait();
                    console.log(`Pong sent for transaction: ${txHash}`);

                    // Add txHash to respondedTxHashes groups
                    respondedTxHashes.add(txHash);

                } catch (err) {
                    console.error(`Error calling pong for txHash ${txHash} in block ${log.blockNumber}:`, err);
                }
            }
            else {
                console.log(`Ping in block ${blockNumber} with tx hash ${txHash} already responded.`);
            }

            // Update last block processed
            if (log.blockNumber > highestBlockProcessed) {
                highestBlockProcessed = log.blockNumber;
            }
        }

        // Update startBlock if there is a new block processed
        if (highestBlockProcessed > startBlock) {
            fs.writeFileSync('startBlock.json', JSON.stringify({ startBlock: highestBlockProcessed + 1 }, null, 2));
            startBlock = highestBlockProcessed + 1;
            console.log(`Updated startBlock to ${startBlock}`);
        }

        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait before polling for new blocks
        console.log('Polling again');
    }
}

main().catch(console.error);
