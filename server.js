// Initialise Express webserver
const express = require('express')
const app = express()

//axios
const axios = require('axios')
const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`

// Add info from .env file to process.env
require('dotenv').config()

// Sessions
const session = require('express-session')
const MongoStore = require('connect-mongo')

// Bcrypt hashing
const bcrypt = require('bcrypt')

// Profile pictures
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Loading events & filters

const getEvents = async (classificationName, countryCode, keyword) => {
  // const response = await axios.get(URL)
  // const data = response.data
  // return data._embedded.events
  const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${
    process.env.KEY
  }${classificationName ? `&classificationName=${classificationName}` : ''}${
    countryCode ? `&countryCode=${countryCode}` : ''
  }${keyword ? `&keyword=${keyword}` : ''}`

  try {
    const response = await axios.get(URL)
    const data = response.data
    return data._embedded ? data._embedded.events : []
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

const getEvent = async (event_id) => {
  get_event_url = `https://app.ticketmaster.com/discovery/v2/events/${event_id}.json?apikey=${process.env.KEY}`
  const response = await axios.get(get_event_url)
  const data = response.data
  return data
}

app
  .use(express.urlencoded({ extended: true })) // middleware to parse form data from incoming HTTP request and add form fields to req.body
  .use(express.static('static')) // Allow server to serve static content such as images, stylesheets, fonts or frontend js from the directory named static
  .set('view engine', 'ejs') // Set EJS to be our templating engine
  .set('views', 'view') // And tell it the views can be found in the directory named view

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
  },
})

/************/
/* Database */
/************/

// Database connection
let db

client
  .connect()
  .then(() => {
    console.log('Database connection established')
    db = client.db(process.env.DB_NAME) // Connect to the specific database ->
  })
  .catch((err) => {
    console.log(`Database connection error - ${err}`)
    console.log(`For uri - ${uri}`)
  })

app.use((req, res, next) => {
  if (req.session) {
    if (!req.session.isNew) {
      console.log(`Sessie bestaand: Sessie ID: ${req.session.id}`)
    } else {
      console.log(`Nieuwe sessie aangemaakt: Sessie ID: ${req.session.id}`)
    }
  }
  next()
})

/*******/
/* API */
/*******/

app.get('/api-data', async (req, res) => {
  try {
    console.log('I serve api data ---->')
    const response = await axios.get(URL)
    const data = response.data
    res.json(data)
  } catch (error) {
    console.error('Error loading data', error)
    sendError(req, res, 500, 'Error loading data')
  }
})

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
)

//Profile Image nav
async function getProfileImage(userId) {
  let profileImage = 'assets/profile-default.jpg' // Standard image

  try {
    const user = await db.collection('users').findOne(
      { _id: userId })
    if (user && user.profileImage) {
      const base64Image = user.profileImage.toString('base64')
      profileImage = `data:image/jpeg;base64,${base64Image}`
    }
  } catch (error) {
    console.error('Error fetching profile image:', error)
  }
  return profileImage
}

/********/
/* Home */
/********/

app.get('/', async (req, res) => {
  try {
    const isLoggedIn = !!req.session.userId
    let profileImage = 'assets/profile-default.jpg' // Standaard afbeelding
    let favoriteEvents = []

    if (isLoggedIn) {
      const userId = new ObjectId(req.session.userId)
      profileImage = await getProfileImage(userId)
      
      const user = await db.collection('users').findOne(
        { _id: userId })
      if (user && user.favorites) {
        favoriteEvents = user.favorites
      }
    }

    const events = await getEvents()
    res.render('home.ejs', { events, isLoggedIn, profileImage, favoriteEvents })
  } catch (error) {
    sendError(req, res, 500, 'Server error')
  }
})

app.get('/home', async (req, res) => {
  try {
    const isLoggedIn = !!req.session.userId
    let profileImage = 'assets/profile-default.jpg' // Standaard afbeelding
    let favoriteEvents = []

    if (isLoggedIn) {
      const userId = new ObjectId(req.session.userId)
      profileImage = await getProfileImage(userId)
      const user = await db.collection('users').findOne(
        { _id: userId })
      if (user && user.favorites) {
        favoriteEvents = user.favorites
      }
    }

    const events = await getEvents()
    res.render('home.ejs', { events, isLoggedIn, profileImage, favoriteEvents })
  } catch (error) {
    return sendError(req, res, 500, 'Server error')
  }
})

/*************/
/* Favorites */
/*************/

//Toggle favorite
app.post('/toggle_favorite', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form')
    return
  }

  const { eventId } = req.body
  console.log('Received eventId:', eventId)

  if (!eventId) {
    console.error('Event ID is missing')
    res.status(400).json({ message: 'Event ID is missing' })
    return
  }

  try {
    const userId = new ObjectId(req.session.userId)
    const user = await db.collection('users').findOne(
      { _id: userId })

    if (!user) {
      sendError(req, res, 404, 'User not found')
    }

    if (user.favorites && user.favorites.includes(eventId)) {
      // Remove the event from favorites
      const updateResult = await db.collection('users').updateOne(
        { _id: userId },
        { $pull: { favorites: eventId } }
      )

      if (updateResult.modifiedCount === 1) {
        console.log(`Removed favorite event for user ${userId}`)
      } else {
        console.error('Failed to remove favorite event')
        res.status(500).json({ message: 'Failed to remove favorite event' })
      }
    } else {
      // Add the event to favorites
      const updateResult = await db.collection('users').updateOne(
        { _id: userId },
        { $addToSet: { favorites: eventId } }
      )

      if (updateResult.modifiedCount === 1) {
        console.log(`Added favorite event for user ${userId}`)
        //De regel hieronder staat uit, als je hem aanzet refreshed de home pagina zodat de like knop meteen overal te zien is, maar dan werkt de animatie niet meer
        //res.redirect('/home') 
      } else {
        console.error('Failed to add favorite event')
        res.status(500).json({ message: 'Failed to add favorite event' })
      }
    }
  } catch (error) {
    console.error('Error toggling favorite event in database', error)
    res.status(500).json({ message: 'Error toggling favorite event in database' })
  }
})

//Remove favorite
app.post('/remove-favorite', async (req, res) => {
  const { eventId } = req.body

  console.log('Event ID to remove:', eventId) 

  try {
    const userId = new ObjectId(req.session.userId)

    // Remove the eventId from the user's favorites
    const updateResult = await db.collection('users').updateOne(
        { _id: userId },
        { $pull: { favorites: eventId } }
    )

      if (updateResult.modifiedCount === 1) {
        res.redirect('profile')
      } else {
        sendError(req, res, 500, 'Failed to remove the event from favorites')
      } 

  } catch (error) {
    sendError(req, res, 500, 'Server error')
  }
})

/**************/
/* All events */
/**************/

app.get('/all-events', async (req, res) => {
  try {
    const { classificationName, countryCode, keyword } = req.query
    console.log('classificationName ---------->', classificationName)
    const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`

    const events = await getEvents(
      classificationName,
      countryCode,
      keyword,
      URL

    )
    
    const isLoggedIn = !!req.session.userId
    let profileImage = 'assets/profile-default.jpg' // Standaard afbeelding

    // Favoriete evenementen ophalen uit de database als de gebruiker is ingelogd
    let favoriteEvents = []
    if (isLoggedIn) {
      const userId = new ObjectId(req.session.userId)
      profileImage = await getProfileImage(userId)
      const user = await db.collection('users').findOne(
        { _id: userId })
      if (user) {
        favoriteEvents = user.favorites || []
      }
    }

    res.render('all-events', { isLoggedIn, profileImage, events, favoriteEvents })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.render('all-events', { events: [] })
  }
})





app.get('/all-events/:eventId', (req, res) => {
  //console.log('all-events 1 --------->', req.params.eventId)
  res.render('all-events')
})

// Events detail
app.get('/detail', async (req, res) => {


  try {
    const isLoggedIn = !!req.session.userId
    let profileImage = 'assets/profile-default.jpg' // Standaard afbeelding

    if (isLoggedIn) {
      const userId = new ObjectId(req.session.userId)
      profileImage = await getProfileImage(userId)
    }
    
    // retrieving the specific event from event_id url parameter
    const eventId = req.query.event_id
    const event_details = await getEvent(eventId)
 
    // Pass event_details to the template
    res.render('detail.ejs', { isLoggedIn, profileImage, event_details })
  } catch (error) {
    sendError(req, res, 500, 'Server error')
  }

})

/************/
/* About-us */
/************/

app.get('/about-us', async (req, res) => {
  try {
    const isLoggedIn = !!req.session.userId
    let profileImage = 'assets/profile-default.jpg' // Standaard afbeelding

    if (isLoggedIn) {
      const userId = new ObjectId(req.session.userId)
      profileImage = await getProfileImage(userId)
    }
    res.render('about-us', { isLoggedIn, profileImage })
    } catch (error) {
      sendError(req, res, 500, 'Server error')
    }
})

/***********/
/* Profile */
/***********/

//Functie om ervoor te zorgen dat het inladen van events een delay heeft
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form')
    return
  }

  try {
    const isLoggedIn = !!req.session.userId
    const userId = new ObjectId(req.session.userId)
    const user = await db.collection('users').findOne(
      { _id: userId })

    if (!user) {
      sendError(req, res, 404, 'User not found')
      return
    }

    const favoriteEventIds = Array.isArray(user.favorites) ? user.favorites : []
    let favoriteEvents = []

    for (const eventId of favoriteEventIds) {
      try {
        const response = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.KEY}`
        )
        favoriteEvents.push(response.data)
        await sleep(200)
      } catch (error) {
        console.error(`Error fetching event with ID ${eventId}:`, error)
      }
    }

    const { name, surname, email } = user
    const profileImage = await getProfileImage(userId)

    res.render('profile', { name, surname, email, profileImage, favoriteEvents, isLoggedIn })

  } catch (error) {
    console.error('Error fetching profile:', error)
    sendError(req, res, 500, 'Server error')
  }
})

/********************/
/* Profile Pictures */
/********************/

//Uploading profile picture
app.post('/upload-profile-picture', upload.single('profileImage'), async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form')
    return
  }

  //Checking of file geupload is
  if (!req.file || !req.file.buffer) {
    console.error('No file uploaded or file buffer is missing')
    return sendError(req, res, 400, 'No file uploaded')
  }

  try {
    const userId = new ObjectId(req.session.userId)
    const base64Image = req.file.buffer.toString('base64')

    const updateResult = await db.collection('users').updateOne(
      { _id: userId },
      { $set: { profileImage: base64Image } }
    )

    if (updateResult.modifiedCount === 1) {
      console.log(`Updated profile picture for user ${userId}`)
      res.redirect('/profile')
    } else {
      console.error('Failed to update profile picture')
      sendError(req, res, 500, 'Failed to update profile picture')
    }
  } catch (error) {
    console.error('Error updating profile picture:', error)
    sendError(req, res, 500, 'Server error')
  }
})

//Deleting profile picture
app.post('/delete-profile-picture', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form')
    return
  }

  try {
    const userId = new ObjectId(req.session.userId)

    // Deleting out of database
    await db.collection('users').updateOne(
      { _id: userId }, 
      { $unset: { profileImage: '' } })

    res.redirect('/profile')
  } catch (error) {
    console.error('Error deleting profile image from database', error)
    sendError(req, res, 500, 'Error deleting profile image from database')
  }
})

/*****************/
/* Updating data */
/*****************/

app.get('/update', async (req, res) => {
  try {
    if (!req.session.userId) {
      res.redirect('/form')
      return
    }
    const isLoggedIn = !!req.session.userId
    const userId = new ObjectId(req.session.userId)
    const profileImage = await getProfileImage(userId, true)
    res.render('update', { profileImage, isLoggedIn })
  } catch (error) {
    console.error('Error fetching user data:', error)
    sendError(req, res, 500, 'Server error')
  }
})

//Update name
app.post('/update-name', async (req, res) => {
  const {
    emailUpdate: email,
    fNameUpdate: firstName,
    lNameUpdate: lastName,
  } = req.body

  try {
    const filter = { email: email }
    const updateData = {
      $set: {
        name: firstName,
        surname: lastName,
      },
    }
    const options = { upsert: false }

    const result = await db.collection('users').updateOne(filter, updateData, options)

    if (result.matchedCount === 0) {
      sendError(req, res, 404, 'User not found')
    }

    console.log(`User details updated for email: ${email}`)
    res.redirect('/profile')
  } catch (error) {
    console.error('Error updating data in database', error)
    sendError(req, res, 500, 'Error updating data in database')
  }
})

//Update password
app.post('/update-password', async (req, res) => {
  const {
    emailUpdate: email,
    oldPassword,
    newPassword,
    confirmNewPassword,
  } = req.body

  if (newPassword !== confirmNewPassword) {
    sendError(req, res, 400, 'New passwords do not match')
    return
  }

  try {
    const user = await db.collection('users').findOne(
      { email: email })

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      sendError(req, res, 401, 'Invalid email or password')
      return
    }

    const saltRounds = 10
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    await db.collection('users').updateOne(
      { email: email }, 
      { $set: { password: hashedNewPassword } })

    console.log(`Password updated for email: ${email}`)
    res.redirect('/profile')
  } catch (error) {
    console.error('Error updating password in database', error)
    sendError(req, res, 500, 'Error updating password in database')
  }
})

/******************/
/* Delete profile */
/******************/

app.post('/delete_profile', async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/form')
    return
  }

  try {
    const userId = new ObjectId(req.session.userId)
    const deleteResult = await db.collection('users').deleteOne(
      {_id: userId })

    if(deleteResult.deletedCount === 1) {
      console.log(`Deleted account for user ${userId}`)
      req.session.destroy(err => {
        if (err) {
          console.error('Error destroying session', err)
          sendError(req, res, 500, 'Server error')
          return
        }
        res.redirect('/form')
      })
    } else {
      console.error('Failed to delete account')
      sendError(req, res, 500, 'Failed to delete account')
    }
  } catch (error) {
    console.error('Error deleting account from database', error)
    sendError(req, res, 500, 'Server error')
  }
})

/********/
/* Form */
/********/

app.get('/form', (req, res) => {
  const isLoggedIn = !!req.session.userId
  res.render('form', {isLoggedIn})
})

/************/
/* Registry */
/************/

app.post('/registry', async (req, res) => {
  const firstName = req.body.fName
  const lastName = req.body.lName
  const email = req.body.emailRegister
  const password = req.body.passwordRegister
  const confirmPassword = req.body.confirmRegisterPassword
 
  console.log(`Ontvangen gegevens: Naam - ${firstName}, Achternaam - ${lastName}, Wachtwoord - ${password}, Email - ${email}`) 
 
  try {
    //Checking if the email adress is unique
    const existingUser = await db.collection('users').findOne(
      { email: email })
    if (existingUser) {
      console.log('Email address already in use')
      sendError(req, res, 409, 'Email adress already in use')
    } else if (password != confirmPassword) {
      console.log('Passwords do not match')
      sendError(req, res, 409, 'Passwords do not match')
    }
 
    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('Password hashed:', hashedPassword)
 
    //Filling in the data of the user registry
    const result = await db.collection('users').insertOne(
      { name: firstName, 
        surname: lastName, 
        password: hashedPassword, 
        email: email })
    console.log(`Gebruiker opgeslagen met id: ${result.insertedId}`)
    
    // Update session with userId
    req.session.userId = result.insertedId

    // Redirect to profile page
    res.redirect('/profile')
 
  } catch (error) {
    console.error('Error inserting data into database', error)
    sendError(req, res, 500, 'Error inserting data into database')
  }
})

/***********/
/* Sign in */
/***********/

app.post('/signin', async (req, res) => {
  const email = req.body.emailSignin
  const password = req.body.passwordSignin

  try {
    const user = await db.collection('users').findOne(
      { email: email })

    // Gegevens uit MongoDB vergelijken voor inloggen
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id
      req.session.user = {
        name: user.name,
        surname: user.surname,
        email: user.email,
      }
      console.log('Login succesvol: Sessie gestart voor gebruiker ID:', user._id)
      res.redirect('/profile')
    } else {
      console.log('Invalid email or password')
      sendError(req, res, 401, 'Invalid email or password')
    }
  } catch (error) {
    console.error('Error fetching data from database', error)
    sendError(req, res, 500, 'Error fetching data from database')
  }
})

/************/
/* Sign out */
/************/

app.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      sendError(req, res, 500, 'Error logging out')
    }
    
    res.clearCookie('connect.sid')
    console.log('Uitloggen succesvol: Sessie beëindigd')
    res.redirect('/') // Redirect to homepage or login page after logout
  })
})

/**********/
/* Errors */
/**********/

app.get('/error', async (req, res) => {
  const errorCode = req.query.errorCode
  const errorMessage = req.query.errorMessage
  const isLoggedIn = !!req.session.userId
  const profileImage = await getProfileImage(userId, true)
  res.render('error', { errorCode, errorMessage, isLoggedIn, profileImage})
})

function sendError(req, res, errorCode, errorMessage) {
  const isLoggedIn = !!req.session.userId
  res.render('error', { errorCode, errorMessage, isLoggedIn })
}



// Middleware to handle not found errors - error 404
app.use((req, res) => {
  // log error to console
  console.error('404 error at URL: ' + req.url)
  // send back a HTTP response with status code 404
  sendError(req, res, 404, '404 error at URL'  + req.url)
})

// Middleware to handle server errors - error 500
app.use((err, req, res) => {
  // log error to console
  console.error(err.stack)
  // send back a HTTP response with status code 500
  sendError(req, res, 500, 'Server error')
})

// Start the webserver and listen for HTTP requests at specified port
app.listen(3000, () => {
  console.log(`I did not change this message and now my webserver is listening at port 3000`)
})
