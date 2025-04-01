import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { databases, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string;

// ✅ GET all customers
export async function GET() {
  const authData = await auth(); // FIXED: Await auth()
  if (!authData || !authData.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await databases.listDocuments(databaseId, collectionId, [
    Query.equal("userId", authData.userId),
  ]);

  return NextResponse.json(customers.documents);
}

// ✅ POST - Add new customer
export async function POST(req: Request) {
  const authData = await auth(); // FIXED: Await auth()
  if (!authData || !authData.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, phone, status } = await req.json();
  const newCustomer = await databases.createDocument(databaseId, collectionId, ID.unique(), {
    userId: authData.userId, // FIXED: Accessing userId correctly
    name,
    email,
    phone,
    status,
  });

  return NextResponse.json(newCustomer);
}

// ✅ DELETE - Remove a customer
export async function DELETE(req: Request) {
  const authData = await auth(); // FIXED: Await auth()
  if (!authData || !authData.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await databases.deleteDocument(databaseId, collectionId, id);

  return NextResponse.json({ success: true });
}
