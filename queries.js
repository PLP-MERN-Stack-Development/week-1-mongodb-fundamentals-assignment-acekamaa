const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // or your MongoDB Atlas URI
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // Find all books in a specific genre
    const sciFiBooks = await books.find({ genre: "Science Fiction" }).toArray();
    console.log("Science Fiction books:", sciFiBooks);

    // Find books published after a certain year
    const recentBooks = await books.find({ published_year: { $gt: 2015 } }).toArray();
    console.log("Books after 2015:", recentBooks);

    // Find books by a specific author
    const asimovBooks = await books.find({ author: "Isaac Asimov" }).toArray();
    console.log("Books by Isaac Asimov:", asimovBooks);

    // Update the price of a specific book
    const updateResult = await books.updateOne({ title: "Dune" }, { $set: { price: 22.99 } });
    console.log("Update result:", updateResult.modifiedCount);

    // Delete a book by title
    const deleteResult = await books.deleteOne({ title: "Old Man's War" });
    console.log("Delete result:", deleteResult.deletedCount);

    // Advanced query: in stock and published after 2010
    const filteredBooks = await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray();
    console.log("In-stock books after 2010:", filteredBooks);

    // Projection: title, author, price
    const projectedBooks = await books.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).toArray();
    console.log("Projection:", projectedBooks);

    // Sorting by price ascending and descending
    const sortedAsc = await books.find().sort({ price: 1 }).toArray();
    const sortedDesc = await books.find().sort({ price: -1 }).toArray();
    console.log("Price ASC:", sortedAsc);
    console.log("Price DESC:", sortedDesc);

    // Pagination (e.g. page 2, 5 per page)
    const page2 = await books.find().skip(5).limit(5).toArray();
    console.log("Page 2:", page2);

    // Aggregation: average price by genre
    const avgPrice = await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray();
    console.log("Average price by genre:", avgPrice);

    // Author with most books
    const topAuthor = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log("Top author:", topAuthor);

    // Group by publication decade
    const byDecade = await books.aggregate([
      {
        $group: {
          _id: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log("Books by decade:", byDecade);

    // Indexes
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1, published_year: 1 });

    const explain = await books.find({ title: "Dune" }).explain("executionStats");
    console.log("Explain output:", explain.executionStats);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
