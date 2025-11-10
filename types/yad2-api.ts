/**
 * Interface for Yad2 API response structure
 */
export interface ApiResponse {
  data: {
    markers: Array<{
      token: string;
      address: {
        street: {
          text: string;
        };
        house: {
          number: number;
          floor?: number;
        };
        city?: {
          text: string;
        };
        neighborhood?: {
          text: string;
        };
      };
      price: number;
      additionalDetails?: {
        roomsCount?: number;
        squareMeter?: number;
      };
      metaData?: {
        coverImage?: string;
        images?: string[];
      };
    }>;
  };
  message: string;
}