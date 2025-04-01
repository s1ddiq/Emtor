'use client'
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 text-center">
      <h1 className="text-3xl font-bold">Welcome to CRM</h1>
      <div>
        <SignedOut>

        <Link href="/sign-in" className="px-4 py-2 bg-blue-500 text-white rounded">Sign In</Link>
        <Link href="/sign-up" className="px-4 py-2 bg-green-500 text-white rounded ml-2">Sign Up</Link>
        </SignedOut>
        <SignedIn>
          <p>Redirecting...</p>
        </SignedIn>
      </div>
    </div>
  );
}
