import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";  
import { Link } from "react-router-dom";   
import { Container, Row, Col } from "reactstrap";  
import axios from 'axios';  
import '../styles/car_details.css'; 
import CommonSection from '../components/section/Common-section/CommonSection';
import LiveAuction from '../components/section/Live_auction/LiveAuction'; 
import { ethers } from "ethers";  // Ethers.js to interact with Ethereum blockchain
import CarContract from "../AssestContract.json";  // Import the contract ABI and address for blockchain interaction

function CarDetails() {

    const [carData, setCarData] = useState({});  // Object to store the car's details
    const [dataFetched, setDataFetched] = useState(false);  // Flag to track if car data is fetched
    const [message, setMessage] = useState("");  // To display success or error messages
    const [currAddress, setCurrAddress] = useState("0x");  // Current user's Ethereum address

    // Get token_id from the URL parameter
    const { token_id } = useParams(); // Use `useParams` hook to fetch token_id from URL

    // Notification logic to show success notification
    const showSuccessNotification = (message) => {
        const successNoti = document.querySelector(".success_noti");
        const succProgress = document.querySelector(".succ-progress");
        const successMessage = document.querySelector(".success_noti .text-2");
    
        successMessage.textContent = message;  // Set the dynamic success message
        successNoti.classList.add("succ-active");
        succProgress.classList.add("succ-active");
        
        // Remove success notification after 4 seconds
        setTimeout(() => {
            successNoti.classList.remove("succ-active");
        }, 4000);
    
        setTimeout(() => {
            succProgress.classList.remove("succ-active");
        }, 4500);
    };
    
    // Notification logic to show error notification
    const showErrorNotification = (message) => {
        const errorNoti = document.querySelector(".error_noti");
        const errProgress = document.querySelector(".err-progress");
        const errMessage = document.querySelector(".error_noti .text-2");

        errorNoti.classList.add("err-active");
        errProgress.classList.add("err-active");

        // Set error message
        errMessage.textContent = message;

        // Remove error notification after 4 seconds
        setTimeout(() => {
            errorNoti.classList.remove("err-active");
        }, 4000);

        setTimeout(() => {
            errProgress.classList.remove("err-active");
        }, 4500);
    };

    // Function to fetch car details from MySQL and blockchain
    async function fetchCarData(token_id) {
        try {
            const response = await axios.get(`http://localhost:8800/cars/${token_id}`);  // Fetch car data from the backend
            console.log(response.data);  // Debugging log to check the response data
        
            if (response.data && response.data.status === "200 OK") {  // Check if the response has status "200 OK"
                const car = response.data.data;  // Access the car data from the response

                const provider = new ethers.providers.Web3Provider(window.ethereum);  // Set up Web3 provider
                const signer = provider.getSigner();  // Get the signer (current user)
                const userAddress = await signer.getAddress();  // Get the current user's Ethereum address
                const contract = new ethers.Contract(CarContract.address, CarContract.abi, signer);  // Connect to the smart contract
                const isListed = await contract.getListedTokenForId(token_id);  // Check if the car is listed for sale on the blockchain

                // Set car data into the state
                setCarData({
                    price: car.price,
                    token_id: car.token_id,
                    seller: car.seller,
                    owner: car.owner,
                    image: `http://localhost:8800${car.image_path}`, // Set car image URL
                    title: car.title,
                    description: car.description,
                    category: car.category,  
                    car_condition: car.car_condition,  
                    created_date: new Date(car.created_date).toLocaleDateString("en-US"), // Format the created date
                    currentlyListed: isListed.currentlyListed, // Whether the car is listed for sale
                });
        
                setCurrAddress(userAddress);  // Set the current user's Ethereum address
                setDataFetched(true);  // Mark that data has been fetched
            } else {
                console.log("Car not found in MySQL.");
                showErrorNotification("Car not found.");  // Show error notification if no car is found
            }
        } catch (error) {
            console.error("Error fetching car data:", error); 
            showErrorNotification("Error fetching car details.");  // Show error notification if something goes wrong
        }
    }


    // Function to buy a car
    async function buyCar(token_id) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);  // Initialize Ethereum provider
            const signer = provider.getSigner();  // Get the current signer (user)
            const contract = new ethers.Contract(CarContract.address, CarContract.abi, signer);  // Connect to the smart contract
    
            if (!carData.price) {
                showErrorNotification("Error: Price not available. Please try again."); // Check if price is available
                return;
            }
    
            const salePrice = ethers.utils.parseUnits(carData.price.toString(), "ether"); // Convert price to ethers
    
            setMessage("Processing transaction... Please wait.");
    
            // Execute sale on blockchain
            let transaction = await contract.executeSale(token_id, { value: salePrice });
            await transaction.wait(); // Wait for the transaction to be mined
    
            showSuccessNotification("Transaction successful! You now own this car.");  // Show success notification
    
            // Fetch updated car data from the backend after purchase
            const newOwner = await signer.getAddress();  // Get the new owner's Ethereum address
            await axios.post("http://localhost:8800/buy-car", {
                token_id,
                new_owner: newOwner,
                price_paid: carData.price,
            });
    
            await fetchCarData(token_id);  // Fetch updated car data after purchase
            setCarData((prevData) => ({ ...prevData, owner: newOwner, currentlyListed: false }));  // Update the car data
            setMessage("");  // Clear message
        } catch (e) {
            console.error("Error in buyCar:", e);
            showErrorNotification("Error: " + e.message); 
        }
    }

    // Function to cancel the trade/listing
    async function cancelTrade(token_id) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);  // Initialize Ethereum provider
            const signer = provider.getSigner();  // Get the signer (user)
            const contract = new ethers.Contract(CarContract.address, CarContract.abi, signer);  // Connect to the smart contract

            if (!carData.currentlyListed) {
                showErrorNotification("Error: This car is not listed for sale.");  // Check if the car is listed for sale
                return;
            }
    
            setMessage("Canceling trade... Please Wait");  // Display canceling message
    
            let transaction = await contract.cancelTrade(token_id);  // Call contract function to cancel trade
            await transaction.wait();  // Wait for the transaction to be mined
    
            showSuccessNotification("Trade canceled! Car returned to the seller.");  // Show success notification
            await fetchCarData(token_id);  // Fetch updated car data

            setCarData((prevData) => ({ ...prevData, currentlyListed: false }));  // Update car data
            setMessage(""); 
        } catch (e) {
            console.error("Error in cancelTrade:", e); 
            showErrorNotification("Error: " + e.message); 
        }
    }

    // Function to list the car for sale
    async function listCarForSale(token_id, price) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);  // Initialize Ethereum provider
            const signer = provider.getSigner();  // Get the signer (user)
            const contract = new ethers.Contract(CarContract.address, CarContract.abi, signer);  // Connect to the smart contract
    
            if (!price) {
                showErrorNotification("Error: Price is not defined.");  // Check if price is defined
                return;
            }
    
            const salePrice = ethers.utils.parseUnits(price.toString(), "ether");  // Convert price to ethers
            const listingPrice = await contract.getListPrice();  // Get listing price from the contract

            let transaction = await contract.createListedToken(token_id, salePrice, { value: listingPrice });  // List the car for sale
            await transaction.wait();  // Wait for the transaction to be mined

            await fetchCarData(token_id);  // Fetch updated car data after listing
            setCarData((prevData) => ({ ...prevData, currentlyListed: true }));  // Update car data
            showSuccessNotification("Car is now listed for sale!");

        } catch (e) {
            console.error("Error in listCarForSale:", e);
            showErrorNotification("Error: " + e.message); 
        }
    }

        // Fetch car details on page load
    useEffect(() => {
        if (!dataFetched && token_id) {
            fetchCarData(token_id); // First, ensure car data is fetched and address is updated
        }

        if (window.ethereum) {
            // Listen for account changes in the wallet
            window.ethereum.on("accountsChanged", async () => {
                await fetchCarData(token_id); // Re-fetch the car data on account change
                setCurrAddress(await new ethers.providers.Web3Provider(window.ethereum).getSigner().getAddress());
            });
        }
            // Handle success notification close
        const succCloseButton = document.querySelector(".succ-close");
        const errCloseButton = document.querySelector(".err-close");

        if (succCloseButton) {
            succCloseButton.addEventListener("click", () => {
                const successNoti = document.querySelector(".success_noti");
                const succProgress = document.querySelector(".succ-progress");
                successNoti.classList.remove("succ-active");
                setTimeout(() => {
                    succProgress.classList.remove("succ-active");
                }, 300);
            });
        }

        if (errCloseButton) {
            errCloseButton.addEventListener("click", () => {
                const errorNoti = document.querySelector(".error_noti");
                const errProgress = document.querySelector(".err-progress");
                errorNoti.classList.remove("err-active");
                setTimeout(() => {
                    errProgress.classList.remove("err-active");
                }, 300);
            });
        }

        // Cleanup event listeners when component unmounts
        return () => {
            if (succCloseButton) {
                succCloseButton.removeEventListener("click", () => {});
            }
            if (errCloseButton) {
                errCloseButton.removeEventListener("click", () => {});
            }
        };

    }, [dataFetched, token_id]);


    //------------ MAIN RENDER PART ------------//
    return(
        <>
         <CommonSection title={carData.title} /> {/* Common section at the top */}

         <div class="success_noti">
            <div class="succ-content">
                <i class="ri-check-line check-icon"></i>
                <div class="message">
                    <span class="text text-1">Success</span>
                    <span class="text text-2">Name_Of_success!</span>
                </div>
            </div>
            <i class="ri-close-circle-line succ-close "></i>
            <div class="succ-progress"></div>
        </div>

        <div class="error_noti">
            <div class="err-content">
                <i class="ri-error-warning-line warn-icon "></i>
                <div class="message">
                    <span class="text text-1">Warning</span>
                    <span class="text text-2">Name_of_Error</span>
                </div>
            </div>
            <i class="ri-close-circle-line err-close"></i>
            <div class="err-progress"></div>
        </div>
         
         <section className="Car_Detail_section" >
            <Container>
                <Row>
                    <Col lg='6' md='6' sm='6' >
                       <img src={carData.image} alt={carData.title} className="w-100 carDetail_img " />
                    </Col>

                    <Col lg='6'  md='6' sm='6' >
                        <div className="carDetail_content">

                            <h2>{carData.title}</h2>

                            <div className="carDetail_spec w-100">
                                <div className="car_info ">Price: <span>{carData.price} ETH</span> </div>
                                <div className="car_info ">Category: <span>{carData.category}</span>  </div>
                                <div className="car_info ">Condition: <span>{carData.car_condition}</span>  </div>
                                <div className="car_info ">Created date: <span>{carData.created_date}</span> </div>
                                <div className="car_info ">Current Owner: <span className="text-sm">{carData.owner}</span></div>
                                <div className="car_info ">Seller: <span className="text-sm">{carData.seller}</span></div>
                            </div>

                            <p className="my-4" >{carData.description}</p> {/* Link to the wallet page */}

                            {/* Conditional rendering of buttons */}
                            <div>
                                {currAddress && carData.owner && currAddress.toLowerCase() === carData.owner.toLowerCase() ? (
                                    carData.currentlyListed ? (
                                        <>
                                            <div className="noti_div">This car is listed for sale.</div>
                                            <button
                                                className=" executeBtn "
                                                onClick={() => cancelTrade(token_id)}
                                            >
                                                <span className="button_top">Cancel Trade</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className=" noti_div ">You are the owner of this car</div>
                                            <button
                                                className=" executeBtn "
                                                onClick={() => listCarForSale(token_id, carData.price)}
                                            >
                                                <span className="button_top">List Car for Sale</span>
                                            </button>
                                        </>
                                    )
                                ) : (
                                    carData.currentlyListed ? (
                                        <>
                                            <button
                                                className=" executeBtn "
                                                onClick={() => buyCar(token_id)}
                                            >
                                                <span className="button_top">Buy</span>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="not_for_sale">This car is not yet for sale !</div>
                                    )
                                )}
                            </div>



                        </div>
                    </Col>
                </Row>
            </Container>
         </section>

         <LiveAuction />
        </>
    );
}
export default CarDetails