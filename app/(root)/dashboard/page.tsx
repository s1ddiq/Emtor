"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  cn,
  formatPhoneNumber,
  hasNumbers,
  validatePhoneNumber,
} from "@/lib/utils";
import {
  addCustomer,
  deleteCustomer,
  updateStatus,
  fetchCustomers,
  editCustomerNotes,
  fetchNotes,
  editCustomerDetails,
} from "@/lib/appwrite";
import { Pencil, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { debounce } from "lodash";

interface Customer {
  $id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  userId: string;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Pending");
  const [notes, setNotes] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedCustomerNotes, setSelectedCustomerNotes] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadCustomers() {
      const customersData = user ? await fetchCustomers(user.id) : [];
      if (customersData) {
        setCustomers(
          customersData.map((doc) => ({
            $id: doc.$id,
            name: doc.name,
            email: doc.email,
            phone: doc.phone,
            status: doc.status,
            userId: doc.userId,
          }))
        );
      }
    }

    loadCustomers();
  }, [user, isLoaded]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      const newCustomer = await addCustomer(
        name,
        email,
        phone,
        status,
        user.id
      );
      const customer: Customer = {
        $id: newCustomer.$id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        status: newCustomer.status,
        userId: newCustomer.userId,
      };
      setCustomers([...customers, customer]);

      setName("");
      setEmail("");
      setPhone("");
      setStatus("Pending");
      toast(`Customer ${name} has been added`);
    } catch (error) {
      console.error("Failed to add customer:", error);
      toast("Failed to add customer");
    }
  }

  async function handleChangeStatus(id: string, newStatus: string) {
    await updateStatus(id, newStatus);
    setCustomers((prev) =>
      prev.map((c) => (c.$id === id ? { ...c, status: newStatus } : c))
    );

    // If the selected customer is the one being updated, update it too
    setSelectedCustomer((prev) =>
      prev && prev.$id === id ? { ...prev, status: newStatus } : prev
    );
  }

  async function handleDeleteCustomer(id: string) {
    if (!selectedCustomer) return;
    await deleteCustomer(
      id,
      selectedCustomer?.name || "",
      selectedCustomer?.email || "",
      selectedCustomer?.phone || "",
      selectedCustomer?.status || "",
      user?.id || ""
    );
    setCustomers((prev) => prev.filter((c) => c.$id !== id));
    setSelectedCustomer(null);
    toast(`Customer ${selectedCustomer?.name} has been deleted`);
  }

  async function handleFetchNotes(id: string) {
    const res = await fetchNotes(id);
    setSelectedCustomerNotes(res[0]?.notes || "");
  }

  async function handleEditCustomerDetails(
    id: string,
    value: string,
    type: "name" | "phone" | "email"
  ) {
    try {
      await editCustomerDetails(id, { [type]: value });
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.$id === id ? { ...customer, [type]: value } : customer
        )
      );
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
    }
  }

  const handleNotesChange = useRef(
    debounce(async (id: string, note: string) => {
      await editCustomerNotes(id, note);
    }, 500)
  ).current;

  return (
    <div
      className={`pt-8 w-full mx-auto ${
        theme === "dark" ? "bg-transparent text-white" : "text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Your Customers</h1>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-4 font-bold border-b pb-2">
          <p>Full Name</p>
          <p>Email</p>
          <p>Phone Number</p>
          <p>Status</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-4 gap-4 mt-2 items-center"
        >
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) =>
              !hasNumbers(e.target.value) && setName(e.target.value)
            }
            maxLength={28}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={32}
            required
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            maxLength={16}
            required
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded col-span-4"
          >
            Add Customer
          </button>
        </form>
      </div>

      <div className="mt-6 border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Active Customers</h2>
        <div className="grid grid-cols-4 font-bold border-b pb-2">
          <p>Name</p>
          <p>Email</p>
          <p>Phone</p>
          <p>Status</p>
        </div>
        {customers.map((customer) => (
          <Dialog key={customer.$id}>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "grid grid-cols-4 border-b py-2 hover:opacity-85 cursor-pointer",
                  theme === "light" ? "border-gray-900" : "border-gray-700"
                )}
                onClick={() => {
                  setSelectedCustomer(customer);
                  handleFetchNotes(customer.$id);
                }}
              >
                <p>{customer.name}</p>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
                <p
                  className={cn(
                    customer.status === "Approved"
                      ? "text-green-600 dark:text-green-400"
                      : customer.status === "On Hold"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {customer.status}
                </p>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedCustomer?.name}</DialogTitle>
              </DialogHeader>
              <div>
                <p>Email: {selectedCustomer?.email}</p>
                <p>Phone: {selectedCustomer?.phone}</p>
                <h2 className="mt-4">Notes</h2>
                <Textarea
                  placeholder="Enter notes about the user"
                  value={selectedCustomerNotes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    handleNotesChange(selectedCustomer!.$id, e.target.value);
                  }}
                />
              </div>
              <div className="flex justify-between">
                <Select
                  value={selectedCustomer?.status}
                  onValueChange={(value) =>
                    handleChangeStatus(selectedCustomer!.$id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Trash
                  className="cursor-pointer"
                  onClick={() => handleDeleteCustomer(selectedCustomer!.$id)}
                />
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
