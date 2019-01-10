function toggleActive(element) {
    //Toggle class
    if (element.classList.contains("active")) {
        element.classList.remove("active")
    } else {
        element.classList.add("active")
    }
}

function clearActiveExcept(element) {
    //Clear all options from parent, except the one provided
    var element_list = element.parentElement.children
    for (var i = 0; i < element_list.length; i++) {
        if (element_list[i] != element) {
            element_list[i].classList.remove("active")
        }
    }
}

function populateDetails(item) {
    console.log("Populate details, get info from chain")
    console.log(item)
    //Query blockchain for data to fill element
    window.pm.methods.parts(item).call({ from: window.accounts[0] }, function (error, part_info) {
        if (error)
            console.log(error)
        else {
            console.log("Part info")
            console.log(part_info)
            document.getElementById("details-address").textContent = part_info["manufacturer"]
            document.getElementById("details-serial-num").textContent = part_info["serial_number"]
            document.getElementById("details-part-type").textContent = part_info["part_type"]
            document.getElementById("details-creation-date").textContent = part_info["creation_date"]

            //Check if the part is already registered, and do it otherwise
            window.co.methods.currentPartOwner(item).call({ from: window.accounts[0] }, function (error, result) {
                if (error) {
                    console.log(error)
                } else {
                    console.log(result)
                    if (result == "0x0000000000000000000000000000000000000000") {
                        console.log("Address Zero, register part")
                        window.co.methods.addOwnership(0, item).send({ from: window.accounts[0], gas: 1000000 }, function (error, result) {
                            if (error) {
                                console.log(error)
                            } else {
                                console.log("Ownership added")
                            }
                        })
                    }
                }
            })
        }
    })
}

function populateCarDetails(item) {
    console.log("Populate Car details, get info from chain")
    console.log(item)
    //Query blockchain for data to fill element
    window.pm.methods.products(item).call({ from: window.accounts[0] }, function (error, prod_info) {
        if (error)
            console.log(error)
        else {
            console.log("Product info")
            console.log(prod_info)
            document.getElementById("car-details-address").textContent = prod_info["manufacturer"]
            document.getElementById("car-details-serial-num").textContent = prod_info["serial_number"]
            document.getElementById("car-details-creation-date").textContent = prod_info["creation_date"]

            //Get parts too
            window.pm.methods.getParts(item).call({ from: window.accounts[0] }, function (error, result) {
                if (error) {
                    console.log(error)
                } else {
                    var parts_str = ""
                    for (var i = 0; i < result.length; i++) {
                        parts_str += result[i] + "\n"
                    }
                    document.getElementById("car-details-parts").textContent = parts_str

                    //Check if the product is already registered, and do it otherwise
                    window.co.methods.currentProductOwner(item).call({ from: window.accounts[0] }, function (error, result) {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log(result)
                            if (result == "0x0000000000000000000000000000000000000000") {
                                console.log("Address Zero, register product")
                                window.co.methods.addOwnership(1, item).send({ from: window.accounts[0], gas: 1000000 }, function (error, result) {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        console.log("Car Ownership added")
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    })
}

function clearDetails() {
    document.getElementById("details-address").textContent = ""
    document.getElementById("details-serial-num").textContent = ""
    document.getElementById("details-part-type").textContent = ""
    document.getElementById("details-creation-date").textContent = ""
}

function clearCarDetails() {
    document.getElementById("car-details-address").textContent = ""
    document.getElementById("car-details-serial-num").textContent = ""
    document.getElementById("car-details-parts").textContent = ""
    document.getElementById("car-details-creation-date").textContent = ""
}

function partListManager() {
    toggleActive(this)
    clearActiveExcept(this)

    if (this.classList.contains("active")) {
        //Add info to list_name-details
        populateDetails(this.textContent)
    } else {
        clearDetails()
    }
}

function carPartListManager() {
    // Select item to use on car manufacturing
    toggleActive(this)
}

function carListManager() {
    toggleActive(this)
    clearActiveExcept(this)

    if (this.classList.contains("active")) {
        populateCarDetails(this.textContent)
    } else {
        clearCarDetails()
    }
}

function addItemToList(item, list_name, click_function) {
    console.log("Populate parts")
    //Receive item hash and add to list with some animations
    var element = document.createElement("a")
    element.textContent = item
    element.classList.add("collection-item")
    element.addEventListener("click", click_function)
    document.getElementById(list_name).appendChild(element)
}

function format_date() {
    var date = new Date()
    return ('0' + date.getHours().toString()).slice(-2) + ":" +
        ('0' + date.getMinutes().toString()).slice(-2) + ":" +
        ('0' + date.getSeconds().toString()).slice(-2) + " " +
        ('0' + date.getDate().toString()).slice(-2) + "/" +
        ('0' + (date.getMonth() + 1).toString()).slice(-2) + "/" +
        ('0' + date.getFullYear().toString()).slice(-2)
}

function getActivePart(parent) {
    var item_list = document.getElementsByClassName("collection-item")
    for (var i = 0; i < item_list.length; i++) {
        if (item_list[i].parentElement.id == parent && item_list[i].classList.contains("active")) {
            return item_list[i]
        }
    }
    return undefined
}

function getMultipleActivePart() {
    var active_array = []
    var item_list = document.getElementsByClassName("collection-item")
    for (var i = 0; i < item_list.length; i++) {
        if (item_list[i].parentElement.id == "car-part-list" && item_list[i].classList.contains("active")) {
            active_array.push(item_list[i])
        }
    }
    return active_array
}

async function init_web3() {
    //Web3 init
    if (typeof web3 != 'undefined') {
        web3 = new Web3(web3.currentProvider) // what Metamask injected 
    } else {
        // Instantiate and set Ganache as your provider
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    //Load accounts
    window.accounts = await web3.eth.getAccounts()
    console.log("Loaded accounts")

    // The interface definition for your smart contract (the ABI) 
    window.pm = new web3.eth.Contract([
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "products",
            "outputs": [
                {
                    "name": "manufacturer",
                    "type": "address"
                },
                {
                    "name": "serial_number",
                    "type": "string"
                },
                {
                    "name": "product_type",
                    "type": "string"
                },
                {
                    "name": "creation_date",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x79054391"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "parts",
            "outputs": [
                {
                    "name": "manufacturer",
                    "type": "address"
                },
                {
                    "name": "serial_number",
                    "type": "string"
                },
                {
                    "name": "part_type",
                    "type": "string"
                },
                {
                    "name": "creation_date",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x8c431b9f"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor",
            "signature": "constructor"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "serial_number",
                    "type": "string"
                },
                {
                    "name": "part_type",
                    "type": "string"
                },
                {
                    "name": "creation_date",
                    "type": "string"
                }
            ],
            "name": "buildPart",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0xb9c2dc3a"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "serial_number",
                    "type": "string"
                },
                {
                    "name": "product_type",
                    "type": "string"
                },
                {
                    "name": "creation_date",
                    "type": "string"
                },
                {
                    "name": "part_array",
                    "type": "bytes32[6]"
                }
            ],
            "name": "buildProduct",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0xd2af2aec"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "product_hash",
                    "type": "bytes32"
                }
            ],
            "name": "getParts",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32[6]"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0x6e730329"
        }
    ])

    window.pm.options.address = '0xE5987169978243A040fba66245E982D884108A70'

    window.co = new web3.eth.Contract([
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "currentPartOwner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x79ab6eba"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "currentProductOwner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xf0fddc94"
        },
        {
            "inputs": [
                {
                    "name": "prod_contract_addr",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor",
            "signature": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "p",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "TransferPartOwnership",
            "type": "event",
            "signature": "0x6a67eae68bb9deea9cbb16299fce22702092dc03cbcfd6a7babc7ac0036c7d4b"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "p",
                    "type": "bytes32"
                },
                {
                    "indexed": true,
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "TransferProductOwnership",
            "type": "event",
            "signature": "0xe2d5b74efaa0dc370d71f08be6bc6c865613194b7345262a998fb5232622c0b2"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "op_type",
                    "type": "uint256"
                },
                {
                    "name": "p_hash",
                    "type": "bytes32"
                }
            ],
            "name": "addOwnership",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0x7db5a2bc"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "op_type",
                    "type": "uint256"
                },
                {
                    "name": "p_hash",
                    "type": "bytes32"
                },
                {
                    "name": "to",
                    "type": "address"
                }
            ],
            "name": "changeOwnership",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0xac814490"
        }
    ])
    window.co.options.address = "0x5F064EDfd972D3Cd9A129b8DFE96Ea7fEe5Dd000"
}

async function getOwnerHistoryFromEvents(event, p_hash) {
    return window.co.getPastEvents(event, { filter: { p: p_hash }, fromBlock: 0, toBlock: 'latest' }).then(
        function (result) {
            console.log(result);
            //Get the owner history of the part or product
            var owner_history = []
            for (var i = 0; i < result.length; i++) {
                owner_history.push(result[i].returnValues.account)
            }
            return owner_history
        }
    )
}

async function getOwnedItemsFromEvent(addr, event) {
    return window.co.getPastEvents(event, { filter: { account: addr }, fromBlock: 0, toBlock: 'latest' }).then(
        function (result) {
            console.log(result)
            //When we get 
            var items = []
            for (var i = 0; i < result.length; i++) {
                items.push(result[i].returnValues.p)
            }
            return items
        }
    )
}

function populateOwnerDetails(owners, list_name) {
    var owner_string = ""
    for (var i = 0; i < owners.length; i++) {
        owner_string += owners[i] + " "
    }
    document.getElementById(list_name).textContent = owner_string
}

function dealerPartListManager() {
    toggleActive(this)
    clearActiveExcept(this)

    if (this.classList.contains("active")) {
        getOwnerHistoryFromEvents('TransferPartOwnership', this.textContent).then((owners) => {
            console.log("bbb")
            console.log(owners)
            populateOwnerDetails(owners, "part-owners")
        })
    } else {
        clearOwnerDetails()
    }
}

function dealerProductListManager() {
    toggleActive(this)
    clearActiveExcept(this)

    if (this.classList.contains("active")) {
        getOwnerHistoryFromEvents('TransferProductOwnership', this.textContent).then((owners) => {
            populateOwnerDetails(owners, "car-owners")
        })
    } else {
        clearOwnerDetails()
    }
}

export {
    toggleActive, clearActiveExcept, populateDetails, populateCarDetails, clearDetails,
    clearCarDetails, partListManager, carPartListManager, carListManager, addItemToList,
    format_date, getActivePart, init_web3, getMultipleActivePart, getOwnerHistoryFromEvents, getOwnedItemsFromEvent,
    dealerPartListManager, dealerProductListManager
};