// Initialise Express webserver
const express = require('express')
const app = express()

// Add info from .env file to process.env
require('dotenv').config() 

// Sessions
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Bcrypt hashing
const bcrypt = require('bcrypt')

// Profile pictures
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });


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

/************/
/* Database */
/************/

// Database connection
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

  app.use((req, res, next) => {
    if (req.session) {
      if (!req.session.isNew) {
        console.log(`Sessie bestaand: Sessie ID: ${req.session.id}`);
      } else {
        console.log(`Nieuwe sessie aangemaakt: Sessie ID: ${req.session.id}`);
      }
    }
    next();
  });

/************/
/* Sessions */
/************/

  // Session manager
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,  // Sessie geldig voor 1 dag
    SameSite: true 
  } 
}));

//Routes
app.get('/', (req, res) => {
  res.render('home.ejs')
})

app.get('/home', (req, res) => {
  res.render('home.ejs')
})

//Sign In / Register
app.get('/form', (req, res) => {
  res.render('form')
})

//Events
app.get('/all-events', (req, res) => {
  res.render('all-events')
})


//About us
app.get('/about-us', (req, res) => {
  res.render('about-us')
})


/***********/
/* Profile */
/***********/

app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form');
    return;
  }

  try {
    const userId = new ObjectId(req.session.userId);
    const user = await db.collection('users').findOne({ _id: userId })
    if(!user) {
      res.redirect('/form')
      return;
    }

    const { name, surname, email, profileImage } = user;
    res.render('profile', { name, surname, email, profileImage });
  } catch (error) {
    console.error('Error fetching user from database', error);
    res.status(500).render('error', { errorCode: 500, errorMessage: 'Error fetching user from database' });
  }
});


/************/
/* Registry */
/************/

// Receiving information out of form
app.post('/registry', async (req, res) => {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const password = req.body.passwordRegister;
  const email = req.body.emailRegister;

  console.log(`Ontvangen gegevens: Naam - ${firstName}, Achternaam - ${lastName}, Wachtwoord - ${password}, Email - ${email}`);
  //res.render('response.ejs', { name: firstName, surname: lastName, password: password, email: email });


  try {
    //Checking if the email adress is unique
    const existingUser = await db.collection('users').findOne({ email: email });
    if (existingUser) {
      console.log('Email address already in use');
      res.status(409).render('error', { errorCode: 409, errorMessage: 'Email adress already in use' });
      return
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed:', hashedPassword);


    //Filling in the data of the user registry
    const result = await db.collection('users').insertOne({ name: firstName, surname: lastName, password: hashedPassword, email: email });
    console.log(`Gebruiker opgeslagen met id: ${result.insertedId}`);

  } catch (error) {
    console.error('Error inserting data into database', error);
    res.status(500).render('error', { errorCode: 500, errorMessage: 'Error inserting data into database' });
  }
});

/***********/
/* Sign in */
/***********/

// Gegevens uit MongoDB vergelijken voor inloggen
app.post('/signin', async (req, res) => {
  const email = req.body.emailSignin;
  const password = req.body.passwordSignin;

  try {
    const user = await db.collection('users').findOne({ email: email });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id;
      req.session.user = { name: user.name, surname: user.surname, email: user.email };
      console.log('Login succesvol: Sessie gestart voor gebruiker ID:', user._id);
      res.redirect('/profile');
    } else {
      console.log('Invalid email or password');
      res.status(401).render('error', { errorCode: 401, errorMessage: 'Invalid email or password'})
    }

  } catch (error) {
    console.error('Error fetching data from database', error);
    res.status(500).render('error', { errorCode: 500, errorMessage: 'Error fetching data from database' });
  }
});

/********************/
/* Profile Pictures */
/********************/

app.post('/upload-profile-picture', upload.single('profileImage'), async (req, res) => {
  if (!req.session.userId) {
      res.redirect('/form');
      return;
  }

  try {
    console.log('File received:', req.file); // Controleer of het bestand correct is ontvangen
    if (!req.file) {
        throw new Error('File not uploaded correctly');
    }

    const userId = new ObjectId(req.session.userId);
    const profileImage = req.file.buffer;

    console.log('Updating user with ID:', userId);
    console.log('Profile image buffer length:', profileImage.length);

        

    // Update the user profile with the image buffer
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { $set: { profileImage: profileImage } }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      throw new Error('No user found with the given ID');
    }

    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile image in database', error);
    res.status(500).render('error', { errorCode: 500, errorMessage: 'Error updating profile image in database' });
  }
});


/************/
/* Sign out */
/************/

app.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { errorCode: 500, errorMessage: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    console.log('Uitloggen succesvol: Sessie beëindigd');
    res.redirect('/'); // Redirect to homepage or login page after logout
  });
});


/*****************/
/* Updating data */
/*****************/

//Updaten van de voor- en achternaam 
app.post('/update', async (req, res) => {
  const { emailUpdate: email, fNameUpdate: firstName, lNameUpdate: lastName } = req.body;

  try {
    const filter = {
      email: email
    }
    const updateData = {
      $set: {
        name: firstName, surname: lastName
      }
    }
    const options = { upsert: true };

    const result = await db.collection('users').updateOne(filter, updateData, options);

    if (result.matchedCount === 0) {
      res.status(404).render('error', { errorCode: 404, errorMessage: 'User not found' });
      return;
    }

    console.log(`User details updated for email: ${email}`);
    res.send('User details updated successfully');


  } catch (error) {
    console.error('Error updating data in database', error);
    res.status(500).render('error', { errorCode: 500, errorMessage: 'Error updating data in database' });
  }
  
});

// Middleware to handle not found errors - error 404
app.use((req, res) => {
  // log error to console
  console.error('404 error at URL: ' + req.url)
  // send back a HTTP response with status code 404
  res.status(404).render('error', { errorCode: 404, errorMessage: '404 error at URL: ' + req.url });
})

// Middleware to handle server errors - error 500
app.use((err, req, res) => {
  // log error to console
  console.error(err.stack)
  // send back a HTTP response with status code 500
  res.status(500).render('error', { errorCode: 500, errorMessage: 'Server error' });
})

// Start the webserver and listen for HTTP requests at specified port
app.listen(3000, () => {
  console.log(`I did not change this message and now my webserver is listening at port 3000`)
})

