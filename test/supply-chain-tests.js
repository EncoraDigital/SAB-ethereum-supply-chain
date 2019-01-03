const ProductManagement = artifacts.require("ProductManagement");
const ChangeOwnership = artifacts.require("ChangeOwnership");

contract("ProductManagement", accounts => {

    var contract 
    beforeEach(async function() {
        contract = await ProductManagement.new({ from: accounts[0] })
    })

    it("should create a wheel and store it", () =>
        {
            const serial_number = "123456"
            const part_type = "wheel"
            const creation_date = "12/12/18"
            return contract.buildPart(serial_number, part_type, creation_date, { from: accounts[0] }).then( result => {
                //Transactions don't return values, we will just check the final result of the test
                p_hash = web3.utils.soliditySha3(accounts[0], web3.utils.fromAscii(serial_number),
                                                 web3.utils.fromAscii(part_type), web3.utils.fromAscii(creation_date))
                return contract.parts.call(p_hash, { from: accounts[0] }).then(part_info => {
                    //The part_info is an object with the struct Part fields as keys
                    // console.log(part_info)
                    assert.equal(part_info["manufacturer"], accounts[0])
                    assert.equal(part_info["serial_number"], serial_number)
                    assert.equal(part_info["part_type"], part_type)
                    assert.equal(part_info["creation_date"], creation_date)
                })
            })
        }
    );

    it("should create a car using 6 parts and store it", async () => {
        //First, create the car parts
        const serial_numbers = ["123456", "123457", "123458", "123459", "123450", "123451"]
        const part_types = ["wheel", "wheel", "wheel", "wheel", "engine", "transmission"]
        const creation_date = "12/12/18"
        let part_array = []

        let result
        for(let i =0; i< serial_numbers.length; i++){
            result = await contract.buildPart(serial_numbers[i], part_types[i], creation_date, { from: accounts[0] })
            part_array.push(web3.utils.soliditySha3(accounts[0], web3.utils.fromAscii(serial_numbers[i]),
                        web3.utils.fromAscii(part_types[i]), web3.utils.fromAscii(creation_date)))
        }

        //Then create the car itself from the parts. Each part must be given as a hash that contains the wallet address and the part info.
        const serial_prod = "12345678"
        const product_type = "car"

        result = await contract.buildProduct(serial_prod, product_type, creation_date, part_array, {from: accounts[0]})
        //Then check the car is in storage. Again, the hash should be the one below
        const p_hash = web3.utils.soliditySha3(accounts[0], web3.utils.fromAscii(serial_prod),
                                               web3.utils.fromAscii(product_type), web3.utils.fromAscii(creation_date))
        result = await contract.products.call(p_hash, {from:accounts[0]})
        assert.equal(result["manufacturer"], accounts[0])
        assert.equal(result["serial_number"], serial_prod)
        assert.equal(result["product_type"], product_type)
        assert.equal(result["creation_date"], creation_date)

        //Get parts and compare to the ones used when building the car
        result = await contract.getParts.call(p_hash, {from:accounts[0]})
        for(i = 0; i< part_array.length; i++){
            assert.equal(result[i], part_array[i])
        }
    });

});

contract("ChangeOwnership", accounts => {

    var pm
    var contract
    beforeEach(async function() {
        pm = await ProductManagement.new({ from: accounts[0] })
        contract = await ChangeOwnership.new(pm.address, { from: accounts[0] })
    })

    it("should be able to assign ownership to manufacturer when part does not have owner", async () => {
        const serial_number = "123456"
        const part_type = "wheel"
        const creation_date = "12/12/18"

        result = await pm.buildPart(serial_number, part_type, creation_date, { from: accounts[0] })
        let p_hash = web3.utils.soliditySha3(accounts[0], web3.utils.fromAscii(serial_number),
                                             web3.utils.fromAscii(part_type), web3.utils.fromAscii(creation_date))
        
        // 0 means part, 1 means product
        const op_type = 0
        result = await contract.addOwnership(op_type, p_hash)
        result = await contract.currentPartOwner.call(p_hash)
        assert.equal(result, accounts[0])
    })

    it("should be able to change ownership when owner requests", async () => {
        const serial_number = "123456"
        const part_type = "wheel"
        const creation_date = "12/12/18"

        result = await pm.buildPart(serial_number, part_type, creation_date, { from: accounts[0] })
        let p_hash = web3.utils.soliditySha3(accounts[0], web3.utils.fromAscii(serial_number),
                                             web3.utils.fromAscii(part_type), web3.utils.fromAscii(creation_date))
        
        // 0 means part, 1 means product
        const op_type = 0
        result = await contract.addOwnership(op_type, p_hash, { from: accounts[0] })

        result = await contract.changeOwnership(op_type, p_hash, accounts[1], { from: accounts[0] })

        result = await contract.currentPartOwner.call(p_hash)
        assert.equal(result, accounts[1])
    })
})