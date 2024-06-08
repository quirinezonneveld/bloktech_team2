// Initialise Express webserver
const express = require('express');
const app = express();

//axios
const axios = require('axios');
const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`;

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

const getEvents = async (classificationName, countryCode) => {
  // const response = await axios.get(URL);
  // const data = response.data;
  // return data._embedded.events;
  const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${
    process.env.KEY
  }${classificationName ? `&classificationName=${classificationName}` : ''}${
    countryCode ? `&countryCode=${countryCode}` : ''
  }`;

  try {
    const response = await axios.get(URL);
    const data = response.data;
    return data._embedded ? data._embedded.events : [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};
// test filter
// const fetchEvents = async () => {
//   const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`;
//   const events = await getEvents('music', URL);
//   console.log(events);
// };

// fetchEvents();

const getEvent = async (event_id) => {
  get_event_url = `https://app.ticketmaster.com/discovery/v2/events/${event_id}.json?apikey=${process.env.KEY}`;
  const response = await axios.get(get_event_url);
  const data = response.data;
  return data;
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
    res
      .status(500)
      .json({ message: 'Error adding favorite event to database' });
  }
});

app.post('/unlike', async (req, res) => {
  const { eventId } = req.body;

  console.log('Event ID to remove:', eventId); // Log eventId

  try {
    const userId = new ObjectId(req.session.userId);

    // Remove the eventId from the user's favorites
    const updateResult = await db
      .collection('users')
      .updateOne({ _id: userId }, { $pull: { favorites: eventId } });

    if (updateResult.modifiedCount === 1) {
      res.redirect('profile');
    } else {
      res.status(500).render('error', {
        errorCode: 500,
        errorMessage: 'Failed to remove the event from favorites',
      });
    }
  } catch (error) {
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Server error',
    });
  }
});

//Sign In / Register
app.get('/form', (req, res) => {
  res.render('form');
});

//Events
app.get('/all-events', async (req, res) => {
  try {
    const { classificationName, countryCode } = req.query;
    console.log('classificationName ---------->', classificationName);
    const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`;
    const events = await getEvents(classificationName, countryCode, URL);
    res.render('all-events', { events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.render('all-events', { events: [] });
  }
});

app.get('/all-events/:eventId', (req, res) => {
  //console.log('all-events 1 --------->', req.params.eventId);
  res.render('all-events');
});

// Events detail
app.get('/detail', async (req, res) => {
  // retrieving the specific event from event_id url paramter
  const eventId = req.query.event_id;
  const event_details = await getEvent(eventId);
  console.log('detail --------->');
  console.log('----');
  console.log(event_details);
  res.render('detail.ejs', { event_details });
});

//About us
app.get('/about-us', (req, res) => {
  res.render('about-us');
});

//API

app.get('/api-data', async (req, res) => {
  try {
    console.log('I serve api data ---->');
    const response = await axios.get(URL);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Error loading data', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Error loading data',
    });
  }
});

/***********/
/* Profile */
/***********/

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form');
    return;
  }

  try {
    const userId = new ObjectId(req.session.userId);
    const user = await db.collection('users').findOne({ _id: userId });
    const favoriteEventIds = user.favorites;

    let favoriteEvents = [];
    for (const eventId of favoriteEventIds) {
      try {
        const response = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.KEY}`
        );
        favoriteEvents.push(response.data);
        await sleep(200);
      } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error);
      }
    }

    const { name, surname, email, profileImage } = user;
    res.render('profile', {
      name,
      surname,
      email,
      profileImage,
      favoriteEvents,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).render('error', {
      errorCode: 500,
      errorMessage: 'Server error',
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
      console.log(
        'Login succesvol: Sessie gestart voor gebruiker ID:',
        user._id
      );
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

app.post(
  '/upload-profile-picture',
  upload.single('profileImage'),
  async (req, res) => {
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

// loading state //
async function fetchData(url) {
  loaderDiv.classList.add('loading'); // Activeer de loader
  // Simuleer een vertraging van 3 seconden (3000 milliseconden)
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Voer hier je logica uit voor het ophalen van de API-data
  const response = await fetch(url);
  const data = await response.json();
  loaderDiv.classList.remove('loading'); // Deactiveer de loader
  // Voer verdere verwerkingslogica uit
}

function handleSubmit(event) {
  event.preventDefault(); // Voorkom standaard form submit gedrag

  const submitButton = document.getElementById('submitButton');
  const loaderDiv = document.getElementById('loaderDiv');

  submitButton.classList.add('loading');
  loaderDiv.classList.add('loading'); // Voeg loading class toe aan loader
  submitButton.disabled = true;
  submitButton.innerText = 'Verzenden...'; // Verander de tekst van de knop

  // Voer hier je logica uit voor het verzenden van het formulier, bijvoorbeeld een fetch-aanroep
  setTimeout(() => {
    console.log('Formulier verzonden!');
    // Hier zou je eventueel de submit van het formulier kunnen forceren:
    // event.target.submit();

    // Verwijder loading state nadat logica is uitgevoerd
    submitButton.classList.remove('loading');
    loaderDiv.classList.remove('loading');
    submitButton.innerText = 'Verzenden'; // Herstel de tekst van de knop
    submitButton.disabled = false;

    // Voer hier acties uit om naar een andere pagina te gaan of andere bewerkingen uit te voeren
  }, 2000); // Voeg een vertraging van 2000 milliseconden (2 seconden) toe
}

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
  res.status(500).render('error', {
    errorCode: 500,
    errorMessage: 'Server error',
  });
});

// Start the webserver and listen for HTTP requests at specified port
app.listen(3000, () => {
  console.log(
    `I did not change this message and now my webserver is listening at port 3000`
  );
});
