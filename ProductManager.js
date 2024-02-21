const fs = require('fs')

class ProductManager {

    #products
    static #ultimoIdProducto = 1

    constructor(pathname) {
        this.#products = []
        this.path = pathname
    }

    async #readProducts() {
        try {
            const fileProducts = await fs.promises.readFile(this.path)
            this.#products = JSON.parse(fileProducts)
        }
        catch (err) {
            return []
        }
    }

    inicialize = async () => {
        this.#products = await this.getProducts()
        ProductManager.#ultimoIdProducto = this.#getNuevoIdInicio()        
    }

    #getNuevoIdInicio = () => {
        let mayorID = 0
        this.#products.forEach(item => {
            if (mayorID < item.id)
                mayorID = item.id
        });     
        mayorID = mayorID + 1   
        return mayorID
    }

    getProducts = async () => {
        try {
            await this.#readProducts()
            return this.#products
        }
        catch (err) {
            return []
        }
    }

    getProductById = (id) => {
        const codeIndex = this.#products.findIndex(e => e.id === id)
        if (codeIndex === -1) {
            return (`Producto con ID: ${id} Not Found`)
        } else {
            return this.#products[codeIndex]
        }
    }

    #getNuevoId() {
        const id = ProductManager.#ultimoIdProducto
        ProductManager.#ultimoIdProducto++
        return id
    }

    #soloNumYletras = (code) => {
        return (/^[a-z A-Z 0-9]+$/.test(code))
    }

    addProduct = async (title, description, price, thumbnail, code, stock) => {
        if (title.trim().length === 0) {
            console.error("Error. El campo titulo es invalido.")
            return
        }

        if (description.trim().length === 0) {
            console.error("Error. El campo descripción es invalido.")
            return
        }

        if (isNaN(price)) {
            console.error("Error. El campo precio es invalido.")
            return
        }

        if (thumbnail.trim().length === 0) {
            console.error("Error. El campo ruta de imagen es invalido.")
            return
        }

        if (isNaN(stock)) {
            console.error("Error. El campo stock es invalido.")
            return
        }

        if (!this.#soloNumYletras(code)) {
            console.error("Error. El campo codigo identificador es invalido.")
            return
        }

        const codeIndex = this.#products.findIndex(e => e.code === code)
        if (codeIndex !== -1) {
            console.error("Codigo ya existente")
            return
        }

        const product = {
            id: this.#getNuevoId(),
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        }

        this.#products.push(product)

        await this.#updateProducts()
    }

    async #updateProducts() {
        const fileProducts = JSON.stringify(this.#products, null, '\t')
        await fs.promises.writeFile(this.path, fileProducts)
    }

    updateProduct = async (product) => {
        if (product.title.trim().length === 0) {
            console.error("Error. El campo titulo es invalido.")
            return
        }

        if (product.description.trim().length === 0) {
            console.error("Error. El campo descripción es invalido.")
            return
        }

        if (isNaN(product.price)) {
            console.error("Error. El campo precio es invalido.")
            return
        }

        if (product.thumbnail.trim().length === 0) {
            console.error("Error. El campo ruta de imagen es invalido.")
            return
        }

        if (isNaN(product.stock)) {
            console.error("Error. El campo stock es invalido.")
            return
        }

        if (!this.#soloNumYletras(product.code)) {
            console.error("Error. El campo codigo identificador es invalido.")
            return
        }

        const producto = this.#products.find(item => ((item.code === product.code) && (item.id != product.id)))
        if (producto) {
            console.error("Codigo ya existente")
            return
        }

        const existingProductIdx = this.#products.findIndex(item => item.id === product.id)

        if (existingProductIdx < 0) {
            throw 'Invalid product!'
        }

        // actualizar los datos de ese product en el array
        const productData = { ...this.#products[existingProductIdx], ...product }
        this.#products[existingProductIdx] = productData

        await this.#updateProducts()
    }

    deleteProduct = async (idProd) => {
        const product = this.#products.find(item => item.id === idProd)
        if (product) {
            this.#products = this.#products.filter(item => item.id !== idProd)
            await this.#updateProducts()
        }
        else {
            console.error(`Producto con ID: ${idProd} Not Found`)
            return
        }
    }
}

// Testing de la clase
main = async () => {
    const manejadorDeProductos = new ProductManager('./Products.json')
    await manejadorDeProductos.inicialize()    
    console.log(await manejadorDeProductos.getProducts())
    await manejadorDeProductos.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin Imagen", "abc123", 25)
    console.log(await manejadorDeProductos.getProducts())
    await manejadorDeProductos.addProduct("producto prueba", "Este es un producto prueba", 300, "Sin Imagen", "abc124", 30)
    console.log(await manejadorDeProductos.getProducts())
    await manejadorDeProductos.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin Imagen", "abc123", 25)  // error porque el código esta repetido
    let product1 = await manejadorDeProductos.getProductById(1)
    if (product1) {    
        console.log(product1)     
        await manejadorDeProductos.updateProduct({ ...product1, stock: 40, price: 500 })
        console.log(await manejadorDeProductos.getProducts())
    }
    console.log(await manejadorDeProductos.getProductById(9))  // error porque no encuentra el producto
    await manejadorDeProductos.deleteProduct(2)
    console.log(await manejadorDeProductos.getProducts())
    await manejadorDeProductos.deleteProduct(5)  // error porque no encuentra el producto
    console.log(await manejadorDeProductos.getProducts())
}

main()

