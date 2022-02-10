const express = require('express')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config({
    path: './config.env'
})
const fileupload = require("express-fileupload")
require('./db/conn')
var port = process.env.PORT || 8080;

app.use(bodyParser.json({
    limit: '30mb',
    extended: true
}))
app.use(bodyParser.urlencoded({
    limit: '30mb',
    extended: true
}))
app.use(cors())

app.use(fileupload({
    useTempFiles: true
}))



app.use(express.json())

// adding routes
app.use(require('./routes/AdminRoutes'))
app.use(require('./routes/AgencyRoutes'))
app.use(require('./routes/ProductsRoutes'))
app.use(require('./routes/OperatorRoutes'))
app.use(require('./routes/MemberRoutes'))
app.use(require('./routes/SubscriptionRoutes'))
app.use(require('./routes/CollectionRoutes'))





app.listen(process.env.PORT || 8080, (req, res) => {
    console.log(`Express Server Running at ${port}`)
})