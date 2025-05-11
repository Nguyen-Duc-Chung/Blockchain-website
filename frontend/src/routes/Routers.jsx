import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/Home'
import Market from '../pages/Market'
import Create from '../pages/Create'
import TransHistory from '../pages/TransHistory'
import Profile from '../pages/Profile'
import CarDetails from '../pages/CarDetails'

function Router () {
    return(
       <Routes>
        <Route path='/' element={<Navigate to = '/home' />} />

        <Route path='/home' element={<Home/>} />
        <Route path='/market' element={<Market/>} />
        <Route path='/create' element={<Create/>} />
        <Route path='/transaction-history' element={<TransHistory/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/cars/:token_id' element={<CarDetails/>} />

       </Routes>
    );
}
export default Router