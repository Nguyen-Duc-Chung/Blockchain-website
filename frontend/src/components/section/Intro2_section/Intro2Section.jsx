import React from 'react'; // Importing React
import { Container, Row, Col } from 'reactstrap'; // Importing layout components from reactstrap
import { Link } from 'react-router-dom'; // Importing Link for navigation within the app
import "./intro2_section.css"; // Importing custom CSS styles for this component
import buysell from '../../../assets/images/buysell.jpg'; // Importing image for the intro section

function Intro2Section() {
    return(
        <>
        <section className="intro2_section">
            {/* The section wraps the content of the second introductory part */}
            <Container>
                <Row>
                    {/* The Row is divided into two columns */}
                    <Col lg='6' md='6'>
                        <div className="intro2_content">
                            {/* The content section on the left side */}
                            <h2>
                                 BUY and SELL your car Quickly and Trusted with <span>HorsePower</span>
                            </h2>
                            <p>
                                Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
                                Alias molestias quos adipisci, libero cum magnam facilis quam eius, sequi aliquam,
                            </p>
                            <div className="intro2__btns d-flex align-items-center gap-4">
                                {/* Button container with two buttons */}
                                <button className="explore_btn d-flex align-items-center gap-2">
                                    {/* Button to navigate to the Market */}
                                    <i className="ri-shopping-cart-line"></i>{" "}
                                    <Link to='/market'>Market</Link>
                                </button>
                                <button className="create_btn d-flex align-items-center gap-2">
                                    {/* Button to navigate to the Create page */}
                                    <i className="ri-ball-pen-line"></i>{" "}
                                    <Link to='/create'>Create</Link>
                                </button>
                            </div>
                        </div>
                    </Col>

                    <Col lg='6' md='6'>
                        <div className="intro2_img">
                            {/* The image container on the right side */}
                            <img src={buysell} alt="Introduction part 2 Image" className=" intro2_img w-100" />
                            {/* The image is displayed with a width of 100% */}
                        </div>
                    </Col>

                </Row>
            </Container>
        </section>
        </>
    );
}

export default Intro2Section;
