const express = require('express');
const path = require('path');
const url = require('url');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const generator = require('generate-password');

const db_link = "mongodb+srv://Ayush:8tcbE7sZFKKk6Hc@cluster0.afqwe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(db_link)
.then(function(db){
    console.log("database connected");
}).catch(function(err){
    console.log("database error: " + err);
})

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minLength:8
    },
    confirmPassword:{
        type:String,
        required:true,
        minLength:8
    }
})

const usermodel = mongoose.model('usermodel',userSchema);



var transporter = nodemailer.createTransport({
    service: 'gmail',
  auth: {
    user: 'ayushrishik.punk@gmail.com',
    pass: 'Asyau@12345'
  }
})

app.listen(3000);

app.use(express.static('mainimages'));
app.use(express.static('signupimages'));
app.use(express.static('galleryimages'));
app.use(express.static('contactimages'));
app.use(express.static('traveladvisor'));

app.get('/',(req, res) => {
    res.sendFile(path.join(__dirname, '/main.html'));
});

app.get('/signin',(req, res) => {
    const data = url.parse(req.url,true).query;
    var check = authenticate(data.email);
    var flag = false;
    if(check){
        flag = true;
    }
    if(flag){
        console.log(`email check successful for ${data.email}`);
        usermodel.findOne({ email:data.email,password:data.password},(err,datagot)=>{
            if(err){
                console.log(err);
            }
            if(datagot == null){
                res.sendFile(path.join(__dirname,'/nouser.html'));
            }else{
                res.sendFile(path.join(__dirname,'/signinsuccessfull.html'));
            }
        });
    }else{
        res.sendFile(path.join(__dirname,'/incorrect.html'));
    }
})

app.get('/forgot',(req, res)=>{
    res.sendFile(path.join(__dirname,'/forgotpass.html'));
})

app.get('/checkforgotemail',(req, res)=>{
    const data = url.parse(req.url,true).query;
    usermodel.findOne({ email:data.email},(err,userdata)=>{
        if(err){
            console.log(err);
        }
        if(userdata == null){
            console.log("Email not in database");
            res.send("Email not found");
        }else{
            const password = generator.generate({
                length:10,
                numbers: true,
                lowercase: true,
                uppercase: true,
            })

            console.log(`Generated password: ${password}`);

            var maildata = {
                from: 'ayushrishik.punk@gmail.com',
                to: `${data.email}`,
                subject: 'New Password for login',
                html: `<h1>Password</h1><p>${password}</p>`
            };
        
            transporter.sendMail(maildata,function(error1,info) {
                if(error1) {
                    console.log(error1);
                }else{
                    console.log('Email sent:'+info.response);
                }
            });
            
            usermodel.update({email:data.email},{password:password,confirmPassword:password},(error,info) => {
                if(error) {
                    console.log(error);
                }
                console.log(info);
            });

            res.sendFile(path.join(__dirname,'newpassword.html'));
        }
    })
})

app.get('/signup',(req, res) => {
    res.sendFile(path.join(__dirname, 'signuppage.html'));
});

app.get('/signupcheck',(req, res)=>{
    const data = url.parse(req.url,true).query;
    let user = {
        name: data.names,
        email: data.emails,
        password: data.passwords,
        confirmPassword: data.cpasswords
    };

    console.log(user);
    usermodel.create(user,(err, info)=>{
        if(err){
            console.log("Email already exists.");
            res.sendFile(path.join(__dirname,'error.html'));
        }else{
            console.log("Data inserted successfully");
            res.sendFile(path.join(__dirname,'datasaved.html'));
        }
    });
})

app.get('/gallery',(req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
})

app.get('/contact',(req, res) => {
    res.sendFile(path.join(__dirname,'contact.html'));
})

app.get('/travel',(req, res) => {
    res.sendFile(path.join(__dirname,'traveladvisor.html'));
})

app.get('/res',(req, res) => {
    const qdata = url.parse(req.url,true).query;
    console.log(qdata);

    var maildata = {
        from: 'ayushrishik.punk@gmail.com',
        to: `${qdata.email}`,
        subject: 'Will send promotions to this mail.',
        html: `<h1>${qdata.name}</h1><p>Thankyou for selecting us.</p>`
    };

    transporter.sendMail(maildata,function(err,info) {
        if(err) {
            console.log(err);
        }else{
            console.log('Email sent:'+info.response);
        }
    });

    res.send("Thankyou for showing interest in us, please check your mail.");
})

function authenticate(email){
    var pattern=/^[a-zA-z0-9]{2,}[.]{0,1}[a-zA-z0-9]{1,}@[a-z]{2,}[.]{1}[a-z]{2,3}[.]{0,1}[a-z]{0,3}$/;
    if(pattern.test(email)){
        console.log("email status ok");
        return true;
    }else{
        console.log("email not appropiate");
        return false;
    }
}
