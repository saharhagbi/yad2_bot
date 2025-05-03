import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

// Define the Yad2Listing class
// TODO:
// Move to a separate file, type
export class Yad2Listing {
  id: string;
  link: string;
  title: string;
  price: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(id: string, link: string, title: string, price: string) {
    this.id = id;
    this.link = link;
    this.title = title;
    this.price = price;
  }
}

/**
 * Fetches listings from Yad2 based on the provided URL
 * @param url The Yad2 search URL with parameters
 * @returns Promise that resolves to an array of Yad2Listing objects
 */
export const fetchYad2Listings = async (
  url: string
): Promise<Yad2Listing[]> => {
  try {
    // Parse the URL parameters
    const urlParams = new URL(url).searchParams;

    // Construct the API URL with the parameters
    const apiUrl = process.env.API_URL;
    const apiUrlWithParams = `${apiUrl}?${urlParams.toString()}`;
    console.log(`Fetching listings from: ${apiUrlWithParams}`);

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Define the new API response structure
    interface ApiResponse {
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

    // Create proxy agent with the provided credentials
    const proxyIP = "geo.g-w.info";
    const proxyPort = 10080;
    const proxyUsername = "krhCmKqsROtqOu44";
    const proxyPassword = "Umtk0Tp3UlJBwAGv";

    // Create proxy URL
    // const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`;
    const proxyUrl = process.env.PROXY_URL || "";
    // const proxyUrl = `http://93.115.200.159:8001`;
    const httpsAgent = new HttpsProxyAgent(proxyUrl);

    const response = await axios.get<ApiResponse>(apiUrlWithParams, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "he-IL",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      httpsAgent: httpsAgent, // Add the proxy agent to the request config
    });

    if (
      response.data?.data?.markers &&
      Array.isArray(response.data.data.markers)
    ) {
      const listings = response.data.data.markers.map((marker) => {
        // Extract the token (new ID)
        const id = marker.token;

        // Create the link using the token
        const link = `https://www.yad2.co.il/realestate/item/${id}`;

        // Create the title from street name and house number
        const street = marker.address?.street?.text || "Unknown Street";
        const houseNumber = marker.address?.house?.number || "";
        const title = `${street} ${houseNumber}`.trim();

        // Get the price or set to "No price" if not available
        const price = marker.price ? marker.price.toString() : "No price";

        return new Yad2Listing(id, link, title, price);
      });

      // Remove duplicates based on id
      const uniqueListings = Array.from(
        new Map(
          listings.map((listing) => {
            const id = listing.id;
            return [id, listing];
          })
        ).values()
      );

      console.log(`Found ${uniqueListings.length} listings`);
      return uniqueListings;
    } else {
      console.error("Invalid API response format");
    }

    return [];
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};
