import React from 'react'
import Routers from '../../routes/Routers'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

function Layout(props){
    return(
        <>
            <Header/>
            <div>
                <Routers/> 
            </div>
            <Footer />
        </>
    );

}

export default Layout