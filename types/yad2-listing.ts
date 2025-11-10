/**
 * Yad2 listing class representing a property listing
 */
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