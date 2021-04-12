require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')

require('./db/conn')
const Register = require('./models/registers')
const port = process.env.PORT || 8000;

const static_path = path.join(__dirname, '../public')
const template_path = path.join(__dirname, '../templates/views')
const partials_path = path.join(__dirname, '../templates/partials')

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set('views', template_path)
hbs.registerPartials(partials_path);

app.get('/', (req,res) => {
    res.render("index")
});

app.get('/login', (req,res) => {
    res.render("login")
});

app.get('/secret', auth, (req,res) => {
    res.render("secret")
});

app.get('/logout', auth, async (req,res) => {
    try {
        res.clearCookie("jwt");

        //for current user
        // req.user.Tokens = req.user.Tokens.filter((currentElement) => {
        //     return currentElement.token !== req.token
        // })

        // for all user
        req.user.Tokens = []

        console.log("Logout successfuly !")
        await req.user.save();
        res.render('login')
    } catch (error) {
        res.status(500).send(error)
    }
});

app.get('/register', (req,res) => {
    res.render("register")
});
app.post('/register', async (req,res) => {
    try {
        
        const Password = req.body.password;
        const ConfirmPassword = req.body.confirm_password;

        if(Password === ConfirmPassword){
            const registerEmployee = new Register({
                Firstname : req.body.firstname ,
                Lastname : req.body.lastname ,
                Email : req.body.email ,
                Gender : req.body.gender ,
                Phone : req.body.phone ,
                Age : req.body.age ,
                Password : req.body.password ,
                ConfirmPassword : req.body.confirm_password ,
            });
           
// console.log(registerEmployee)

            const token = await registerEmployee.generateAuthToken();

            res.cookie("jwt", token , {
                expires: new Date(Date.now() + 60000),
                httpOnly: true
            })

            const registered = await registerEmployee.save();
            // console.log(registered)
            res.status(201).render('index')
        }else{
            res.send('Password are not matched')
        }

    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});

app.post('/login', async (req, res) => {
    try {
        const Email = req.body.email;
        const Password = req.body.password;

        const userEmail = await Register.findOne({Email: Email});
        // console.log(userEmail)
        const isMatch = await bcrypt.compare(Password, userEmail.Password)
        const token = await userEmail.generateAuthToken();

        res.cookie("jwt", token , {
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            // secure:true
        })



        // if(userEmail.Password === Password){
            if(isMatch){
            res.status(201).render('index')
        }else{
            res.send("Credential don't matched.")
        }
    } catch (error) {
        res.status(400).send("Invalid Credential ")
    }
})


app.listen(port, () => {
    console.log(`Backend is running at ${port} !`)
})