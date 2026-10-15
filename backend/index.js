require('dotenv').config()
const express = require("express");
const path=require('path');
const connectDB=require('./app/config/db.config')
const cors=require('cors');
const session=require('express-session');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const {rateLimit}=require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan')



const app=express();
 connectDB()
app.use(morgan('combined'))
app.use(helmet());
app.use(cors());

// Apply to all requests: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    error: 'Too many requests. Please try again later.',
  },
});

app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
     }
  }))
//   app.use(flash());

  app.use(cookieParser());


//set view engine
// app.set('view engine','ejs');
// app.set('views','views')

//setup body parser
app.use(express.json({
    limit:'50mb',
    extended:true
}));
app.use(express.urlencoded({extended:true}))
//static folder
app.use(express.static('public'));

app.use('uploads',express.static(path.join(__dirname,'/uploads')))
app.use('/uploads',express.static('uploads'));  


const authRoutes=require('./app/route/user.route');
const doctorRoutes=require('./app/route/doctor.route');
const clinicRoutes=require('./app/route/clinic.route');
const departmentRoutes=require('./app/route/department.route');
const appointmentRoutes=require('./app/route/appointment.route');
const patientRoutes=require('./app/route/patient.route');
const receptionistRoutes=require('./app/route/receptionist.route');
const adminRoutes=require('./app/route/admin.route');


app.use('/api/auth',authRoutes);
app.use('/api/doctors',doctorRoutes);
app.use('/api/clinics',clinicRoutes);
app.use('/api/departments',departmentRoutes);
app.use('/api/appointments',appointmentRoutes);
app.use('/api/patients',patientRoutes);
app.use('/api/receptionists',receptionistRoutes);
app.use('/api/admin',adminRoutes);

const PORT=process.env.PORT || 8080;
app.listen(PORT,(error)=>{
    if(error){
        console.log(`Error in PORT Listening : ${error.message}`);
    }else{
        console.log("server is running on port ",`http://localhost:${PORT}`);
    }
})

