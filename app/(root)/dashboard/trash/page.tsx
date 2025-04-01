'use client'
import { deletedCustomers } from '@/lib/appwrite';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react'

// Define the Customer type
type Customer = {
    $id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    userId: string;
};

const Trash = () => {
    const { user, isLoaded } = useUser();
     const [removedCustomers, setRemovedCustomers] = useState<Customer[]>([]);
     
    useEffect(() => {
    if (!isLoaded || !user) return;
        async function fetchDeletedCustomers() {
            if (user && user.id) {
                const res = await deletedCustomers(user.id);
                setRemovedCustomers(
                    (res || []).map((doc: any) => ({
                        $id: doc.$id,
                        name: doc.name,
                        email: doc.email,
                        phone: doc.phone,
                        status: doc.status,
                        userId: doc.userId,
                    }))
                );
                return res;
            }
        }
        fetchDeletedCustomers();
    }, [user, isLoaded])
  return (
    <div
      className="pt-8 w-full mx-auto"
    >
        <h1 className="text-2xl font-bold mb-4">Trash</h1>
        <h2 className="text-xl font-bold mb-4">Recently Deleted Customers</h2>

        <div className='space-y-4'>
            {removedCustomers.map((customer: any) => (
                <div key={customer.id}>
                    <div className='flex flex-row justify-between pr-8 border p-2 rounded-lg'>

                    <p className='capitalize'>{customer.name}</p>
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                    <p>{customer.status}</p>
                    </div>
                </div>
            ))}
            </div>
    </div>
  )
}

export default Trash
