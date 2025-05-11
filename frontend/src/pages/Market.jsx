import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col } from "reactstrap"; // Import Reactstrap components for layout
import "../styles/market.css";
import CommonSection from "../components/section/Common-section/CommonSection";
import CarCard from "../components/section/Car_card/CarCard"; // Import CarCard component to display individual car details
import { ethers } from "ethers";

function Market() {
    // State variables to store data and manage state
    const [cars, setCars] = useState([]);
    const [search, setSearch] = useState("");  // Search query for filtering cars by title
    const [minPrice, setMinPrice] = useState(0);  // Minimum price filter (not actively used in the current code)
    const [maxPrice, setMaxPrice] = useState(10);
    const [allCars, setAllCars] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);  // Flag to check if data has been fetched
    const [currAddress, setCurrAddress] = useState("0x");  // Store the current user's Ethereum address

    // Function to fetch the current wallet address
    async function getAddress() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);  // Connect to Ethereum provider
        const accounts = await provider.send("eth_accounts", []);  // Fetch the connected Ethereum accounts
        if (accounts.length > 0) {
            setCurrAddress(accounts[0]);  // Set the current Ethereum address if accounts exist
        }
    }

    // Function to fetch all car data from the backend (API)
    async function getAllCars() {
        try {
            const response = await axios.get("http://localhost:8800/cars");  // Send GET request to backend to fetch car data
            if (response.status === 200 && Array.isArray(response.data.data)) {  // Access response.data.data
                setCars(response.data.data);  // Set state with the fetched car data
                setAllCars(response.data.data);  // Store the complete car data to be used later
                setDataFetched(true);  // Mark data as fetched
            } else {
                console.log("No cars found.");
            }
        } catch (error) {
            if (error.response) {
                // If error.response exists, it means the server responded with a status code that falls out of the range of 2xx
                if (error.response.status === 404) {
                    console.log("No cars available. 404 Not Found.");
                } else {
                    console.error("Error fetching cars:", error.response.data.message);  // Handle other errors
                }
            } else {
                console.error("Network error:", error.message);  // Handle network errors
            }
        }
    }


    // useEffect hook to load data when the component mounts
    useEffect(() => {
        // Fetch the current wallet address
        async function fetchAddress() {
            await getAddress();
        }

        fetchAddress();

        // Fetch car data from the backend only if data is not fetched yet
        if (!dataFetched) {
            getAllCars();
        }

        // Listen for account change in MetaMask and update the current address accordingly
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", async (accounts) => {
                if (accounts.length > 0) {
                    setCurrAddress(accounts[0]); 
                }
            });
        }

        // Cleanup listener when component unmounts
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", async (accounts) => {
                    setCurrAddress(accounts[0]);
                });
            }
        };
    }, [dataFetched]);  // Dependency on dataFetched to avoid re-fetching when unnecessary

    // Function to filter cars based on category
    const handleCategory = (e) => {
        const filterValue = e.target.value;
        if (filterValue === "All Categories" || filterValue === "") {
            setCars(allCars);
            return;
        }
        const filteredData = allCars.filter(
            (item) => item.category.toLowerCase() === filterValue.toLowerCase()  // Filter cars by selected category
        );
        setCars(filteredData); 
    };

    // Function to filter cars based on condition (new or used)
    const handleCondition = (e) => {
        const filterValue = e.target.value;
        if (filterValue === "All Condition" || filterValue === "") {
            setCars(allCars);
            return;
        }
        const filteredData = allCars.filter(
            (item) => item.car_condition.toLowerCase() === filterValue.toLowerCase()  // Filter cars by condition
        );
        setCars(filteredData);
    };

    // Function to filter cars based on the selected price range
    const handlePriceRangeChange = (e) => {
        const selectedMaxPrice = parseFloat(e.target.value); 
        setMaxPrice(selectedMaxPrice);  // Set the maximum price filter
        const filteredData = allCars.filter((item) => item.price <= selectedMaxPrice);
        setCars(filteredData);
    };

    // Function to reset all filters to their initial state
    const resetFilters = () => {
        setCars(allCars); 
        setSearch("");
        setMinPrice(0);
        setMaxPrice(10);
        document.querySelector(".all__category__filter select").value = "All Categories";  // Reset category filter to default
        document.querySelector(".filter__right select").value = "All Condition";  // Reset condition filter to default
    };

    // Filter the cars based on search input (by title)
    const filteredData = cars.filter((item) =>
        search.toLowerCase() === ""
            ? item  // Show all items if no search query
            : item.title.toLowerCase().includes(search.toLowerCase())  // Filter by car title
    );

    return (
        <>
            <CommonSection title="MarketPlace" />  {/* Render common section with title */}
            <section>
                <Container className="mainCon">  {/* Main container for the market section */}
                    <Row className="mainRow">
                        <Col lg="12" className="mainCol mb-5">
                            <div className="market__product__filter d-flex align-items-center gap-5">
                                {/* Search filter */}
                                <div className="Search__filter">
                                    <i className="ri-search-line"></i>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        onChange={(e) => setSearch(e.target.value)}  // Update search term when user types
                                    />
                                </div>

                                {/* Category filter */}
                                <div className="all__category__filter">
                                    <select onChange={handleCategory}>  {/* Dropdown to select category */}
                                        <option> All Categories </option>
                                        <option value="suv"> SUV </option>
                                        <option value="crossover"> Crossover</option>
                                        <option value="sedan"> Sedan</option>
                                        <option value="pickup_truck"> Pickup Truck </option>
                                        <option value="hatchback"> Hatchback </option>
                                        <option value="convertible"> Convertible</option>
                                        <option value="luxury"> Luxury</option>
                                        <option value="coupe"> Coupe </option>
                                        <option value="hybrid_electric"> Hybrid/Electric </option>
                                        <option value="minivan"> Minivan</option>
                                        <option value="sports_car"> Sports Car</option>
                                        <option value="station_wagon"> Station Wagon </option>
                                    </select>
                                </div>

                                {/* Condition filter */}
                                <div className="filter__right">
                                    <select onChange={handleCondition}>  {/* Dropdown to select car condition */}
                                        <option> All Condition </option>
                                        <option value="new"> New </option>
                                        <option value="used"> Used </option>
                                    </select>
                                </div>

                                {/* Price filter */}
                                <div className="price-range-filter">
                                    <label>Max Price: {maxPrice} ETH</label>
                                    <div className="range-slider-container">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={maxPrice}
                                            onChange={handlePriceRangeChange}  // Update price range when slider is changed
                                            className="range-slider"
                                        />
                                    </div>
                                </div>

                                {/* Reset filters button */}
                                <div className="">
                                    <button className="rm_btn" onClick={resetFilters}>  {/* Button to reset all filters */}
                                        <i className="ri-delete-bin-line"></i> Remove Filter
                                    </button>
                                </div>
                            </div>
                        </Col>

                        {/* Display filtered cars */}
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <Col lg="3" md="4" sm="6" className="mb-4" key={item.token_id}>
                                    <CarCard item={item} currAddress={currAddress}  />  {/* Display car card */}
                                </Col>
                            ))
                        ) : (
                            <Col lg="12">
                                <p className="text-white text-center">No Cars Available</p>  {/* Message when no cars match the filter */}
                            </Col>
                        )}
                    </Row>
                </Container>
            </section>
        </>
    );
}

export default Market;
