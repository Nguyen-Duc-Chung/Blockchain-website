import React, { useEffect } from 'react'; // Importing React and useEffect hook
import { Container, Row, Col } from 'reactstrap'; // Importing container and row/col components for layout
import "./intro1_section.css"; // Import custom CSS for styling
import introImg1 from '../../../assets/images/intro/intro-01.jpg'; // Importing images for the slider
import introImg2 from '../../../assets/images/intro/intro-02.jpg';
import introImg3 from '../../../assets/images/intro/intro-03.jpg';
import introImg4 from '../../../assets/images/intro/intro-04.jpg';

function IntroSection() {

    // useEffect runs once when the component mounts
    useEffect(() => {
        // Getting references for DOM elements
        let nextBtn = document.querySelector('.next'); // Next button for slider navigation
        let prevBtn = document.querySelector('.prev'); // Previous button for slider navigation
        let slider = document.querySelector('.slider'); // The main slider container
        let sliderList = slider.querySelector('.slider .list'); // List of all slider items
        let thumbnail = document.querySelector('.slider .thumbnail'); // Thumbnail navigation for the slider
        let thumbnailItems = thumbnail.querySelectorAll('.item'); // All the thumbnails

        // Append the first thumbnail item to the end to make the carousel work smoothly
        thumbnail.appendChild(thumbnailItems[0]);

        // Function to handle the next button click
        nextBtn.onclick = function () {
            moveSlider('next');
        };

        // Function to handle the previous button click
        prevBtn.onclick = function () {
            moveSlider('prev');
        };

        // Function to move the slider based on direction ('next' or 'prev')
        function moveSlider(direction) {
            let sliderItems = sliderList.querySelectorAll('.item'); // All the items in the slider list
            let thumbnailItems = document.querySelectorAll('.thumbnail .item'); // All the thumbnail items

            // Move items in the list for the 'next' direction
            if (direction === 'next') {
                sliderList.appendChild(sliderItems[0]); // Move the first item to the end of the list
                thumbnail.appendChild(thumbnailItems[0]); // Move the first thumbnail to the end
                slider.classList.add('next'); // Add the 'next' class to trigger animation
            } else {
                sliderList.prepend(sliderItems[sliderItems.length - 1]); // Move the last item to the beginning
                thumbnail.prepend(thumbnailItems[thumbnailItems.length - 1]); // Move the last thumbnail to the beginning
                slider.classList.add('prev'); // Add the 'prev' class to trigger animation
            }

            // Remove the animation class after the animation is complete
            slider.addEventListener('animationend', function () {
                if (direction === 'next') {
                    slider.classList.remove('next');
                } else {
                    slider.classList.remove('prev');
                }
            }, { once: true }); // Ensure that this event listener is removed after it's triggered
        }
    }, []); // The effect only runs once after the component mounts

    return (
        <>
            {/* Main section of the intro with a slider */}
            <section className="intro__section">
                <Container className="slider">
                    <Row>
                        <Col lg='12' md='12'>
                            {/* The list of slider items */}
                            <div className="list">
                                <div className="item">
                                    <img src={introImg1} alt="Intro Image 1" />
                                    <div className="content">
                                        <div className="title">Horsepower</div>
                                        <div className="description">
                                            Revolutionizing car transactions with blockchain – secure, transparent, and zero extra fees.
                                        </div>
                                    </div>
                                </div>

                                <div className="item">
                                    <img src={introImg2} alt="Intro Image 2" />
                                    <div className="content">
                                        <div className="title">AutoBlock</div>
                                        <div className="description">
                                            Decentralized car trading made simple, fast, and reliable.
                                        </div>
                                    </div>
                                </div>

                                <div className="item">
                                    <img src={introImg3} alt="Intro Image 3" />
                                    <div className="content">
                                        <div className="title"> CarVault </div>
                                        <div className="description">
                                            The future of car deals – transparent, secure, and fee-free.
                                        </div>
                                    </div>
                                </div>

                                <div className="item">
                                    <img src={introImg4} alt="Intro Image 4" />
                                    <div className="content">
                                        <div className="title"> Torque </div>
                                        <div className="description">
                                            Empowering car buyers and sellers with Web3 technology.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail navigation for the slider */}
                            <div className="thumbnail">
                                <div className="item">
                                    <img src={introImg1} alt="Thumbnail 1" />
                                </div>
                                <div className="item">
                                    <img src={introImg2} alt="Thumbnail 2" />
                                </div>
                                <div className="item">
                                    <img src={introImg3} alt="Thumbnail 3" />
                                </div>
                                <div className="item">
                                    <img src={introImg4} alt="Thumbnail 4" />
                                </div>
                            </div>

                            {/* Next and Previous arrows */}
                            <div className="nextPrevArrows">
                                <button className="prev"> &#8592; </button>
                                <button className="next"> &#8594; </button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
}

export default IntroSection;
