import { carListManager, addItemToList, format_date, init_web3, carPartListManager, getMultipleActivePart, getActivePart, clearCarDetails, getOwnerHistoryFromEvents, getOwnedItemsFromEvent } from "./utils.js"



window.onload = async function () {

    var x = await init_web3()

    // document.getElementById("register-part").addEventListener("click", function () {
    //     console.log("Register Received Part")

    //     var addr = document.getElementById("part-addr").value

    //     if(addr != ""){
    //         addItemToList(addr, "car-part-list", carPartListManager)
    //     }
    // })

    //Get all the parts that belonged to this factory and then check the ones that still do
    var parts = await getOwnedItemsFromEvent(window.accounts[0], 'TransferPartOwnership')
    console.log(parts)
    for (var i = 0; i < parts.length; i++) {
        var owners = await getOwnerHistoryFromEvents('TransferPartOwnership', parts[i])
        console.log(owners)
        if (owners[owners.length - 1] == window.accounts[0]) {
            addItemToList(parts[i], "car-part-list", carPartListManager)
        }
    }

    document.getElementById("build-car").addEventListener("click", function () {
        console.log("Build Car")

        //First, get the serial number
        var serial = document.getElementById("create-car-serial-number").value
        if (serial != "") {
            //Then the parts that will be present on the car
            var part_list = getMultipleActivePart()
            var part_array = []
            for (var i = 0; i < part_list.length; i++) {
                part_array.push(part_list[i].textContent)
            }

            // //Fill part array with dummy elements for the unprovided parts
            // while(part_array.length < 6){
            //     part_array.push("0x0")
            // }
            var creation_date = format_date()

            console.log("Create car with params")
            console.log(serial)
            console.log(part_array)
            console.log(creation_date)
            //Finally, build the car
            window.pm.methods.buildProduct(serial, "Car", creation_date, part_array).send({ from: window.accounts[0], gas: 2000000 }, function (error, result) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("Car created")
                    //Add hash to car owned list
                    var car_sha = web3.utils.soliditySha3(window.accounts[0], web3.utils.fromAscii(serial),
                        web3.utils.fromAscii("Car"), web3.utils.fromAscii(creation_date))
                    addItemToList(car_sha, "car-list", carListManager)

                    //Remove parts from available list
                    for (var i = 0; i < part_list.length; i++) {
                        part_list[i].removeEventListener("click", carPartListManager)
                        part_list[i].parentElement.removeChild(part_list[i])
                    }
                }
            })
        }
    })

    document.getElementById("car-change-ownership-btn").addEventListener("click", function () {
        console.log("Change Ownership")
        //Get car hash from active item on owned list

        var hash_element = getActivePart("car-list")
        if (hash_element != undefined) {
            var to_address = document.getElementById("car-change-ownership-input").value
            if (to_address != "") {
                window.co.methods.changeOwnership(1, hash_element.textContent, to_address).send({ from: window.accounts[0], gas: 100000 }, function (error, result) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("Changed ownership")
                        //Logic to remove item from owned list
                        hash_element.parentElement.removeChild(hash_element)
                        clearCarDetails()
                    }
                })
            }

        }
    })
}

//0xaa39f40ab0633ae9a1bbf643addfa3063a89666755ce1395a0742c4baf77e86e
//0x3fa38b7252038199b6c7ebb5b98bad3e97078790994d4ead584251015373eeac
//0x6adc265a4f62967693e499536e46c923506d5e55acf3f5502a15021c06c56a31
//0xaf11934fcff38d5bda623b4d16d18049e6200e19cf9a0da94368e98bc5794c1a
//0xca42aef82d8e832fa9532872772e3dbdf472e4f29790647654bb4df17cf55f7e
//0x73013ace31bfcdbf3810945b74ceb9e1516e09dabd157eb6b5ccdf8f78a5ac99