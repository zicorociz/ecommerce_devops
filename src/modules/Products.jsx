import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'; // Tambahkan Link untuk navigasi

const Products = () => {
  // PERBAIKAN: Ganti nama state menjadi 'products' agar lebih jelas
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      // PERBAIKAN: Ubah URL untuk mengambil SEMUA produk
      const response = await fetch(`https://fakestoreapi.com/products`)
      const data = await response.json()
      console.log(data)
      // PERBAIKAN: Set data produk ke state 'products'
      setProducts(data)
    }
    fetchProducts()
  }, [])

  return (
    <section className="text-gray-400 body-font bg-gray-900">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-wrap w-full mb-20">
          <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white">
              All Products
            </h1>
            <div className="h-1 w-20 bg-yellow-500 rounded" />
          </div>
          <p className="lg:w-1/2 w-full leading-relaxed text-gray-400 text-opacity-90">
            Browse our collection of high-quality products.
          </p>
        </div>
        <div className="flex flex-wrap -m-4">
          {
            // PERBAIKAN: Ganti 'categories.map' menjadi 'products.map'
            products.map((item) => (
              <div key={item.id} className="xl:w-1/4 md:w-1/2 p-4">
                {/* Tambahkan Link agar bisa diklik */}
                <Link to={`/ProductPage/${item.id}`}>
                  <div className="bg-gray-800 bg-opacity-40 p-6 rounded-lg h-full flex flex-col">
                    <img
                      className="h-40 rounded w-full object-contain object-center mb-6"
                      src={item.image}
                      alt={item.title}
                    />
                    <h3 className="tracking-widest text-yellow-400 text-xs font-medium title-font uppercase">
                      {item.category}
                    </h3>
                    <h2 className="text-lg text-white font-medium title-font mb-4 flex-grow">
                      {item.title}
                    </h2>
                    <p className="leading-relaxed text-base font-bold">
                      ${item.price}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default Products