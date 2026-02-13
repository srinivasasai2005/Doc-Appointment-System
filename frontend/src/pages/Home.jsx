import React from 'react'

import Header from '../components/Home/Header.jsx'
import SpecialityMenu from '../components/Home/SpecialityMenu.jsx'
import TopDoctors from '../components/Home/TopDoctors.jsx'
import Banner from '../components/Home/Banner.jsx'

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home