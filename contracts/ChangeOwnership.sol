pragma solidity >=0.4.21 <0.6.0;

//Add ProductManagement ABI to allow calls
contract ProductManagement{
    struct Part{
        address manufacturer;
        string serial_number;
        string part_type;
        string creation_date;
    }

    struct Product{
        address manufacturer;
        string serial_number;
        string product_type;
        string creation_date;
        bytes32[] parts;
    }

    mapping(bytes32 => Part) public parts;
    mapping(bytes32 => Product) public products;

    function getParts(bytes32 product_hash) public returns (bytes32[6] memory) {}
}

contract ChangeOwnership {

    enum OperationType {PART, PRODUCT}
    mapping(bytes32 => address) public currentPartOwner;
    mapping(bytes32 => address) public currentProductOwner;

    event TransferPartOwnership(bytes32 indexed p, address indexed account);
    event TransferProductOwnership(bytes32 indexed p, address indexed account);
    ProductManagement private pm;

    constructor(address prod_contract_addr) public {
        //Just create a new auxiliary contract. We will use it to check if the part or product really exist
        pm = ProductManagement(prod_contract_addr);
    }

    function addOwnership(uint op_type, bytes32 p_hash) public returns (bool) {
        if(op_type == uint(OperationType.PART)){
            address manufacturer;
            (manufacturer, , , ) = pm.parts(p_hash);
            require(currentPartOwner[p_hash] == address(0), "Part was already registered");
            require(manufacturer == msg.sender, "Part was not made by requester");
            currentPartOwner[p_hash] = msg.sender;
            emit TransferPartOwnership(p_hash, msg.sender);
        } else if (op_type == uint(OperationType.PRODUCT)){
            address manufacturer;
            (manufacturer, , , ) = pm.products(p_hash);
            require(currentProductOwner[p_hash] == address(0), "Product was already registered");
            require(manufacturer == msg.sender, "Product was not made by requester");
            currentProductOwner[p_hash] = msg.sender;
            emit TransferProductOwnership(p_hash, msg.sender);
        }
    }

    function changeOwnership(uint op_type, bytes32 p_hash, address to) public returns (bool) {
      //Check if the element exists and belongs to the user requesting ownership change
        if(op_type == uint(OperationType.PART)){
            require(currentPartOwner[p_hash] == msg.sender, "Part is not owned by requester");
            currentPartOwner[p_hash] = to;
            emit TransferPartOwnership(p_hash, to);
        } else if (op_type == uint(OperationType.PRODUCT)){
            require(currentProductOwner[p_hash] == msg.sender, "Product is not owned by requester");
            currentProductOwner[p_hash] = to;
            emit TransferProductOwnership(p_hash, to);
            //Change part ownership too
            bytes32[6] memory part_list = pm.getParts(p_hash);
            for(uint i = 0; i < part_list.length; i++){
                currentPartOwner[part_list[i]] = to;
                emit TransferPartOwnership(part_list[i], to);
            }

        }
    }
}
