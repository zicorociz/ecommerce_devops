import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loadrer from "../utiliy/Loadrer";
// ✅ 1. IMPORT FUNGSI FIREBASE DAN AUTH
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      const data = await response.json();
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  // ✅ 2. UBAH TOTAL FUNGSI handleCart UNTUK MENGGUNAKAN FIRESTORE
  const handleCart = async (productToAdd) => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Jika user tidak login, jangan lakukan apa-apa (atau beri peringatan)
    if (!user) {
      toast.error("You must be logged in to add items to the cart!", { position: "top-right" });
      return;
    }

    const db = getFirestore();
    const cartRef = doc(db, 'shoppingCarts', user.uid);

    toast.info("Adding to cart...", { position: "top-right", autoClose: 1000 });

    try {
      // Ambil data keranjang yang sudah ada dari Firestore
      const cartSnap = await getDoc(cartRef);
      const existingCart = cartSnap.exists() ? cartSnap.data().items : [];

      // Cek apakah produk sudah ada di keranjang
      const isProductExist = existingCart.find((item) => item.id === productToAdd.id);

      let updatedCart;
      if (isProductExist) {
        // Jika sudah ada, tambah kuantitasnya
        updatedCart = existingCart.map((item) =>
          item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Jika belum ada, tambahkan produk baru dengan kuantitas 1
        updatedCart = [...existingCart, { ...productToAdd, quantity: 1 }];
      }

      // Simpan kembali seluruh keranjang yang sudah diperbarui ke Firestore
      await setDoc(cartRef, { items: updatedCart });
      toast.success("Item added successfully!", { position: "top-right" });

    } catch (error) {
      console.error("Error updating cart: ", error);
      toast.error("Failed to add item to cart.", { position: "top-right" });
    }
  };

  if (!Object.keys(product).length) return <Loadrer />;

  return (
    <section className="text-gray-400 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <img
            alt={product?.title}
            className="lg:w-1/2 w-full lg:h-auto max-h-[35rem] h-64 object-contain object-center rounded"
            src={product?.image}
          />
          <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
            <h2 className="text-sm title-font text-gray-500 tracking-widest">{product?.category}</h2>
            <h1 className="text-gray-500 text-3xl title-font font-medium mb-1">{product?.title}</h1>
            <p className="leading-relaxed">{product?.description}</p>

            <div className="flex mt-6 items-center">
              <span className="title-font font-medium text-2xl">${product?.price}</span>
              <button
                onClick={() => handleCart(product)}
                className="flex ml-auto text-white bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-600 rounded"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </section>
  );
};

export default ProductPage;