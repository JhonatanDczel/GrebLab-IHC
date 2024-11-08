// src/pages/homepage.tsx
import React from 'react';
import HomePage from '../app/components/Homepage';
import Layout from '../app/layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

export default Home;
