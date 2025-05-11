import React, { useState, useEffect } from "react";
import CommonSection from '../components/section/Common-section/CommonSection';
import { Container, Row, Col } from "reactstrap";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; // ✏️ Added axios for API requests
import '../styles/create_item.css'
import CarCard from '../components/section/Car_card/CarCard';
import img from '../assets/images/img-02.jpg' // Placeholder image for car preview
import avatar from '../assets/images/ava-01.png' 
import Select from "react-select"; // Import react-select for category and condition dropdowns

// Modify - Interact with Blockchain
import AssestContract from "../AssestContract.json"; // Smart contract ABI and address
import { ethers } from "ethers"; // ethers.js for interacting with Ethereum blockchain

// Sample item for preview
const item = { id: "04", title: "Porsche 911", imgUrl: img, creator: "0x49c...EfE5", creatorImg: avatar ,
               price: 7.89 }

function Create() {
    // State variables to handle car information
    const [car, setCar] = useState({
        title: "", 
        price: "", 
        category: "", 
        car_condition: "", 
        created_date: "", 
        image_path: "", 
        description: ""
    })
    const [file, setFile] = useState(null);  // State to hold the uploaded file
    const [message, updateMessage] = useState(""); // State to display success or error messages
    const navigate = useNavigate(); // Hook to navigate to the marketplace after listing a car

    //------------ FORM HANDLERS ------------//
    // Handle text input changes
    const handleChange = (e) => {
        setCar((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Store the selected file in the state
    };

    // Notification logic to show success message
    const showSuccessNotification = () => {
        const successNoti = document.querySelector(".success_noti");
        const succProgress = document.querySelector(".succ-progress");
        successNoti.classList.add("succ-active");
        succProgress.classList.add("succ-active");

        setTimeout(() => {
            successNoti.classList.remove("succ-active");
        }, 1900);

        setTimeout(() => {
            succProgress.classList.remove("succ-active");
        }, 1900);
    };

    // Notification logic to show error message
    const showErrorNotification = (message) => {
        const errorNoti = document.querySelector(".error_noti");
        const errProgress = document.querySelector(".err-progress");
        const errMessage = document.querySelector(".error_noti .text-2");

        errorNoti.classList.add("err-active");
        errProgress.classList.add("err-active");

        // Set error message
        errMessage.textContent = message;

        setTimeout(() => {
            errorNoti.classList.remove("err-active");
        }, 4000);

        setTimeout(() => {
            errProgress.classList.remove("err-active");
        }, 4500);
    };

    // Function to list a car for sale on the marketplace
    const listCar = async (e) => {
        e.preventDefault(); // Prevent form from submitting normally

        // Validate that all required fields are filled
        if (!file || !car.title || !car.price || !car.category || !car.car_condition || !car.created_date || !car.description) {
            showErrorNotification("⚠️ All fields are required! Please fill in all the fields before submitting.");
            return; // Stop form submission if fields are missing
        }

        // Validate price range
        if (car.price < 0.1 || car.price > 100) {
            showErrorNotification("⚠️ Price must be between 0.1 and 100 ETH.");
            return; // Stop form submission if price is out of range
        }

        try {
            // Initialize Ethereum provider and contract
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(AssestContract.address, AssestContract.abi, signer);

            updateMessage("Minting Car on blockchain... Please wait.");

            /// Convert price to ether
            const priceInEther = ethers.utils.parseUnits(car.price.toString(), "ether");
            const listingPrice = await contract.getListPrice(); // Get the list price from the smart contract

            console.log("Price in Ether:", priceInEther.toString());

            // Mint the car on the blockchain
            const transaction = await contract.createToken(priceInEther, {
                value: listingPrice.toString() // Convert listing price to string explicitly
            });

            await transaction.wait(); // Wait for the transaction to be mined

            // Retrieve the tokenId after minting the car
            const generatedTokenId = await contract.getCurrentToken();

            updateMessage("Storing Car data in MySQL...");

            // Upload car data to MySQL
            const formData = new FormData();
            formData.append("title", car.title);
            formData.append("price", car.price);
            formData.append("category", car.category);
            formData.append("car_condition", car.car_condition);
            formData.append("created_date", car.created_date);
            formData.append("image_path", file);
            formData.append("description", car.description);
            formData.append("token_id", generatedTokenId); // Store tokenId from blockchain
            formData.append("owner", await signer.getAddress());
            formData.append("seller", await signer.getAddress());

            // Send the car data to the backend (MySQL)
            try {
                const response = await axios.post("http://localhost:8800/cars", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                console.log("Server Response:", response); // Debugging log

                if (response && response.data && response.data.success) {
                    showSuccessNotification(); // Show success notification

                    // Delay navigation until after success notification
                    setTimeout(() => {
                        navigate("/market");
                    }, 2000); // Navigate after 2 seconds (same duration as the success notification)
                } else {
                    showErrorNotification("Error storing Car in MySQL. Response: " + JSON.stringify(response.data));
                }
            } catch (error) {
                console.error("❌ Error sending data:", error);
                showErrorNotification("❌ Failed to list Car: " + (error.response?.data?.message || error.message));
            }

            // Reset state and navigate to the marketplace
            updateMessage("");
            setCar({
                title: "",
                price: "",
                category: "",
                car_condition: "",
                created_date: "",
                image_path: "",
                description: ""
            });
            setFile(null);

        } catch (err) {
            console.error("Error listing Car:", err);
            showErrorNotification("Error: " + err.message);
        }
    };

    //------------ CATEGORY OPTIONS ------------//
    // Handle CATEGORY select
    const [selectedOption, setSelectedOption] = useState(null);
    const handleCategoryChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setCar((prev) => ({ ...prev, category: selectedOption.value })); // Update category in state
    };
    const categoryOptions = [
        { value: "SUV", label: "SUV" },
        { value: "Crossover", label: "Crossover" },
        { value: "Sedan", label: "Sedan" },
        { value: "Pickup Truck", label: "Pickup Truck" },
        { value: "Hatchback", label: "Hatchback" },
        { value: "Convertible", label: "Convertible" },
        { value: "Luxury", label: "Luxury" },
        { value: "Coupe", label: "Coupe" },
        { value: "Hybrid/Electric", label: "Hybrid/Electric" },
        { value: "Minivan", label: "Minivan" },
        { value: "Sports Car", label: "Sports Car" },
        { value: "Station Wagon", label: "Station Wagon" }
    ];

    //------------ CONDITION OPTIONS ------------//
    const [selectedCondition, setSelectedCondition] = useState(null);
    const handleConditionChange = (selectedOption) => {
        setSelectedCondition(selectedOption);
        setCar((prev) => ({ ...prev, car_condition: selectedOption.value }));
    };
    const conditionOptions = [
        { value: "New", label: "New" },
        { value: "Used", label: "Used" }
    ];

    // MODIFY - Add state to track wallet connection status
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    useEffect(() => {
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

        // Function to check if the wallet is connected
        async function checkWalletConnection() {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);
                if (accounts.length > 0) {
                    setIsWalletConnected(true); // Set wallet as connected
                } else {
                    setIsWalletConnected(false); // Set wallet as not connected
                }
            } else {
                setIsWalletConnected(false); // If no Ethereum provider, set as not connected
            }
        }
    
        // Check wallet connection on mount
        checkWalletConnection();
    
        // Listen for account changes in the wallet
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", checkWalletConnection);
        }
    
        // Cleanup listener when component unmounts
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", checkWalletConnection);
            }
            if (succCloseButton) {
                succCloseButton.removeEventListener("click", () => {});
            }
            if (errCloseButton) {
                errCloseButton.removeEventListener("click", () => {});
            }
        };
     }, []);



    return(
        <>
        <CommonSection title='Create Item' />
        
        {/* Success Notification */}
        <div class="success_noti">
            <div class="succ-content">
                <i class="ri-check-line check-icon"></i>
                <div class="message">
                    <span class="text text-1">Success</span>
                    <span class="text text-2">Car successfully listed!</span>
                </div>
            </div>
            <i class="ri-close-circle-line succ-close "></i>
            <div class="succ-progress"></div>
        </div>

        {/* Error Notification */}
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

        <section>
            <Container>
                <Row>
                    {/* Item Preview */}
                    <Col lg='3' md='4' sm='6'>
                    <h5 className="prev_item">Sample Item</h5>
                    <CarCard item={item} />
                    </Col>
                        
                    {/* Form Section */}
                    <Col lg='9' md='8' sm='6' >
                        <div className="create__item">
                            <h3> Upload your Car to the marketplace </h3>
                            <div className="alert">
                                {isWalletConnected ? "" : "Please connect to your wallet before uploading the Asset!"}
                            </div>

                            <form > {/* Title Input */}
                                <div className="form__input">
                                    <label htmlFor="title" > Title </label>
                                    <input type="text" placeholder="Enter title" 
                                            name="title" onChange={handleChange} required
                                            value={car.title} />
                                </div>

                                    {/* Price Input */}
                                <div className="form__input">
                                    <label htmlFor="price" >Price</label>
                                    <input type="number"
                                            placeholder="Enter price (0.1 - 100 ETH)"
                                            name="price"
                                            onChange={handleChange}
                                            min="0.1"
                                            max="100" 
                                            step="0.01"  
                                            required 
                                            value={car.price}
                                    />
                                </div>

                                {/* Category Dropdown */}
                                <div className="form__select">
                                    <label htmlFor="category">Category</label>
                                    <Select
                                        id="category"
                                        value={selectedOption}
                                        onChange={handleCategoryChange} // ✏️ Updated handler
                                        options={categoryOptions}
                                        placeholder="Choose Car Category"
                                        isSearchable={true}
                                        className="custom-dropdown" 
                                        classNamePrefix="custom-select"
                                        required
                                    />
                                </div>                

                                {/* Condition Dropdown */}
                                <div className="form__select">
                                    <label htmlFor="condition">Condition</label>
                                    <Select
                                        id="car_condition"
                                        value={selectedCondition}
                                        onChange={handleConditionChange}
                                        options={conditionOptions}
                                        placeholder="Choose Car Condition"
                                        isSearchable={true}
                                        className="custom-dropdown" 
                                        classNamePrefix="custom-select"
                                        required
                                    />
                                </div>
                                
                                {/* Created Date */}
                                <div className=" d-flex align-items-center justify-content-between ">
                                    <div className="form__input w-50 ">
                                        <label htmlFor="created_date" >Created  Date</label>
                                        <input type="date" name="created_date" onChange={handleChange} 
                                                required value={car.created_date} />
                                    </div>

                                </div>

                                {/* File Upload */}
                                <div className="form__input ">
                                    <label htmlFor="" >Upload File</label>
                                    <input type="file" placeholder="Browse" onChange={handleFileChange}
                                    required />
                                </div>
                
                                {/* Description */}                 
                                <div className="form__input">
                                    <label htmlFor="" > Description </label>
                                    <textarea id="" rows="3" placeholder="Enter description" className="w-100"
                                                name="description" onChange={handleChange}
                                    required />                     
                                </div>
                                
                                {/* Success/Error Message */}
                                <div className="">{message}</div>

                                {/* Add Button */}
                                <button 
                                        onClick={listCar}
                                        className="add-btn d-flex align-items-center gap-2"
                                        disabled={!isWalletConnected}
                                >
                                    <i class="ri-shopping-bag-line" ></i> ADD
                                </button>
                            </form>

                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
        </>
    );
}

export default Create;