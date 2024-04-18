"use client"
import React, {useRef} from 'react'
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_6hhjowg', 'template_xopgjqe', form.current, {
        publicKey: 'XaISIO8Cw7CG8l8aj',
      })
      .then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );
    };

  return (
    <div>
      <div id="contact" className="flex justify-center font-bold mt-40 text-4xl">
          Contact Us
      </div>
      <div className="flex justify-center mt-3">
          Please write down any comments, concerns and questions below. We are happy to assist you!
      </div>

      <form ref={form} onSubmit={sendEmail}>
          <div className="flex justify-center mt-5">
              <input type="text" name="user_name" className="bg-gray-50 border border-gray-300 text-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:w-[350px] md:w-[650px]" placeholder="Name" required />
          </div>
          <div className="flex justify-center mt-5">
              <input type="email" name="user_email" className="bg-gray-50 border border-gray-300 text-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:w-[350px] md:w-[650px]" placeholder="Email" required />
          </div>
          <div className="flex justify-center mt-5">
              <textarea name="message" className="bg-gray-50 border border-gray-300 text-gray-300 text-gray-900 text-sm rounded-3xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-900 dark:border-gray-800 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:w-[350px] md:w-[650px] h-44 text-left" placeholder="Please enter your questions/comments/concerns here" required />
          </div>
          <div className="flex justify-center mt-3">
              <input type="submit" className="p-2.5 bg-gray-900 rounded-full text-gray-300 hover:bg-gray-700 w-20"value="Send"/>
          </div>
      </form>
    </div>
  )
}

export default Contact;