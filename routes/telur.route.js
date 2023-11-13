/** load express js */
const express = require(`express`)

/**  create object of express */
const app = express()

/** load telur controller*/
const telurController = require(`../controllers/telur.controller`)

const authorization = require(`../middleware/authorization`)
/**allow route to read urlencoded data */
app.use(express.urlencoded({ extended: true }))

/**create route for access telur's data */
app.get("/",authorization.cekUser, telurController.showDataTelur)

/** create route for show add telur view */
app.get("/add", authorization.cekUser, telurController.showAddPage)

/** create route for process of add new obat */
app.post("/add",authorization.cekUser, telurController.processInsert)

/** create route for show edit obat view */
app.get("/edit/:id",authorization.cekUser, telurController.showEditPage)
    /** :id -> name of paramter URL */

/** create route for process edit obat */
app.post("/edit/:id",authorization.cekUser, telurController.processUpdate)

/** :id -> name of paramter URL */


/** create route for process delete obat */
app.get("/delete/:id",authorization.cekUser, telurController.processDelete)
    /** :id -> name of paramter URL */

/** export object "app" to another file*/
module.exports = app