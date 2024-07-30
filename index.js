require("dotenv").config();
const express = require("express");

const port = process.env.PORT || "0.0.0.0";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AlphakidzAPI");
});

app.get("/blog", async (req, res) => {
  try {
    const response = await fetch("https://blog.alpha-kidz.com/wp-json/wp/v2/posts");
    const posts = await response.json();

    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      // Fetch category name
      const categoryResponse = await fetch(`https://blog.alpha-kidz.com/wp-json/wp/v2/categories/${post.categories[0]}`);
      const category = await categoryResponse.json();

      // Fetch featured media URL
      const mediaResponse = await fetch(`https://blog.alpha-kidz.com/wp-json/wp/v2/media/${post.featured_media}`);
      const media = await mediaResponse.json();

      return {
        link: post.link,
        title: post.title.rendered,
        category: category.name,
        featuredMedia: media.source_url
      };
    }));

    res.json(enrichedPosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

app.get('/premiumnanny', async (req, res) => {
  try {
    // Fetch the product data from the WordPress API
    const productResponse = await fetch('https://find.premiumnanny.id/wp-json/wp/v2/product');
    const products = await productResponse.json();

    // Extract the title, featured image ID, and other necessary details
    const result = await Promise.all(products.map(async (product) => {
      const { id, title, featured_media, link } = product;

      // Fetch the media details to get the image URL
      let imageUrl = '';
      if (featured_media) {
        const mediaResponse = await fetch(`https://find.premiumnanny.id/wp-json/wp/v2/media/${featured_media}`);
        const media = await mediaResponse.json();
        imageUrl = media.guid.rendered;
      }

      return {
        id,
        title: title.rendered,
        image: imageUrl,
        link: link
      };
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log("app listening on port", port);
});
