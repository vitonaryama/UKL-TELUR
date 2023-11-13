/** memanggil model telur */
const telurModel = require(`../models/telur.model`)

/**memanggil model member */
const memberModel = require(`../models/member.model`)

/** memanggil model transaksi */
const transaksiModel = require(`../models/transaksi.model`)

/** memanggil model detail transaksi */
const detailModel = require(`../models/detail_transaksi.model`)

/** memanggil model pack */
const packModel = require(`../models/pack.model`)

/** memanggil route transaksi */
const { request, response } = require("../routes/auth.route")

/** membuat function utk menampilkan form transaksi */
exports.showFormTransaksi = async (request, response) => {
    try {
        /**ambil data telur */
        let telur = await telurModel.findAll()
        //  ambil data pack
        let pack = await packModel.findAll()
        /** ambil data member */
        let member = await memberModel.findAll()
        /** prepare data yang akan di passing ke view */
        let sendData = {
            dataTelur: telur,
            dataMember: member,
            dataPack: pack,
            page: `form-transaksi`,
            tgl_transaksi: ``,
            dataTelurString: JSON.stringify(telur), //string
            dataPackString: JSON.stringify(pack), //string
            dataUser: request.session.dataUser,
            cart: request.session.cart
        }
        return response.render(`../views/index`, sendData)
    } catch (error) {
        /** handling error */
        let sendData = {
            message: error
        }
        return response.render(`../views/error-page`, sendData)
    }
}

/** membuat fungsi utk menambahkan obat kedalam keranjang */
exports.addToCart = async (request, response) => {
    try {
        /** dapetin data obat berdasarkan id obat yang dikirimkan */
        let selectedTelur = await telurModel.findByCriteria({
            id: request.body.id_telur //key nya id
        })
        let selectedPack = await packModel.findByCriteria({
            id: request.body.id_pack //key nya id
        })
        /** tampung / receive data yang dikirimkan */
        let storeData = {
            id_telur: request.body.id_telur,
            jenis_telur: selectedTelur[0].jenis_telur,
            jumlah_telur: request.body.jumlah_telur,
            harga_telur: request.body.harga_telur,
            id_pack: request.body.id_pack,
            nama_pack: selectedPack[0].nama_pack,
            jumlah_pack: request.body.jumlah_pack,
            harga_pack: request.body.harga_pack
        }

        /** masukkan data ke keranjang menggunakan session */
        request.session.cart.push(storeData) //push() : menambah data kedalam array

        /** direct ke halaman form-transaksi */
        return response.redirect(`/transaksi/add`)

    } catch (error) {
        /** handling error */
        let sendData = {
            message: error
        }
        return response.render(`../views/error-page`, sendData)
    }
}

/** function utk menghapus data item pada cart (keranjang) */
exports.hapusCart = async (request, response) => {
    try {
        /**ambil seluruh data cart pada session */
        let cart = request.session.cart

        /**ambil id obat yang akan dihapus dari cart */
        let id_telur = request.params.id

        /** cari posisi index dari data yang akan dihapus */
        let index = cart.findIndex(item => item.id_telur == id_telur)

        /** hapus data sesuai index yang ditemukan */
        cart.splice(index, 1) //splice digunakan untuk menghapus data pada array

        /** kembalikan data cart ke dalam sebuah session */
        request.session.cart = cart

        /** direct de halaman form transaksi */
        return response.redirect(`/transaksi/add`)

    } catch (error) {
        /** handling error */
        let sendData = {
            message: error
        }
        return response.render(`../views/error-page`, sendData)
    }
}

/** function utk menyimpan data transaksi */
exports.simpanTransaksi = async (request, response) => {
    try {
        /** tampung data yg dikirimkan */
        let newTransaksi = {
            tgl_transaksi: request.body.tgl_transaksi,
            id_member: request.body.id_member,
            id_admin: request.session.dataUser.id
        }

        /** simpan transaksi */
        let resultTransaksi = await transaksiModel.add(newTransaksi)

        /** menampung isi cart */
        let cart = request.session.cart

        for (let i = 0; i < cart.length; i++) {
            /** hapus dulu data key "jenis_telur" dari cart */
            delete cart[i].jenis_telur
            delete cart[i].nama_pack

            /** tambah key "id_transaksi" ke dalam cart */
            cart[i].id_transaksi = resultTransaksi.insertId

            /** eksekusi simpan cart ke detail transaksi */
            await detailModel.add(cart[i])
        }

        /** hapus cart-nya */
        request.session.cart = []

        return response.redirect(`/transaksi/add`)

    } catch (error) {
        /** handling error */
        let sendData = {
            message: error
        }
        return response.render(`../views/error-page`, sendData)
    }
}

/** menampilkan data transaksi */
exports.showTransaksi = async (request, response) => {
    try {
        /** ambil data transaksi */
        let transaksi = await transaksiModel.findAll()

        /** sisipin data detail dari setiap transaksi */
        for (let i = 0; i < transaksi.length; i++) {
            let id = transaksi[i].id

            //ambil data detailnya sesuai id
            let detail = await detailModel.findByCriteria({ id_transaksi: id })

            //sisipin detail ke transaksinya
            transaksi[i].detail = detail
        }

        /** prepare yang dikirim ke view */
        let sendData = {
            page: `transaksi`,
            dataUser: request.session.dataUser,
            transaksi: transaksi
        }

        return response.render(`../views/index`, sendData)

    } catch (error) {
        /** handling error */
        let sendData = {
            message: error
        }
        return response.render(`../views/error-page`, sendData)
    }

}

/** membuat function uynuk menghapus data transaksi */
exports.hapusTransaksi = async (request, response) => {
    try {
        /** menampung sata id yang akan dihapus */
        let id = request.params.id

        /** menghapus data detail transaksinya */
        await detailModel.delete({ id_transaksi: id })

        /** menghapus data transaksi */
        await transaksiModel.delete({ id: id })

        /** kembali lagi ke halaman transaksi */
        return response.redirect(`/transaksi`)

    } catch (error) {
        let sendData = {
            message: error
        }
        return response.render(`../views/error-page`, sendData)
    }
}