// src/app/layout.tsx
import './globals.css';
import Head from 'next/head';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Head>
      <title>Página Principal - Estudiante</title>
    </Head>
    <div>
      {children}
    </div>
  </>
);

export default Layout;
