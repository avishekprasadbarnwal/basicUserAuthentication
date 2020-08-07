if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const saltRounds = 10
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    
)

const users = []

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    //this secret contains the secret that is used to encrypt our passwords
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
//passport.session is used to store the variables persistently inside our express session
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name })
})

app.get('/login',checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    
    } catch{
        res.redirect('/register')

    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

//this function is a middleware function ehich is used to check whether the user is authenticated or not who is trying to access that particular part of our app
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

//this function checks and allows the routes to reached only when the user is not loggedin
function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}


port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("server running at port " + port)
})