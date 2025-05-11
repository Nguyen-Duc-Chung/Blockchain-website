import React from 'react';
import { Link } from 'react-router-dom';
import './car_card.css';

function CarCard({ item, currAddress }) {
    // Destructure the relevant fields from the 'item' prop
    const { title, token_id, price, image_path, owner } = item;

    // Check if the current address is the owner of the car
    // 'toLowerCase()' ensures comparison is case-insensitive
    const isOwner = owner && currAddress && currAddress.toLowerCase() === owner.toLowerCase();

    // Construct the image URL (fallback image in case the image path is missing or fails to load)
    const imageUrl = image_path ? `http://localhost:8800${image_path}` : item.imgUrl;

    return (
        <>
            <div className="main_card_car">
                {/* Display car image */}
                <div className="car_img">
                    <img src={imageUrl} alt="Car" className="w-100" onError={(e) => e.target.src = "/fallback-image.jpg"} />
                </div>

                <div className="car_bried_info">
                    {/* Display car title as a clickable link */}
                    <h5 className="car_title">
                        <Link to={`/cars/${token_id}`}>{title}</Link>
                    </h5>

                    <div className="creator_container d-flex gap-3">
                        <div className="creator_infor w-100 d-flex align-items-center justify-content-between">
                            <div className="w-50">
                                {/* Display the owner's address */}
                                <h6>Owner</h6>
                                <p>
                                    {owner && owner !== "0x"
                                        ? (owner.substring(0, 5) + '...' + owner.substring(owner.length - 4)) // Shortened owner address for readability
                                        : "Unknown Owner"}
                                </p>
                            </div>
                            <div className="w-50">
                                {/* Display the car's price */}
                                <h6>Price</h6>
                                <p>{price} ETH</p>
                            </div>
                        </div>
                    </div>

                    <div className="cardBtn mt-3 d-flex align-items-center justify-content-around">
                        {/* Only show "Owned" if the current address matches the car's owner */}
                        {currAddress !== "0x" && isOwner && (
                            <div className="Owner d-flex align-items-center gap-1">
                                <i className="ri-triangular-flag-fill"></i> Owned
                            </div>
                        )}

                        {/* Link to the car's detailed page */}
                        <button className="detail_btn">
                            <i className="ri-info-i"></i>
                            <Link to={`/cars/${token_id}`}>View Details</Link>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CarCard;
