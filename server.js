// dit is een boilerplate voor een node.js webserver met alle basis die je nodig hebt om je webserver aan de praat te krijgen
// deze boilerplate is geen werkende webserver, maar een overzicht van de verschillende codefragmenten die je nodig hebt
// kopieer deze dus niet integraal, maar zoek de stukjes die je nodig hebt en pas ze aan, zodat ze werken voor jouw project

// Initialise Express webserver
const express = require('express')
const app = express()

// Add info from .env file to process.env
require('dotenv').config() 


app
  .use(express.urlencoded({extended: true})) // middleware to parse form data from incoming HTTP request and add form fields to req.body
  .use(express.static('static'))             // Allow server to serve static content such as images, stylesheets, fonts or frontend js from the directory named static
  .set('view engine', 'ejs')                 // Set EJS to be our templating engine
  .set('views', 'view')                      // And tell it the views can be found in the directory named view


// Use MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// Construct URL used to connect to database from info in the .env file
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`
// Create a MongoClient
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
})

let db;

client.connect()
  .then(() => {
    console.log('Database connection established')
    db = client.db(process.env.DB_NAME); // Connect to the specific database
  })
  .catch((err) => {
    console.log(`Database connection error - ${err}`)
    console.log(`For uri - ${uri}`)
  })


// A sample route, replace this with your own routes
app.get('/', (req, res) => {
  res.render('form.ejs')
})

// Receiving information out of form
app.post('/registreren', async (req, res) => {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const password = req.body.passwordRegister;
  const email = req.body.emailRegister;

  console.log(`Ontvangen gegevens: Naam - ${firstName}, Achternaam - ${lastName}, Wachtwoord - ${password}, Email - ${email}`);
  //res.render('response.ejs', { name: firstName, surname: lastName, password: password, email: email });

  try {
    const result = await db.collection('users').insertOne({ name: firstName, surname: lastName, password: password, email: email });
    console.log(`Gebruiker opgeslagen met id: ${result.insertedId}`);
  } catch (error) {
    console.error('Error inserting data into database', error);
    res.status(500).send('Error inserting data into database');
  }
});

// Gegevens uit MongoDB vergelijken voor inloggen
app.post('/inloggen', async (req, res) => {
  const email = req.body.emailSignin;
  const password = req.body.passwordSignin;

  try {
    const user = await db.collection('users').findOne({ email: email });

    if (user && user.password === password) {
      console.log('Login successful');
      res.send(`Welcome ${user.name} ${user.surname}`);
    } else {
      console.log('Invalid email or password');
      res.status(401).send('Invalid email or password');
    }

  } catch (error) {
    console.error('Error fetching data from database', error);
    res.status(500).send('Error fetching data from database');
  }
});

// Middleware to handle not found errors - error 404
app.use((req, res) => {
  // log error to console
  console.error('404 error at URL: ' + req.url)
  // send back a HTTP response with status code 404
  res.status(404).send('404 error at URL: ' + req.url)
})

// Middleware to handle server errors - error 500
app.use((err, req, res) => {
  // log error to console
  console.error(err.stack)
  // send back a HTTP response with status code 500
  res.status(500).send('500: server error')
})

// Start the webserver and listen for HTTP requests at specified port
app.listen(3000, () => {
  console.log(`I did not change this message and now my webserver is listening at port 3000`)
})
