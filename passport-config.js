//Strategies in passport are basically the features and the authentication
// mechanisms and other OAuth providers together known as Srategies 
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if(user == null) {
            return done(null, false, { message: 'No user with that email'})
        }

        try {
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false , { message: 'Password incorrect'})
            }
        } catch (e) {
            return done(e)
        }

    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    //serializing our user help to create a session in our database
    passport.serializeUser((user, done) => done(null, user.id))

    //deserialize does the exact opposite of the serialise
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })

}

module.exports = initialize
