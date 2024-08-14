# pingpong

This bot listens Ping events in a Smart contract and generates a Pong event every time a Ping event is emitted.
Pong function of the Smart Contract is called with the transaction hash of the ping event.

Requirements:

    A wallet with enough funds in the EVM compatible network where the bot will run.
    Get the Private Key of that wallet.
    A PingPong Contract (for example: 0xc0fd70e304231DDF75a9160f197B235f44D7686e)    

    Create a .env file with this information:
        INFURA_API_KEY=
        PRIVATE_KEY=
        CONTRACT_ADDRESS=0xc0fd70e304231DDF75a9160f197B235f44D7686e

To start the bot:

    node and npm (and pm2 or forever)
    run 'npm install' in the directory

    * Configure pm2 or

    * Configure forever
        Update WORKINGDIR in startappp.sh with the correct directory
        Then run ./startapp.sh and the bot will run with forever generating logs in ./LOGS directory

    startBlock.json will have the last block processed (if the file does not exist the bot will load the latest block)


    Address:
    https://sepolia.etherscan.io/address/0xc0fd70e304231DDF75a9160f197B235f44D7686e
    Starting Block:
    6489615
