import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/section/Common-section/CommonSection"; 
import DatePicker from "react-datepicker";  // Import DatePicker component for selecting dates
import "react-datepicker/dist/react-datepicker.css"; 
import axios from "axios"; 
import "../styles/trans-history.css";
import { ethers } from "ethers";  // Ethers.js for interacting with Ethereum blockchain

function TransHistory() {
    // State variables
    const [transactions, setTransactions] = useState([]);  
    const [filteredTransactions, setFilteredTransactions] = useState([]);  // Filtered list of transactions based on search and date range
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);  // End date for filtering transactions (calculated based on the selected start date)
    const [address, setAddress] = useState("");  

    // Fetch transaction data based on the wallet address
    async function getTransactionData() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);  // Ethereum provider to interact with MetaMask
            const accounts = await provider.listAccounts(); 

            if (accounts.length > 0) {
                const addr = accounts[0];  // Use the first account as the current wallet address
                setAddress(addr);

                // Fetch transaction history from the backend based on the wallet address
                const response = await axios.get(`http://localhost:8800/transactions?wallet_address=${addr}`);
                const fetchedTransactions = response.data;

                // Map fetched transactions to desired structure
                const items = fetchedTransactions.data.map((transaction) => {
                    return {
                        price: transaction.price,
                        tokenId: transaction.token_id,
                        buyer: transaction.buyer,
                        seller: transaction.seller,
                        transactionDate: new Date(transaction.transaction_date).toLocaleString(),
                    };
                });

                // Set the transactions and filtered transactions
                setTransactions(items);
                setFilteredTransactions(items);
            } else {
                console.log("No wallet connected.");
            }
        } catch (error) {
            console.error("Error fetching transaction data:", error);
        }
    }

    // Filter transactions based on search input (buyer or seller) and date range
    useEffect(() => {
        const filtered = transactions.filter((transaction) => {
            // Filter by search input (buyer or seller)
            return (
                transaction.buyer.toLowerCase().includes(search.toLowerCase()) ||
                transaction.seller.toLowerCase().includes(search.toLowerCase())
            );
        });

        // If start and end dates are selected, filter transactions by date range
        if (startDate && endDate) {
            const dateFiltered = filtered.filter((transaction) => {
                const transactionDate = new Date(transaction.transactionDate);  
                return transactionDate >= startDate && transactionDate <= endDate; 
            });
            setFilteredTransactions(dateFiltered);
        } else {
            setFilteredTransactions(filtered);  // If no date range, display filtered transactions by search
        }
    }, [transactions, search, startDate, endDate]);  // Re-run effect when any of these dependencies change

    // Function to reset all filters
    const handleRemoveFilters = () => {
        setSearch("");  
        setStartDate(null); 
        setEndDate(null);
    };

    // Fetch transaction data when component mounts and on account change
    useEffect(() => {
        getTransactionData();

        // Listen for changes in the MetaMask account and fetch new transaction data if the account changes
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", async (accounts) => {
                if (accounts.length > 0) {
                    const addr = accounts[0];
                    setAddress(addr);
                    await getTransactionData();
                }
            });
        }
    }, []);  // Only run this effect once when the component mounts

    return (
        <>
            {/* CommonSection component is used to display a common header with the title */}
            <CommonSection title="Transaction History" />
            <Container className="history__container">
                {/* Filter Section */}
                <Row className="filter-section">
                    <Col lg="12" className="filter-spec d-flex justify-content-start gap-4 align-items-center">
                        {/* Date Filter */}
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}  // Set the start date when user selects a date
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Start Date"
                            className="filter-btn"
                        />
                        {/* Automatically calculate the end date based on the start date */}
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}  // Set the end date when user selects a date
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}  // End date cannot be earlier than start date
                            placeholderText="End Date"
                            className="filter-btn"
                        />

                        {/* Remove Filter Button */}
                        <button onClick={handleRemoveFilters} className="remove-filter-btn">Remove Filter</button>
                    </Col>
                </Row>

                {/* Transaction Table */}
                <Row>
                    <Col lg="12">
                        <div className="history-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Buyer</th>
                                        <th>Seller</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Display filtered transactions */}
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((transaction, index) => (
                                            <tr key={index}>
                                                <td>{transaction.buyer}</td>
                                                <td>{transaction.seller}</td>
                                                <td>{transaction.transactionDate}</td>
                                                <td>{transaction.price} ETH</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">No Transactions Available</td>  {/* Show when no transactions are found */}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default TransHistory;
