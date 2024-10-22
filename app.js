const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helper/jwt.js')

app.use(cors());
app.options('*' ,cors())


// MIDDLEWARE
app.use(bodyParser.json());
app.use(express.json());
app.use(authJwt());



// ROUTES
const userRoutes = require('./routes/user.js');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const brandRoutes = require('./routes/brands');
const ImageUploadRoutes = require('./routes/imageUpload');
const cartSchema = require('./routes/cart.js');
const myListSchema = require(`./routes/myList.js`);
const homeBanner = require(`./routes/homeBanner.js`);
const order = require(`./routes/order.js`);


app.use("/uploads" , express.static("uploads"));
app.use('/api/user' , userRoutes)
app.use(`/api/category` , categoryRoutes);
app.use(`/api/product` , productRoutes);
app.use(`/api/brand` , brandRoutes);
app.use(`/api/imageUpload` , ImageUploadRoutes );
app.use(`/api/cart` , cartSchema);
app.use(`/api/my-list` , myListSchema);
app.use(`/api/homeBanner` , homeBanner);
app.use(`/api/order` , order);




// DATABASE
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Database Connection is ready ...');

    
    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err); 
  });
