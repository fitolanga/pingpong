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




To do:

    The startBlock.json is currently only being updated whenever a ping is received. It would be better to update the file with
    each new block. In this way, if the bot is restarted, the first call to 'const pings = await provider.getLogs(pingFilter);' would be shorter.

    If an 'INSUFFICIENT_FUNDS' error occurs, the current version leaves the blockNumber in the log, allowing the bot to be restarted 
    with more funds by editing the startBlock.json with the block number of the oldest Ping that was not processed. 
    This could be improved by saving a list of "unprocessed Pings." With the, it wouldn’t be necessary to restart the bot, 
    as unprocessed Pings could be handled when enough funds are available.

    It would be a good idea to add a feature to avoid emitting a Pong if there is a spike in gas prices. For example, set a gas price 
    limit and check the price before emitting a Pong. If the price is above the limit, the bot could wait for a defined period 
    (which could also be set as a parameter) and then try again to emit the Pong.
