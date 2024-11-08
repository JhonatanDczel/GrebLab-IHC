// src/pages/login.tsx
import React from 'react';
import LoginForm from '../app/components/LoginForm';
import Layout from '../app/layout';

const LoginPage: React.FC = () => {
  return (
    <Layout>
      <LoginForm />
    </Layout>
  );
};

export default LoginPage;
