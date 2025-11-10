import mongoose from 'mongoose';
import { ListingWithTimestamps, ListingInput } from '../../types/index.js';

/**
 * Interface for listing documents in MongoDB with mongoose.Document
 */
export interface ListingDocument extends Omit<ListingWithTimestamps, 'id'>, mongoose.Document {
  id: string; // Our custom id field
}

/**
 * Mongoose schema for listings
 */
const listingSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    link: { type: String, unique: true, required: true },
    title: String,
    price: String,
  },
  { timestamps: true }
);

/**
 * Mongoose model for listings
 */
export const Listing = mongoose.model<ListingDocument>('Listing', listingSchema);

/**
 * Connect to MongoDB
 * @param uri MongoDB connection URI
 * @returns Promise that resolves when connected
 */
export const connectToMongo = async (uri: string): Promise<typeof mongoose> => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns Promise that resolves when disconnected
 */
export const disconnectFromMongo = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
};

/**
 * Save a listing to the database
 * @param listing Listing to save
 * @returns Promise that resolves to true if saved, false otherwise
 */
export const saveListing = async (listing: ListingInput): Promise<boolean> => {
  if (!listing.id || !listing.link || !listing.title) {
    return false;
  }

  try {
    // First check if the listing already exists by ID
    const existingListing = await findListingById(listing.id);
    
    if (existingListing) {
      console.log(`Listing already exists: ${listing.title}`);
      return false;
    }
    
    // If the listing doesn't exist, save it
    await Listing.create(listing);
    console.log(`Listing saved: ${listing.title}`);
    return true;
  } catch (error: any) {
    // Check if it's a duplicate key error (listing already exists)
    if (error.message?.includes('duplicate key error')) {
      console.log(`Listing already exists: ${listing.title}`);
      return false;
    }
    console.error('Error saving listing:', error);
    return false;
  }
};

/**
 * Find a listing by link
 * @param link Link to search for
 * @returns Promise that resolves to the listing or null if not found
 */
export const findListingByLink = async (link: string): Promise<ListingDocument | null> => {
  try {
    return await Listing.findOne({ link });
  } catch (error) {
    console.error('Error finding listing:', error);
    return null;
  }
};

/**
 * Find a listing by ID
 * @param id Listing ID to search for
 * @returns Promise that resolves to the listing or null if not found
 */
export const findListingById = async (id: string): Promise<ListingDocument | null> => {
  try {
    return await Listing.findOne({ id });
  } catch (error) {
    console.error('Error finding listing by ID:', error);
    return null;
  }
};