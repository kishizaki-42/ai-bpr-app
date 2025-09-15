"use client";
import { Toaster } from 'react-hot-toast';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {children}
    </>
  );
}

