import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import { Container } from "reactstrap";
import { Link, NavLink } from "react-router-dom";
import { ethers } from "ethers"; 
import blockies from 'ethereum-blockies';  // Added for wallet avatar generation

// Navigation links for the header menu
const NAV__LINKS = [
    { display: 'Home', url: '/home' },
    { display: 'Market', url: '/market' },
    { display: 'Create', url: '/create' },
    { display: 'Transaction History', url: '/transaction-history' },
    { display: 'Profile', url: '/profile' },
];

function Header() {
    // Reference to menu for toggling its visibility
    const menuRef = useRef(null);
    const toggleMenu = () => menuRef.current.classList.toggle('active__menu'); // Toggle active menu class for mobile view

    // States to handle wallet connection, address, balance, and avatar
    const [connected, setConnected] = useState(false);
    const [currAddress, setCurrAddress] = useState('0x');
    const [ethBalance, setEthBalance] = useState("0.000");
    const [avatar, setAvatar] = useState(null);  // State for wallet avatar

    // Fetch wallet address and balance
    async function getAddress() {
        if (!window.ethereum) {
            console.log("MetaMask is not installed.");
            return;
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_accounts", []);
            if (accounts.length > 0) {
                setCurrAddress(accounts[0]);
                setConnected(true);

                // Fetch ETH balance
                const balance = await provider.getBalance(accounts[0]);
                const formattedBalance = ethers.utils.formatEther(balance);

                setEthBalance(parseFloat(formattedBalance).toFixed(4)); // Show balance up to 4 decimal places
            } else {
                console.log("No accounts connected.");
            }
        } catch (error) {
            console.error("Error getting address:", error);
        }
    }

    // Generate Ethereum blockies avatar based on wallet address
    function generateAvatar(address) {
        const imgSrc = blockies.create({ seed: address.toLowerCase(), size: 8, scale: 4 }).toDataURL();
        setAvatar(imgSrc);
    }

    // Connect wallet to the website
    async function connectWebsite() {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to connect.");
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            getAddress();
        } catch (error) {
            if (error.code === 4001) {
                console.warn("User rejected the connection request.");
                alert("You denied the wallet connection. Please try again.");
            } else {
                console.error("Error connecting wallet:", error);
            }
        }
    }

    // Disconnect wallet from the website
    async function disconnectWallet() {
        setConnected(false);
        setCurrAddress('0x');
        setEthBalance("0.000");
        setAvatar(null); // Reset avatar on disconnect

        // Attempt to disconnect provider (MetaMask does not provide direct disconnect)
        if (window.ethereum && window.ethereum.request) {
            try {
                await window.ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [{ eth_accounts: {} }],
                });
            } catch (error) {
                console.error("Error disconnecting wallet:", error);
            }
        }

        // Reload the page to ensure a fresh state
        window.location.reload();
    }

    // Check if wallet is connected on page load
    useEffect(() => {
        async function checkConnection() {
            if (!window.ethereum) {
                console.log("MetaMask is not installed.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_accounts", []);

            if (accounts.length > 0) {
                console.log("Wallet connected:", accounts[0]);
                setCurrAddress(accounts[0]);
                setConnected(true);
                generateAvatar(accounts[0]); // Generate avatar on wallet connect
            } else {
                setConnected(false);
                console.log("No wallet connected.");
            }
        }

        checkConnection();

        // Listen for changes in the connected account
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length > 0) {
                    setCurrAddress(accounts[0]);
                    setConnected(true);
                    generateAvatar(accounts[0]); // Update avatar on account change
                
                    // Fetch updated balance
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const balance = await provider.getBalance(accounts[0]);
                    const formattedBalance = ethers.utils.formatEther(balance);

                    setEthBalance(parseFloat(formattedBalance).toFixed(4));
                } else {
                    setCurrAddress('0x');
                    setConnected(false);
                    setEthBalance("0.000");
                    setAvatar(null);
                }
            });
        }
    }, []);

    return (
        <header className="header d-flex align-items-center">
            <Container className="Container">
                <div className="navigation">
                    {/* Logo Section */}
                    <div className="logo">
                        <h2 className="d-flex gap-2 align-items-center">
                            <span><i className="ri-car-fill"></i></span>
                            HorsePower
                        </h2>
                    </div>

                    {/* Menu Section */}
                    <div className="nav__menu" ref={menuRef} onClick={toggleMenu}>
                        <ul className="nav__list">
                            {NAV__LINKS.map((item, index) => (
                                <li className="nav__item" key={index}>
                                    <NavLink to={item.url} className={({ isActive }) => (isActive ? 'active' : '')}>
                                        {item.display}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Side (Wallet Connection/Disconnect) */}
                    <div className="nav__right d-flex align-items-center">
                        {/* Connect Wallet Button */}
                        {!connected && (
                            <div className="demo">
                                <button className="btn d-flex gap-2 align-items-center" onClick={connectWebsite}>
                                  <span>
                                    <i className="ri-wallet-line"></i>
                                  </span>
                                    Connect Wallet
                                </button>
                            </div>
                        )}

                        {/* Wallet Info if Connected */}
                        {connected && (
                            <div className="wallet-container">
                                <div className="acc_spec text-white text-bold text-right mr-10 text-sm">
                                    <div className="acc_address">
                                        <span>
                                            <i className="ri-wallet-3-fill"></i>
                                            {currAddress !== "0x" ? (currAddress.substring(0, 5) + '...' + currAddress.substring(currAddress.length - 4)) : ""}
                                        </span>
                                    </div> 
                                    <div className="acc_view">
                                    <i className="ri-eye-fill"></i>
                                    More
                                    </div>
                                </div>

                                {/* Popup Wallet Details */}
                                <div className="wallet-popup">
                                    <div className="wallet-popup-header">
                                        <div className="wallet-avatar">
                                            <img src={avatar} alt="Wallet Avatar" />
                                        </div>
                                        <span className="wallet-popup-address">
                                            {currAddress}
                                        </span>
                                        <span className="wallet-balance">{ethBalance} ETH </span>
                                    </div>
                                    <div className="wallet-popup-body">
                                        {/* Profile Button */}
                                        <button className="profile-btn">
                                            <span><i className="ri-user-3-line"></i></span> 
                                            <Link to={`/profile`} > Profile </Link>
                                        </button>

                                        {/* Disconnect Button */}
                                        <button className="disconnect-btn" onClick={disconnectWallet}>
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <span className="mobile__menu">
                            <i className="ri-menu-line" onClick={toggleMenu}></i>
                        </span>
                    </div>
                </div>
            </Container>
        </header>
    );
}

export default Header;
