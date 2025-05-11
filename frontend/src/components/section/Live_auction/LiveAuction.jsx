import React from 'react';  // Importing React
import { Container, Row, Col } from 'reactstrap';  // Importing layout components from reactstrap
import { Link } from 'react-router-dom';  // Importing Link for navigation within the app
import './live_auction.css';  // Importing custom CSS styles for this component

import CarCard from "../Car_card/CarCard.jsx";  // Importing CarCard component to display individual car items
import { DATA_CARS } from "../../../assets/data/data.js";  // Importing car data from an external file

function LiveAuction() {
    return(
        <>
        <section>
            {/* Main container for the Live Auction section */}
            <Container>
                <Row>
                    {/* Header row with the title and a "See More" button */}
                    <Col lg='12' className='mb-4'>
                        <div className="live_auction_top d-flex align-items-center">
                            {/* Title of the section */}
                            <h3>Live Auction</h3>

                            {/* Button to navigate to the market page */}
                            <button className="more_btn">
                                <i className="ri-arrow-up-double-line"></i>
                                <Link to={`/market`}>See More</Link>  {/* Link to navigate to the /market page */}
                            </button>
                        </div>
                    </Col>

                    {/* Mapping through the first 4 cars from the DATA_CARS array and displaying them */}
                    {DATA_CARS.slice(0, 4).map((item) => (
                        <Col lg='3' md='4' sm='6' className="mb-4" key={item.id}>
                            {/* CarCard component used to display each car */}
                            <CarCard key={item.id} item={item} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
        </>
    );
}

export default LiveAuction;
