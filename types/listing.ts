import mongoose from "mongoose";

/**
 * Base listing interface
 */
export interface Listing {
  id: string;
  link: string;
  title: string;
  price: string;
}

/**
 * Interface for listing data with timestamps
 */
export interface ListingWithTimestamps extends Listing {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new listing
 */
export interface ListingInput extends Listing {}