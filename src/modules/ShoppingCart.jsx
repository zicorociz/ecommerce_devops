import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorPage from './ErrorPage';
// 1. Impor Firebase ditambahkan
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ShoppingCart = () => {
  const navigate = useNavigate();
  
  // 2. State dan useEffect diubah untuk mengambil data dari Firestore
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        // Jika tidak ada user, bisa diarahkan ke halaman login atau menampilkan pesan
        console.log("No user logged in, using local cart or showing empty.");
        // Untuk sementara, bisa biarkan cart kosong atau coba ambil dari localStorage
        // const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        // setCart(localCart);
        return;
      };

      const db = getFirestore();
      const cartRef = doc(db, 'shoppingCarts', user.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        setCart(cartSnap.data().items || []);
      } else {
        // Jika dokumen cart di Firestore belum ada
        setCart([]);
      }
    };

    fetchCart();
  }, []); // Bergantung pada user, tapi untuk simpelnya kita panggil sekali saat mount

  // 5. useEffect terpisah untuk menghitung total secara dinamis
  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => {
        // Pastikan price adalah angka
        const price = parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
        return acc + (price * item.quantity);
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  // 3. Fungsi untuk menyimpan cart ke Firestore
  const saveCart = async (updatedCart) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const cartRef = doc(db, 'shoppingCarts', user.uid);
    await setDoc(cartRef, { items: updatedCart });
    setCart(updatedCart); // Update state untuk re-render
  };

  // 4. handleInc, handleDec, dan removerProduct diubah
  const handleInc = (id) => {
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updatedCart);
  };

  const handleDec = (id) => {
    const updatedCart = cart
      .map(item =>
        item.id === id ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item // Mencegah kuantitas < 1
      )
      // Jika ingin menghapus item saat kuantitas jadi 0, gunakan filter
      .filter(item => item.quantity > 0);
    saveCart(updatedCart);
  };

  const removerProduct = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    saveCart(updatedCart);
  };


  if (cart.length === 0) {
    return (<ErrorPage title='Cart is Empty' des='Your Shopping Cart is Empty' buttonOne='Continue Shopping' buttonTwo='Go Home' />);
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Shopping Card
        </h1>
        <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section
            aria-labelledby="cart-heading"
            className="lg:col-span-8 bg-white dark:bg-slate-600"
          >
            <h2 id="cart-heading" className="sr-only text-black">
              Items in your shopping card
            </h2>

            <ul
              className="divide-y divide-gray-200 border-t border-b border-gray-200"
            >
              {cart.map((product) => (
                <div key={product.id} className="px-4">
                  <li className="flex py-6 sm:py-6 ">
                    <div className="flex-shrink-0">
                      <Link to={`/ProductPage/${product.id}`}>
                        <img
                          src={product?.image || product?.imageSrc} // Menyesuaikan dengan berbagai key
                          alt={product?.title || product?.name}
                          className="h-24 w-24 rounded-md object-contain object-center sm:h-38 sm:w-38"
                        />
                      </Link>
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link to={`/ProductPage/${product.id}`}
                                className="font-medium text-lg text-gray-700 dark:text-white"
                              >
                                {product?.title || product?.name}
                              </Link>
                            </h3>
                          </div>
                          <div className="mt-1 flex text-sm">
                            <p className="text-gray-500 dark:text-gray-200">
                              {product.color}
                            </p>
                            {product.size ? (
                              <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500 dark:text-gray-200">
                                {product.size}
                              </p>
                            ) : null}
                          </div>
                          <div className="mt-1 flex items-end">
                            {/* Menampilkan harga dengan format yang benar */}
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              ${parseFloat(String(product.price).replace(/[^0-9.-]+/g, "")).toFixed(2)}
                            </p>
                            {product.discount && (
                                <p className="ml-2 text-sm font-medium text-green-500">
                                {product.discount}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <div className="flex mb-2">
                    <div className="flex min-w-24 dark:text-white">
                      <button
                        type="button"
                        className="h-7 w-7 rounded-full border border-[#e0e0e0]"
                        onClick={() => handleDec(product?.id)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="h-7 w-9 text-center mx-1 border dark:bg-white dark:text-black"
                        value={product?.quantity}
                        readOnly // Sebaiknya readOnly agar tidak bisa diubah manual
                      />
                      <button
                        type="button"
                        className="h-7 w-7 rounded-full border border-[#e0e0e0] flex justify-center items-center"
                        onClick={() => handleInc(product?.id)}
                      >
                        +
                      </button>
                    </div>
                    <div className="ml-4 flex flex-1 sm:ml-6 dark:text-white">
                      <button type="button" className="font-medium mr-4 ">SAVE FOR LATER</button>
                      <button type="button" className="font-medium text-yellow-400 hover:text-yellow-200" onClick={() => removerProduct(product?.id)}>REMOVE</button>
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-md bg-white dark:bg-slate-600 lg:col-span-4 lg:mt-0 lg:p-0"
          >
            <h2
              id="summary-heading"
              className=" px-4 py-3 sm:p-4 border-b border-gray-200 text-lg font-medium text-gray-900 dark:text-gray-200"
            >
              Price Details
            </h2>

            <div>
              <dl className=" space-y-1  px-6 py-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-800 dark:text-gray-200">
                    Price ({cart.length} item)
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ₹ {total.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <dt className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                    <span>Discount</span>
                  </dt>
                  <dd className="text-sm font-medium text-green-700 dark:text-green-400">
                    {/* Diskon bisa dibuat dinamis nanti */}
                    - ₹ 3,431 
                  </dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="flex text-sm text-gray-800 dark:text-gray-200">
                    <span>Delivery Charges</span>
                  </dt>
                  <dd className="text-sm font-medium text-green-700 dark:text-green-400">
                    Free
                  </dd>
                </div>
                <div className="flex items-center justify-between py-4 border-y border-dashed ">
                  <dt className="text-base font-medium text-gray-900 dark:text-white">
                    Total Amount
                  </dt>
                  <dd className="text-base font-medium text-gray-900 dark:text-white">
                  {/* Total amount bisa dikurangi diskon jika diperlukan */}
                    ₹ {total.toFixed(2)}
                  </dd>
                </div>
              </dl>
              <div className="px-6 pb-4 font-medium text-green-700 dark:text-green-400">
                You will save ₹ 3,431 on this order
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-md transition duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}

export default ShoppingCart;

