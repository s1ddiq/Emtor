import { Client, Databases, ID, Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CUSTOMERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CUSTOMERS_COLLECTION_ID!;
const DELETED_CUSTOMERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DELETED_CUSTOMERS_COLLECTION_ID!;


const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const databases = new Databases(client);
export { ID };

export const addCustomer = async (name: string, email: string, phone: string, status: string, userId: string) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      ID.unique(),
      { name, email, phone, status, userId }
    );
    return response;
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
}

export const updateStatus = async (id: string, newStatus: any) => {
  try {
    const updatedDocument = await databases.updateDocument(DATABASE_ID, CUSTOMERS_COLLECTION_ID, id, {status: newStatus})

    return updatedDocument;
  } catch (error) {
    console.log('There was an error updating the status: ' + error)
  }
}

export const deleteCustomer = async (
  id: string,
  name: string,
  email: string,
  phone: string,
  status: string,
  userId: string
) => {
  try {
    // Archive the customer before deleting (excluding system fields like `$id`)
    await databases.createDocument(
      DATABASE_ID,
      DELETED_CUSTOMERS_COLLECTION_ID,
      ID.unique(),
      {
        name,
        email,
        phone,
        status,
        userId,
      }
    );

    // Delete the original customer document
    await databases.deleteDocument(DATABASE_ID, CUSTOMERS_COLLECTION_ID, id);

    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error };
  }
};


export const fetchCustomers = async (id: string) => {
  try {
    const retrievedDocuments = await databases.listDocuments(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      [Query.equal("userId", id)] // "userId" should be the actual field name
    );
    return retrievedDocuments.documents; // Return the actual documents
  } catch (error) {
    console.error("Error fetching customers:", error);
    return []; // Return empty array in case of error
  }
};

export const editCustomerNotes = async (id: string, note: string) => {
  try {
    const notes = await databases.updateDocument(DATABASE_ID, CUSTOMERS_COLLECTION_ID, id, {notes: note});
    return notes;
  } catch (error) {
    
  }
}

export const fetchNotes = async (id: string) => {
  try {
    const notes = await databases.listDocuments(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      [Query.equal('$id', id)] // Ensure both match
    );
    console.log(notes);

    return notes.documents;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return []; // Return an empty array on failure
  }
};

export const editCustomerDetails = async (id: string, updates: { [key: string]: string }) => {
  try {
    const updatedCustomer = await databases.updateDocument(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      id,
      updates
    );
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer details:", error);
    throw error;
  }
};

export const deletedCustomers = async (id: string) => {
  try {
    const deletedCustomers = await databases.listDocuments(DATABASE_ID, DELETED_CUSTOMERS_COLLECTION_ID, [Query.equal("userId", id)]);

    return deletedCustomers.documents;
  } catch (error) {
    
  }
}