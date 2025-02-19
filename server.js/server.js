const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); //loading environment variables

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json()); // Built-in body parser

//import routes
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);


//MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => console.error('❌ MongoDB connection error:', err));

//default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

//start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
const userRoutes = require('./routes/userRoutes');

app.use('/api', userRoutes);

//loading env variables
require('dotenv').config();
const AWS = require('aws-sdk');
const mongoose = require('mongoose');

//configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});


//connecting to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


  //check for connection
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB is running');
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  
//setting up node js backend
  require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const csv = require('csv-parser');
const stream = require('stream');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

//MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

//define Schema and Model
const DataSchema = new mongoose.Schema({
  temperature: String,
  air_quality: String,
  humidity: String
});

const DataModel = mongoose.model('SensorData', DataSchema);

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Function to Fetch and Store CSV from S3 to MongoDB
const fetchAndStoreCSV = async () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: process.env.CSV_FILE_NAME
    };

    s3.getObject(params)
      .createReadStream()
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await DataModel.deleteMany({}); // Clear existing data
          await DataModel.insertMany(results); // Insert new data
          resolve("CSV Data Stored in MongoDB");
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
};

// API Route to Trigger Data Fetch from S3 to MongoDB
app.get('/api/fetch', async (req, res) => {
  try {
    const message = await fetchAndStoreCSV();
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Route to Get Data from MongoDB for Frontend
app.get('/api/data', async (req, res) => {
  try {
    const data = await DataModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
