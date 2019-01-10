# Ethereum Supply Chain Demo

This project is a simple supply chain application that records transactions on ethereum.
It intends to be very simple and generic, and we base the main example on car manufacturing.
The functionality is provided by two Smart Contracts:

* ProductManagement - Register products and keep their data
* ChangeOwnership - Tracks ownership of each product

We have a simple web interface to interact with the contracts that assume three roles: Parts Factory, Car Factory and Dealers.
Each has its own view (page) and we keep them separated to better demonstrate how different parties could use the contracts.

## Setup and Running

The contract logic, migrations and tests use [Truffle](https://truffleframework.com/truffle) and [Ganache](https://truffleframework.com/ganache) as basic environment, so first install them:

`npm install -g ganache-cli truffle`

Also, we host our interface with http-server, a simple node package, so install it too:

Install [Metamask](https://metamask.io/) to enable interactions using the web interface.

Run ganache-cli and take note of the mnemonic from the console output.
Setup Metamask with the mnemonic and connect to "localhost:8545", you should see all the wallets ganache creates and now we can use them to call Smart Contract methods!

Whenever you want to run the interface again, make sure ganache-cli is using the same mnemonic as the first time, or reconfigure metamask.
With ganache running, we need to deploy our contracts.
Go to the project folder and run:

`truffle migrate --reset`

Truffle should compile and deploy the contracts, writing their addresses to the console.
Take note of the ChangeOwnership and ProductManagement addresses and replace the values on "web/js/utils.js".
The parts you need to change are:

```
window.pm.options.address = '0xE5987169978243A040fba66245E982D884108A70'
...
window.co.options.address = "0x5F064EDfd972D3Cd9A129b8DFE96Ea7fEe5Dd000"
```

With that ready, go to the "web" folder and run `http-server` to start a web server on port 8080.
Open your browser and go to "localhost:8080" to check the interface.

The flow implemented is the following:

Part Factory:

* Build parts selecting their type
* Click on owned parts to register them
* Fill next party address and click on "Change Ownership" to send it to them

Car Factory:

* Automatically fill the parts and cars owned from the blockchain events
* Clicking on 6 parts and filling the car serial number you can build a car
* Clicking on a car registers them
* Filling the next party address you may send a car and the respective parts

Dealers:

* Has status page for his own parts and cars

## Observations

The interface was developed to be used by several parties, so each of them has a specific address.
Metamask allows a single visible wallet at a time, so don't forget to change it when you change roles.

## References

* [Truffle Suite](https://truffleframework.com/)
* [Materialize](https://materializecss.com/)
