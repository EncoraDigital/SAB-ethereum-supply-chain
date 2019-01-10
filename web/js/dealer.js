import { init_web3, getOwnedItemsFromEvent, dealerPartListManager, dealerProductListManager, addItemToList } from "./utils.js"

window.onload = async function () {

    var x = await init_web3()

    //First, get all the parts and products that belong to this dealer
    getOwnedItemsFromEvent(window.accounts[0], 'TransferPartOwnership').then((parts) => {
        console.log("part Events")
        console.log(parts)
        for (var i = 0; i < parts.length; i++) {
            addItemToList(parts[i], "parts-history", dealerPartListManager)
        }
    })

    //Then, get products
    getOwnedItemsFromEvent(window.accounts[0], 'TransferProductOwnership').then((products) => {
        console.log("prod Events")
        console.log(products)
        for (var i = 0; i < products.length; i++) {
            addItemToList(products[i], "car-history", dealerProductListManager)
        }
    })

    // document.getElementById("get-history").addEventListener("click", function () {
    //     console.log("Get Car History")



    //     var addr = document.getElementById("part-addr").value

    //     if (addr != "") {
    //         addItemToList(addr, "car-part-list", carPartListManager)
    //     }
    // })
}

//0xc171729eaa58806df3704aaca30e71fbe811eec2889f4ca8e9f8a457de640278
//0x831c1b222e57853205b6aa7decfca1c39675070fed01f7bc2b693d47757d7eee
//0xf3c3678bbc821c6e6bd1fc1a55f2cfe3cb739bea13fbeb43f4eb27cba72e7fe2
//0x51a44f91fd815dc039d4bce7ded835c60a3b6fc5e60382be51fc3d9b6c1bc67b
//0xb4e86d1d852e0925c52bf95a6395812fb86fd4b8bed1741afbf7bbb476493dc9
//0xf28fa97386f2b835c08761b4f2f4da0a6486e8df6d325e2bf715818e1aae6063