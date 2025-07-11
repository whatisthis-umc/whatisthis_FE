import React from 'react';
import AdminNavbar from '../components/AdminNavbar';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="min-h-screen">
      <AdminNavbar />
      <main className="p-4">{children}</main>
    </div>
  );
}
