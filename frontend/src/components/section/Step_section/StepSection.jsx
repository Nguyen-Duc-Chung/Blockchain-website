import React from 'react'; // Import React to build the component
import { Container, Row, Col } from 'reactstrap'; // Import layout components from reactstrap
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for navigation
import './step_section.css'; // Import the CSS styles for the StepSection

// Step information including title, description, and icon for each step
const STEP_INFOR = [
    {
        title: 'Setup your wallet',
        desc: `Connect your crypto wallet to securely manage your 
               transactions and access the Horsepower platform.`,
        icon: 'ri-wallet-line' // Wallet icon
    },
    {
        title: 'Create your collection',
        desc: `Organize and showcase your cars effortlessly in a 
               personalized collection on our decentralized platform.`,
        icon: 'ri-layout-line' // Layout icon
    },
    {
        title: 'Add your Car images',
        desc: `Upload high-quality images of your car to attract potential
               buyers with stunning visuals  on our decentralized platform.`,
        icon: 'ri-image-line' // Image icon
    },
    {
        title: 'List them for sale',
        desc: `Set your desired price and list your car on the marketplace 
               for a global audience to see and decide to buy.`,
        icon: 'ri-list-check' // List check icon
    },
];

// The main component to render the StepSection
function StepSection() {
    return (
        <>
            {/* The main section containing the steps */}
            <section>
                <Container>
                    <Row>
                        {/* The section title */}
                        <Col lg='12' className='mb-4'>
                            <h3 className="step_title">
                                Create and sell your Cars
                            </h3>
                        </Col>

                        {/* Mapping through the STEP_INFOR array to display each step */}
                        {
                            STEP_INFOR.map((item, index) =>
                                <Col lg='3' md='4' sm='6' key={index} className='mb-4'>
                                    {/* Each step card */}
                                    <div className="step_card">
                                        {/* Icon for each step */}
                                        <span><i className={item.icon}></i></span>
                                        <div className="step_content">
                                            {/* Step title with a link to the wallet page */}
                                            <h5>
                                                <Link to='/wallet'>{item.title}</Link>
                                            </h5>
                                            {/* Step description */}
                                            <p className="mb-2">{item.desc}</p>
                                        </div>
                                    </div>
                                </Col>
                            )
                        }
                    </Row>
                </Container>
            </section>
        </>
    );
}

export default StepSection;
