import React from 'react'; // Import React to build the component
import { Container, Row, Col } from 'reactstrap'; // Import layout components from reactstrap
import { DATA_CARS } from '../../../assets/data/data'; // Import car data from assets/data.js
import CarCard from '../Car_card/CarCard'; // Import CarCard component to display each car's info
import './trending.css'; // Import custom styles for the Trending component

function Trending() {
    return (
        <>
            {/* Main section for displaying trending cars */}
            <section>
                <Container>
                    {/* Row containing the title of the section */}
                    <Row>
                        <Col lg='12' className='mb-5'>
                            <h3 className="trending_title">Trending</h3> {/* Trending section title */}
                        </Col>

                        {/* Mapping through the first 8 items from DATA_CARS and displaying each as a CarCard */}
                        {
                            DATA_CARS.slice(0, 8).map(item => (
                                <Col lg='3' md='4' sm='6' key={item.id} className='mb-4'>
                                    <CarCard item={item} /> {/* Displaying each car using the CarCard component */}
                                </Col>
                            ))
                        }
                    </Row>
                </Container>
            </section>
        </>
    );
}

export default Trending;
