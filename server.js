if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// Modules
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
// const methodOverride =  require('method-override');
const initializePassport = require('./passport-config');
// Modules(End)

// Passport
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id));
// Passport(End)

// Users
const users = [];
// Users(End)

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
// app.use(methodOverride('_method'));
// Middleware(End)

// Routes
app.get('/', checkAuthenticated,(req, res) => {
    res.render('index.ejs', {name: req.user.name});
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        res.redirect('/login');
    }catch{
        res.redirect('/register');
    }
    console.log(users);
});

app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  });
// Routes(End)

// Check if user is authenticated
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}
// Check if user is authenticated(End)

// Listen
app.listen(3000);
// Listen(End)