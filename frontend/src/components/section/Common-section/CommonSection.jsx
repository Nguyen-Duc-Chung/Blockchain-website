import react from 'react';
import './common-section.css';  // Import the CSS file for styling the component

import { Container } from 'reactstrap';  // Import Container component from reactstrap for responsive layout

// Functional component that accepts a 'title' prop
function CommonSection({ title }) {
    return (
        <>
            {/* Section wrapper for the title */}
            <section className="title_section"> 
                {/* Container from reactstrap to center the content */}
                <Container className="text-center">
                    {/* Display the passed title inside an h2 element */}
                    <h2>{title}</h2>
                </Container>
            </section>
        </>
    );
}

export default CommonSection;
