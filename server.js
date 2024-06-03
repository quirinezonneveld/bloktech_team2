// Initialise Express webserver
const express = require('express');
const app = express();

// Add info from .env file to process.env
require('dotenv').config();

// Sessions
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Bcrypt hashing
const bcrypt = require('bcrypt');

// Profile pictures
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getEvents = async () => {
  const response = await axios.get(URL);
  const data = response.data;
  return data._embedded.events;
};

app
  .use(express.urlencoded({ extended: true })) // middleware to parse form data from incoming HTTP request and add form fields to req.body
  .use(express.static('static')) // Allow server to serve static content such as images, stylesheets, fonts or frontend js from the directory named static
  .set('view engine', 'ejs') // Set EJS to be our templating engine
  .set('views', 'view'); // And tell it the views can be found in the directory named view

// Use MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Construct URL used to connect to database from info in the .env file
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/************/
/* Database */
/************/

// Database connection
let db;

client
  .connect()
  .then(() => {
    console.log('Database connection established');
    db = client.db(process.env.DB_NAME); // Connect to the specific database ->
  })
  .catch((err) => {
    console.log(`Database connection error - ${err}`);
    console.log(`For uri - ${uri}`);
  });

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
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60, // Sessie geldig voor 1 uur
      SameSite: true,
    },
  })
);

//Routes
app.get('/', async (req, res) => {
  const events = await getEvents();
  const isLoggedIn = !!req.session.userId;
  //console.log('events ------->', events);
  res.render('home.ejs', { events, isLoggedIn });
});

app.get('/home', async (req, res) => {
  // requets for events
  const events = await getEvents();
  const isLoggedIn = !!req.session.userId;
 // console.log('events ------->', events);

  res.render('home.ejs', { events, isLoggedIn });
});

// Route to add favorite event
app.post('/add_favorite', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form');
    return;
  }

  const { eventId } = req.body;

  try {
    const userId = new ObjectId(req.session.userId);
    await db.collection('users').updateOne(
      { _id: userId },
      { $addToSet: { favorites: eventId } } // $addToSet ensures no duplicates
    );

    console.log(`Added favorite event for user ${userId}`);
  } catch (error) {
    console.error('Error adding favorite event to database', error);
    res.status(500).json({ message: 'Error adding favorite event to database' });
  }
});

//Sign In / Register
app.get('/form', (req, res) => {
  res.render('form');
});

//Events
app.get('/all-events', (req, res) => {
  //console.log('all-events --------->');
  res.render('all-events');
});

app.get('/all-events/:eventId', (req, res) => {
  //console.log('all-events 1 --------->', req.params.eventId);
  res.render('all-events');
});

//About us
app.get('/about-us', (req, res) => {
  res.render('about-us');
});

//API
const axios = require('axios');
const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`;

app.get('/api-data', async (req, res) => {
  try {
    console.log('I serve api data ---->');
    const response = await axios.get(URL);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Error loading data', error);
    res.status(500).send('Error loading data');
  }
});

/***********/
/* Profile */
/***********/


const { RateLimiter } = require('limiter');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache voor 1 uur
const limiter = new RateLimiter({ tokensPerInterval: 5, interval: 'second' });


app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form');
    return;
  }

  try {
    const userId = new ObjectId(req.session.userId);
    console.log('Fetching user with ID:', userId);
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      console.log('User not found');
      res.redirect('/form');
      return;
    }

    let favoriteEvents = [];
    if (user.favorites && user.favorites.length > 0) {
     // console.log('User favorites:', user.favorites);
      const promises = user.favorites.map(async (eventId) => {
        const cachedEvent = cache.get(eventId);
        if (cachedEvent) {
          return cachedEvent;
        } else {
          await limiter.removeTokens(1); // Wachten tot er een verzoek toegestaan is
          try {
            const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.KEY}`);
            const event = response.data;
            cache.set(eventId, event); // Cache het evenement
            return event;
          } catch (error) {
            console.error(`Error fetching event with ID ${eventId}:`, error);
            return null;
          }
        }
      });

      favoriteEvents = await Promise.all(promises);
      favoriteEvents = favoriteEvents.filter(event => event !== null);
    } else {
      console.log('No favorite events for user');
    }

    const { name, surname, email, profileImage } = user;
    res.render('profile', { name, surname, email, profileImage, favoriteEvents });
  } catch (error) {
    console.error('Error fetching user from database', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Error fetching user from database',
    });
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

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id;
      req.session.user = {
        name: user.name,
        surname: user.surname,
        email: user.email,
      };
      console.log( 'Login succesvol: Sessie gestart voor gebruiker ID:', user._id );
      res.redirect('/profile');
    } else {
      console.log('Invalid email or password');
      res.status(401).render('error', {
        errorCode: 401,
        errorMessage: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('Error fetching data from database', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Error fetching data from database',
    });
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
      const result = await db
        .collection('users')
        .updateOne({ _id: userId }, { $set: { profileImage: profileImage } });

      console.log('Update result:', result);

      if (result.matchedCount === 0) {
        throw new Error('No user found with the given ID');
      }

      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile image in database', error);
      res.status(500).render('error', {
        errorCode: 500,
        errorMessage: 'Error updating profile image in database',
      });
    }
  }
);

app.post('/delete-profile-picture', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form');
    return;
  }

  try {
    const userId = new ObjectId(req.session.userId);

    // Deleting out of database
    await db
      .collection('users')
      .updateOne({ _id: userId }, { $unset: { profileImage: '' } });

    res.redirect('/profile');
  } catch (error) {
    console.error('Error deleting profile image from database', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Error deleting profile image from database',
    });
  }
});

/************/
/* Sign out */
/************/

app.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render('error', { errorCode: 500, errorMessage: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    console.log('Uitloggen succesvol: Sessie beëindigd');
    res.redirect('/'); // Redirect to homepage or login page after logout
  });
});

/*****************/
/* Updating data */
/*****************/

app.get('/update', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form');
    return;
  }
  res.render('update');
});

// Route for updating the name
app.post('/update-name', async (req, res) => {
  const {
    emailUpdate: email,
    fNameUpdate: firstName,
    lNameUpdate: lastName,
  } = req.body;

  try {
    const filter = { email: email };
    const updateData = {
      $set: {
        name: firstName,
        surname: lastName,
      },
    };
    const options = { upsert: false };

    const result = await db
      .collection('users')
      .updateOne(filter, updateData, options);

    if (result.matchedCount === 0) {
      res
        .status(404)
        .render('error', { errorCode: 404, errorMessage: 'User not found' });
      return;
    }

    console.log(`User details updated for email: ${email}`);
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating data in database', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Error updating data in database',
    });
  }
});

// Route for updating password
app.post('/update-password', async (req, res) => {
  const {
    emailUpdate: email,
    oldPassword,
    newPassword,
    confirmNewPassword,
  } = req.body;

  if (newPassword !== confirmNewPassword) {
    res.status(400).render('error', {
      errorCode: 400,
      errorMessage: 'New passwords do not match',
    });
    return;
  }

  try {
    const user = await db.collection('users').findOne({ email: email });

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      res.status(401).render('error', {
        errorCode: 401,
        errorMessage: 'Invalid email or password',
      });
      return;
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await db
      .collection('users')
      .updateOne({ email: email }, { $set: { password: hashedNewPassword } });

    console.log(`Password updated for email: ${email}`);
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating password in database', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Error updating password in database',
    });
  }
});

// Middleware to handle not found errors - error 404
app.use((req, res) => {
  // log error to console
  console.error('404 error at URL: ' + req.url);
  // send back a HTTP response with status code 404
  res.status(404).render('error', {
    errorCode: 404,
    errorMessage: '404 error at URL: ' + req.url,
  });
});

// Middleware to handle server errors - error 500
app.use((err, req, res) => {
  // log error to console
  console.error(err.stack);
  // send back a HTTP response with status code 500
  res
    .status(500)
    .render('error', { errorCode: 500, errorMessage: 'Server error' });
});

// Start the webserver and listen for HTTP requests at specified port
app.listen(3000, () => {
  console.log(
    `I did not change this message and now my webserver is listening at port 3000`
  );
});
