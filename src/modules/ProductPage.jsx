import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loadrer from "../utiliy/Loadrer";

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

  const handleCart = (product) => {
    toast.success("Item added!", { position: "top-right" }); // ✅ Hanya muncul di kanan atas
    console.log(product);

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const isProductExist = cart.find((item) => item.id === product.id);

    if (isProductExist) {
      const updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem("cart", JSON.stringify([...cart, { ...product, quantity: 1 }]));
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

            <div className="flex">
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

      {/* ✅ Tambahkan posisi agar Toast hanya muncul di satu tempat */}
      <ToastContainer position="top-right" />
    </section>
  );
};

export default ProductPage;
