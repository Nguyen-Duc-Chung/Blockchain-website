import React from "react";
import { Container } from "reactstrap";
import Intro1Section from "../components/section/Intro1_section/Intro1Section";
import Intro2Section from "../components/section/Intro2_section/Intro2Section";
import LiveAuction from "../components/section/Live_auction/LiveAuction";
import Trending from "../components/section/Trending_section/Trending";
import StepSection from "../components/section/Step_section/StepSection";


function Home() {
    return(
        <>
        <Intro1Section/>
        <Intro2Section/>
        <LiveAuction />
        <Trending />
        <StepSection />
        </>
    );
}

export default Home;