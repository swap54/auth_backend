const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-parser');
const bodyParser  =require('body-parser');
const cookieParser = require('cookie-parser');
const User = require('./user')
const port = process.env.PORT || 3001;
mongoose.connect('mongodb+srv://new_user:QJ50mjZuRxCF5EMN@cluster0.7gatw.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true 
}).then( () => {
    console.log('Connected to the database ')
})
.catch( (err) => {
    console.error(`Error connecting to the database. n${err}`);
})

//Middleware
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// app.use(cors({
//     origin:"https://auth-frontend-five.vercel.app/",
//     credentials:true
// }));
app.use(cors());
app.use(session({
    secret: "secretcode",
    resave:true,
    saveUninitialized:true
}))
app.use(cookieParser("secretcode"))
app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);


//Routes
app.post('/register',(req,res)=>{
    User.findOne({username:req.body.username}, async(err,doc)=>{
        if(err) throw err;
        if(doc) res.send({message:"User already exists"});
        if(!doc){
            const hashedPassword = await bcrypt.hash(req.body.password,10);
            const newUser = new User({
                username:req.body.username,
                password:hashedPassword,
            });
            await newUser.save();
            res.send("User created");
        }
    });
    
});
app.post('/login',(req,res,next)=>{
    passport.authenticate("local",(err,user, info)=>{
        if(err) throw err;
        if(!user) res.send({message:"No user exists"});
        else{
            req.logIn(user,err=>{
                if(err) throw err;
                res.send(req.user);
                console.log(req.user);
            })
        }
    })(req,res,next)
})

app.listen(port,()=>{
    console.log("server running");
})