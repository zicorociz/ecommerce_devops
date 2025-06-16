import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(); // Hindari pemanggilan berulang

const Header = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <header className='text-gray-600 bg-gray-900 body-font'>
      <div className='container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center'>
        <Link to='/' className='flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            className='w-10 h-10 text-white p-2 bg-yellow-500 rounded-full'
            viewBox='0 0 24 24'
          >
            <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
          </svg>
          <span className='ml-3 text-xl text-white'>Ecommerce</span>
        </Link>

        <nav className='md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center text-white'>
          <Link to='/' className='mr-5 hover:text-yellow-500'>Home</Link>
          <Link to='/ProductPage' className='mr-5 hover:text-yellow-500'>Product</Link>
          <Link to='/About' className='mr-5 hover:text-yellow-500'>About</Link>
          <Link to='/Context' className='mr-5 hover:text-yellow-500'>Context</Link>
        </nav>

        {user ? (
          <button
            onClick={handleLogout}
            className='inline-flex items-center text-white bg-transparent border-0 py-2 px-4 focus:outline-none hover:bg-red-500 hover:text-white rounded text-base mt-4 md:mt-0 mr-4'
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to='/login'
              className='inline-flex items-center text-white bg-transparent border-0 py-2 px-4 focus:outline-none hover:bg-yellow-500 hover:text-white rounded text-base mt-4 md:mt-0 mr-4'
            >
              Login
            </Link>
            <Link
              to='/signup'
              className='inline-flex items-center text-white bg-transparent border-0 py-2 px-4 focus:outline-none hover:bg-yellow-500 hover:text-white rounded text-base mt-4 md:mt-0 mr-4'
            >
              Sign Up
            </Link>
          </>
        )}

        <Link
          to='/ShoppingCard'
          className='inline-flex items-center text-white bg-yellow-500 border-0 py-2 px-4 focus:outline-none hover:bg-yellow-700 rounded text-base mt-4 md:mt-0'
        >
          Add to Cart
          <svg
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            className='w-4 h-4 ml-1'
            viewBox='0 0 24 24'
          >
            <path d='M5 12h14M12 5l7 7-7 7' />
          </svg>
        </Link>

        <div className='mx-3'>
          <label className='swap swap-rotate'>
            <input type='checkbox' checked={isChecked} onChange={toggleCheckbox} className="hidden"/>
            {isChecked ? (
              <svg
                className='swap-off text-yellow-500 fill-current w-10 h-10'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                aria-hidden={!isChecked}
                
              >
                <path d='M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z' />
              </svg>
            ) : (
              <svg
                className='swap-on text-yellow-500 fill-current w-10 h-10'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                aria-hidden={isChecked}
              >
                <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41Z' />
              </svg>
            )}
          </label>
        </div>
      </div>
    </header>
  );
};

export default Header;
