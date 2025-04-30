import axios from "axios";

// Define the Yad2Listing class
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
export const fetchYad2Listings = async (url: string): Promise<Yad2Listing[]> => {
  try {
    // Parse the URL parameters
    const urlParams = new URL(url).searchParams;

    // Construct the API URL with the parameters
    const apiUrl = "https://gw.yad2.co.il/feed-search-legacy/realestate/rent";

    interface ApiResponse {
      data: {
        feed: {
          feed_items: Array<{
            id: string;
            type: string;
            row_1: string;
            price?: string;
          }>;
        };
      };
    }

    const response = await axios.get<ApiResponse>(apiUrl, {
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
      params: {
        area: urlParams.get("area"),
        city: urlParams.get("city"),
        neighborhood: urlParams.get("neighborhood"),
        propertyGroup: "apartments",
        rooms: `${urlParams.get("minRooms")}-${urlParams.get("maxRooms")}`,
        price: `${urlParams.get("minPrice")}-${urlParams.get("maxPrice")}`,
        page: 1,
        forceLdLoad: true,
      },
    });

    if (response.data?.data?.feed?.feed_items) {
      const listings = response.data.data.feed.feed_items
        .filter((item) => item.type === "ad")
        .map(
          (item) =>
            new Yad2Listing(
              item.id,
              `https://www.yad2.co.il/realestate/item/${item.id}`,
              item.row_1.trim(),
              item.price || "No price"
            )
        );

      // Remove duplicates based on id
      const uniqueListings = Array.from(
        new Map(
          listings.map((listing) => {
            const id = listing.link.split("/").pop(); // Extract id from the link
            return [id, listing];
          })
        ).values()
      );

      console.log(`Found ${uniqueListings.length} listings`);
      return uniqueListings;
    }

    return [];
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};