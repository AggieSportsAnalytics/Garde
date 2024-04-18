"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import "../app/globals.css";

const navbar = () => {
  const [nav, setNav] = useState(false);
  const [shadow, setShadow] = useState(false);
  const hamburgerRef = useRef(null);

  const handleNav = () => {
    setNav(!nav);
    if (hamburgerRef.current) {
      hamburgerRef.current.checked = !nav;
    }
  };

  useEffect(() => {
    const changeShadow = () => {
      if (window.scrollY >= 90) {
        setShadow(true);
      } else {
        setShadow(false);
      }
    };

    window.addEventListener("scroll", changeShadow);
  }, []);

  return (
    <div
      className={
        shadow
          ? "navbar fixed md:w-[850px] w-[340px] mt-4 md:mt-12 left-1/2 transform -translate-x-1/2 h-16 z-[100] rounded-full duration-500"
          : "fixed md:w-[850px] w-[340px] mt-4 md:mt-12 left-1/2 transform -translate-x-1/2 h-16 z-[100]"
      }
    >
      <div className="flex justify-between items-center w-full h-full px-2 2xl:px-16">
        <Link href="/#home">
          <Image
            src="/images/logo.png"
            alt="logo"
            width={45}
            height={45}
            quality={100}
            className="rounded-full hover:animate-pulse"
          />
        </Link>
        <div>
          <ul className="hidden items-center md:flex">
            <Link href="/#about">
              <li className="ml-10 text-md text-[#6e7273] hover:text-[#5bb1d5] transition-colors duration-500">
                 About
              </li>
            </Link>
            <Link href="/#features">
              <li className="ml-10 text-md text-[#6e7273] hover:text-[#5bb1d5] transition-colors duration-500">
                 Features
              </li>
            </Link>
            <Link href="/#contact">
              <li className="ml-10 text-md text-[#6e7273] hover:text-[#5bb1d5] transition-colors duration-500">
                 Contact
              </li>
            </Link>
            <Link href='/sign-in'>
              <button class="login ml-10 hover:text-[#5bb1d5] transition-colors duration-500 text-md">Login</button>
            </Link>
            <Link href='/sign-up'>
              <button class="button ml-3"><span class="button-content font-bold">Get Started</span></button>
            </Link>
          </ul>
          <div className="md:hidden flex items-center justify-center">
            <label className="hamburger">
              <input type="checkbox" ref={hamburgerRef} onClick={handleNav} />
              <svg viewBox="0 0 32 32">
                <path
                  class="line line-top-bottom"
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                ></path>
                <path class="line" d="M7 16 27 16"></path>
              </svg>
            </label>
          </div>
        </div>
      </div>

      <div
        className={
          nav
            ? "md:hidden fixed right-0 top-0 h-screen"
            : "hidden"
        }
      >
        <div
          className={
            nav
              ? "mt-20 navbar fixed right-0 top-0 w-[75%] sm:w-[60%] md:w-[45%] h-[500px] rounded-lg bg-[#121317] p-10 transition-transform duration-500 transform translate-x-0"
              : "fixed right-[-100%] top-0 p-10 transition-transform duration-500 transform translate-x-full"
          }
        >
          <div className="items-center text-center py-2 mx-auto mb-6 flex flex-col">
            <ul>
              <Link href="/#about">
                <li className="py-2 text-[17px] text-[#6e7273] hover:text-[#ac4bac] transition-colors duration-500">
                  
                  <br />
                  Features
                </li>
              </Link>

              <Link href="/#projects">
                <li className="py-2 text-[17px] text-[#6e7273] hover:text-[#ac4bac] transition-colors duration-500">
                  
                  <br />
                  About
                </li>
              </Link>
              <Link href="/#contact">
                <li className="py-2 text-[17px] text-[#6e7273] hover:text-[#ac4bac] transition-colors duration-500">
                  <br />
                  Contact
                </li>
              </Link>
              <button class="login mt-4 hover:text-[#ac4bac] transition-colors duration-500 text-md">Login</button>
              <button class="button mt-2"><span class="button-content font-bold">Get Started</span></button>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default navbar;