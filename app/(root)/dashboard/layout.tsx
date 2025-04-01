"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { UserButton } from "@clerk/nextjs";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-900 text-white w-64 p-4 transform ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 md:relative md:translate-x-0`}
      >
        <button onClick={() => setIsOpen(false)} className="md:hidden absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold mb-6">CRM Dashboard</h1>
        <nav className="space-y-4">
          <Link href="/dashboard" className="block p-2 hover:bg-gray-700 rounded">
            Home
          </Link>
          <Link href="/dashboard/customers" className="block p-2 hover:bg-gray-700 rounded">
            Customers
          </Link>
          <Link href="/dashboard/mailing-list" className="block p-2 hover:bg-gray-700 rounded">
            Mailing List
          </Link>
          <Link href="/dashboard/settings" className="block p-2 hover:bg-gray-700 rounded">
            Settings
          </Link>
          <Link href="/dashboard/trash" className="block p-2 hover:bg-gray-700 rounded">
            Trash
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <button onClick={() => setIsOpen(true)} className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded bg-gray-200 dark:bg-gray-700">
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <UserButton/>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
