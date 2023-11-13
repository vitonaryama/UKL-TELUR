/**panggil si expres */
const express = require(`express`)

/**buat object dari express */
const app = express()

/*izin membaca data dari body*/
app.use(express.urlencoded({ extended: true }))

/**memanggil controller transaksi */
const transaksiController = require(`../controllers/transaksi.controller`)


const authorization = require(`../middleware/authorization`)

/**membuat route untuk menampilkan form transaksi */
app.get(`/add`, authorization.cekUser, transaksiController.showFormTransaksi)

// utk menyimpan transaksi
app.post(`/add`, authorization.cekUser, transaksiController.simpanTransaksi)

app.get(`/`, authorization.cekUser, transaksiController.showTransaksi)

app.get(`/:id`, authorization.cekUser,transaksiController.hapusTransaksi)
/**exports object app */
module.exports = app
