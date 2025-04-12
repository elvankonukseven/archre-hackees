require('dotenv').config(); //variable environnement
const express = require('express'); //server
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

// Route basique pour vérifier que ton backend tourne bien
app.get('/upload', (req, res) => {
  res.send('Backend opérationnel. Mais upload direct vers S3 depuis le front :)');
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    res.json({ url: data.Location });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Erreur upload S3' });
  }
});


// démarre un serveur sur le port 4000
app.listen(4000, () => {
  console.log('Backend en route sur http://localhost:4000');
});
