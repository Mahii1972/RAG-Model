'use client'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AiOutlineHome, AiOutlineDatabase, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 p-2 bg-black/80 text-white rounded-md"
      >
        {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </button>
      <nav className={`bg-black/80 backdrop-blur-sm text-white ${isOpen ? 'w-64' : 'w-0'} min-h-screen p-4 transition-all duration-300 overflow-hidden`}>
        <ul className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 mt-12`}>
          <li className="mb-4 flex justify-center">
            <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              <Image
                src="https://i.imgur.com/k9qeb6U.png"
                alt="Logo"
                width={64}
                height={64}
                className="mb-4 cursor-pointer"
              />
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/" className="block hover:text-gray-300 flex items-center">
              <AiOutlineHome className="mr-2" /> Home
            </Link>
          </li>
          <li>
            <Link href="/addfiles" className="block hover:text-gray-300 flex items-center">
              <AiOutlineDatabase className="mr-2" /> Knowledge Base
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
