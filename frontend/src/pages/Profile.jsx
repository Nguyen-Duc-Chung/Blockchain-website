import React, { useState, useEffect } from 'react';
import CommonSection from '../components/section/Common-section/CommonSection';
import '../styles/profile.css';
import { Container, Row, Col } from 'reactstrap';


import CarContract from "../AssestContract.json"; // Import the contract ABI and address
import { ethers } from "ethers";

import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from react-router for navigation
import blockies from 'ethereum-blockies';  // Added for wallet avatar generation

function Profile() {
    // Declare state variables
    const [data, updateData] = useState([]);  
    const [dataFetched, updateFetched] = useState(false);  
    const [address, updateAddress] = useState("0x");  // Store the user's Ethereum address
    const [totalPrice, updateTotalPrice] = useState("0");  // Store total price of all assets in ETH
    const [avatar, setAvatar] = useState(null);  // Store the avatar image for the user

    // Function to fetch user's car data from the blockchain
    async function getCarData() {
        try {
            let sumPrice = 0;  // Variable to sum up the total price of assets
            const provider = new ethers.providers.Web3Provider(window.ethereum);  // Get the Web3 provider
            const accounts = await provider.listAccounts();  // Get the connected Ethereum account
    
            if (accounts.length > 0) {
                const addr = accounts[0];  // Get the address of the first account
                updateAddress(addr);  // Update the state with the address
    
                const signer = provider.getSigner();  // Get the signer for transactions

                const contract = new ethers.Contract(CarContract.address, CarContract.abi, signer);  // Connect to the smart contract
    
                // Fetch user's assets from the smart contract
                let transaction = await contract.fetchUserAssest();
    
                // Map through the transaction data to get more details
                const items = await Promise.all(
                    transaction.map(async (i) => {
                        try {
                            const tokenId = i.tokenId ? i.tokenId.toNumber() : i[0].toNumber();
                            const priceBigNumber = i.price || i[3];
                            const priceInEther = ethers.utils.formatUnits(priceBigNumber, "ether");
    
                            // Fetch metadata from backend (MySQL database)
                            const response = await axios.get(`http://localhost:8800/cars/${tokenId}`);
                            const meta = response.data;

                            // Check if the response is valid and has status "200 OK"
                            if (meta.status === "200 OK") {
                                const car = meta.data;  // Access the car data from the response
    
                                sumPrice += parseFloat(priceInEther);  // Sum up the price of assets
        
                                // Return the asset details
                                return {
                                    price: priceInEther,
                                    tokenId,
                                    seller: i.seller || i[1],
                                    owner: i.owner || i[2],
                                    imagePath: car.image_path,  // MySQL image URL
                                    name: car.title,           // MySQL name
                                    description: car.description,  // MySQL description
                                };
                            }
                        } catch (err) {
                            console.error("Error fetching data for a token:", err);
                            return null;
                        }
                    })
                );
    
                // Filter out any null items and update state
                updateData(items.filter(item => item !== null));
                updateFetched(true);  // Set the dataFetched flag to true
                updateTotalPrice(sumPrice.toFixed(2));  // Update the total price in ETH
            } else {
                console.log("No wallet connected.");
            }
        } catch (error) {
            console.error("Error fetching Car data:", error);
        }
    }    

    // Function to generate an avatar based on Ethereum address using blockies
    function generateAvatar(address) {
        if (!address || address === "0x") {
            setAvatar(null);  // Clear avatar if no address is connected
            return;
        }
        const imgSrc = blockies.create({ seed: address.toLowerCase(), size: 8, scale: 4 }).toDataURL();  // Generate blockies avatar image
        setAvatar(imgSrc);  // Set the avatar image to the generated blockies image
    }

    // useEffect hook to initialize the profile and fetch car data when the component loads
    useEffect(() => {
        async function initializeProfile() {
            if (!window.ethereum) {
                console.log("MetaMask is not installed.");
                return;
            }
    
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const addr = accounts[0];
                updateAddress(addr);  // Update the address state when the component loads
                generateAvatar(addr);  // Generate the avatar for the current address
            }
    
            if (!dataFetched) {
                getCarData();  // Fetch car data if not already fetched
            }
        }
    
        initializeProfile();
    
        if (window.ethereum) {
            // Listen for account changes and update the profile accordingly
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length > 0) {
                    updateAddress(accounts[0]);
                    updateFetched(false);
                    await getCarData();  // Fetch car data again when account changes
                    generateAvatar(accounts[0]);  // Regenerate avatar on account switch
                } else {
                    updateData([]);  
                    updateTotalPrice("0");
                    setAvatar(null); 
                }
            });
        }
    
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, [dataFetched]);  // Dependency on dataFetched to control when to fetch car data

    return (
        <>
            <CommonSection title={"Profile"} />  {/* CommonSection for page header */}

            <section className="profile-section">  {/* Main profile section */}
                <Container>  {/* Bootstrap container */}
                    <Row>
                        <Col lg="12">
                            <div className="profile-header">  {/* Header section for profile */}
                                <div className="profile-info">
                                    <div className="profile-avatar">
                                        {/* Display user's avatar */}
                                        <img src={avatar || "/fallback-avatar.png"} alt="User Avatar" />
                                    </div>
                                    <div className="profile-user">
                                        <h2>{address}</h2>  {/* Display Ethereum address */}
                                    </div>
                                </div>
                            </div>

                            <div className="profile_container">
                                <div className="profile-user-info">
                                    <h3 className="my-Assets">My Assets <span>{data.length}</span></h3>
                                    <h3 className='totalValue'>Total Value: {totalPrice} ETH</h3>
                                </div>

                                <Row> 
                                    {/* Map over the data array and display car assets */}
                                    {data.length > 0 ? (
                                      data.map((item) => {
                                          const { title, tokenId, price, imagePath, owner, imgUrl } = item;

                                          // Ensure that imagePath or imgUrl has a valid fallback
                                          const imageUrl = imagePath ? `http://localhost:8800${imagePath}` : imgUrl || "/fallback-image.jpg"; 

                                          return (
                                              <Col lg="3" md="4" sm="6" className="mb-4" key={tokenId}>
                                                  <div className="main_card_car">
                                                      <div className="car_img">
                                                          <img
                                                              src={imageUrl}
                                                              alt="Car"
                                                              className="w-100"
                                                              onError={(e) => e.target.src = "/fallback-image.jpg"}  // Handle image error by showing fallback image
                                                          />
                                                      </div>

                                                      <div className="car_bried_info">
                                                          <h5 className="car_title">
                                                              <Link to={`/cars/${tokenId}`}>{title}</Link>  {/* Link to car details */}
                                                          </h5>

                                                          <div className="creator_container d-flex gap-3">
                                                              <div className="creator_infor w-100 d-flex align-items-center justify-content-between">
                                                                  <div className="w-50">
                                                                      <h6>Owner</h6>
                                                                      <p>
                                                                          {owner && owner !== "0x"
                                                                              ? owner.substring(0, 5) + '...' + owner.substring(owner.length - 4)
                                                                              : "Unknown Owner"}
                                                                      </p>
                                                                  </div>
                                                                  <div className="w-50">
                                                                      <h6>Price</h6>
                                                                      <p>{price} ETH</p>
                                                                  </div>
                                                              </div>
                                                          </div>

                                                          <div className="cardBtn mt-3 d-flex align-items-center justify-content-around">
                                                              <button className="detail_btn">
                                                                  <i className="ri-info-i"></i>
                                                                  <Link to={`/cars/${tokenId}`}>View Details</Link>  {/* Link to car details */}
                                                              </button>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </Col>
                                          );
                                      })
                                  ) : (
                                      <Col lg="12">
                                          <p className="text-white text-center">No Assets Available</p>
                                      </Col>
                                  )}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
}

export default Profile;
