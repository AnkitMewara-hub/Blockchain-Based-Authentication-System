let web3;
let contract;
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";  // Replace with your contract address
const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "passkey",
				"type": "string"
			}
		],
		"name": "PasskeyRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_passkey",
				"type": "string"
			}
		],
		"name": "registerPasskey",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_passkey",
				"type": "string"
			}
		],
		"name": "verifyPasskey",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];  // Replace with your contract ABI

// 🟢 Connect MetaMask
async function connectMetaMask() {
    if (!window.ethereum) {
        alert("❌ MetaMask is not installed!");
        return;
    }
    try {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(abi, contractAddress);
        document.getElementById("status").innerText = `🟢 Connected: ${accounts[0]}`;
    } catch (error) {
        console.error("❌ MetaMask Connection Failed:", error);
    }
}

// 🟢 Register Passkey
async function registerPasskey() {
    if (!web3) {
        alert("❌ Connect MetaMask First!");
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];

        const message = "Authenticate to generate Passkey: " + new Date().getTime();
        const signature = await web3.eth.personal.sign(message, userAccount, "");
        const passkey = web3.utils.sha3(signature);

        localStorage.setItem("passkey", passkey);
        await contract.methods.registerPasskey(passkey).send({ from: userAccount, gas: 500000 });

        alert("✅ Passkey Registered Successfully!");
        window.location.href = "verify.html"; // Redirect to verification page

    } catch (error) {
        console.error("❌ Passkey Registration Failed:", error);
        alert("❌ Passkey Registration Failed! Check console for details.");
    }
}

// Function to create and show the Passkey popup
function showPasskeyPopup(passkey) {
    const popupHTML = `
        <div id="passkeyPopup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
            text-align: center; z-index: 1000;">
            <h3>✅ Passkey Generated!</h3>
            <p>Your Passkey:</p>
            <input type="text" value="${passkey}" id="passkeyInput" readonly
                style="width: 90%; padding: 5px; margin-bottom: 10px; text-align: center;">
            <button onclick="copyPasskey()">Copy</button>
            <button onclick="closePasskeyPopup()">Close</button>
        </div>
        <div id="popupOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 999;" onclick="closePasskeyPopup()"></div>
    `;

    document.body.insertAdjacentHTML("beforeend", popupHTML);
}

// Function to close the popup
function closePasskeyPopup() {
    document.getElementById("passkeyPopup").remove();
    document.getElementById("popupOverlay").remove();
    window.location.href = "verify.html"; // Redirect to verification page
}

// Function to copy Passkey
function copyPasskey() {
    const passkeyInput = document.getElementById("passkeyInput");
    passkeyInput.select();
    document.execCommand("copy");
    alert("Passkey copied!");
}

// Register Passkey & Show Popup
async function registerPasskey() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
        const userAccount = accounts[0];

        // Generate a unique passkey
        const message = `Authenticate for Passkey: ${new Date().getTime()}`;
        const signature = await web3.eth.personal.sign(message, userAccount, "");
        const passkey = web3.utils.sha3(signature); // Generate hashed passkey

        localStorage.setItem("passkey", passkey); // Save passkey locally

        // Show Passkey in a Popup
        showPasskeyPopup(passkey);
    } catch (error) {
        console.error("❌ Passkey Registration Failed:", error);
        alert("❌ Passkey Registration Failed! Try again.");
    }
}


// Verify & Login (on verify.html page)
function verifyPasskey() {
    const enteredPasskey = document.getElementById("passkeyInput").value;
    const storedPasskey = localStorage.getItem("passkey");

    if (!enteredPasskey) {
        alert("⚠️ Please enter a passkey!");
        return;
    }

    if (enteredPasskey === storedPasskey) {
        alert("✅ Login Successful!");
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
        alert("❌ Incorrect Passkey! Try again.");
    }
}