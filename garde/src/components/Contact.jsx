"use client"
import React, {useRef} from 'react'
import emailjs from '@emailjs/browser';
import {Instagram, Linkedin, Youtube} from "lucide-react";

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
    <>
    <div className="flex justify-end mr-20">
    <div className="mt-40">
      <div className="ml-[-900px]">
        <h1 className="text-white text-8xl font-extrabold mt-[-150px] ml-[70px]"> Contact Us </h1>
        <h4 className="text-white mt-5 ml-[70px] text-xl">If you are a coach and want to use Garde, please fill out the form on the right. <br />
                                                              We will get in touch with you soon.
        </h4>
        <h4 className="text-white mt-5 ml-[70px] text-xl">If you are a fencer and have inquires/comments/concerns about Garde. <br />
                                                              Please don't hesitate to reach out! We will respond back as soon as possible.                                       
        </h4>
      </div>
    </div>
    <div className="bg-gray-700 rounded-xl w-[700px] h-[600px]">
      <form ref={form} onSubmit={sendEmail}>
          <div className="flex justify-center mt-2">
              <input type="text" name="user_name" className="h-[80px] w-[650px] text-xl rounded-xl block p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white mt-2" placeholder="Name" required />
          </div>
          <div className="flex justify-center mt-5">
              <input type="email" name="user_email" className="h-[80px] w-[650px] text-xl rounded-xl block p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Email" required />
          </div>
          <div className="flex justify-center mt-5">
              <textarea name="message" className="h-[300px] w-[650px] bg-gray-50 border border-gray-300 text-lg rounded-xl block p-2.5 dark:bg-gray-800 dark:border-gray-800 dark:placeholder-gray-400 dark:text-white" placeholder="Message" required />
          </div>
          <div className="flex justify-end mt-3 mr-5">
              <input type="submit" className="h-[60px] text-lg p-2.5 bg-gray-900 rounded-xl text-gray-300 hover:bg-gray-800 w-40 font-bold"value="Submit"/>
          </div>
          <div className="bg-slate-500 w-14 h-14 rounded-xl hover:bg-slate-400 mt-[-60px] ml-[400px]">
            <div className="flex justify-center">
              <Linkedin className="w-[25px] h-16"/>
            </div>
          </div>
          <div className="bg-slate-500 w-14 h-14 rounded-xl hover:bg-slate-400 mt-[-55px] ml-[320px]">
            <div className="flex justify-center">
              <Instagram className="w-[30px] h-16"/>
            </div>
          </div>
          <div className="bg-slate-500 w-14 h-14 rounded-xl hover:bg-slate-400 mt-[-55px] ml-[235px]">
            <div className="flex justify-center">
              <Youtube className="w-[30px] h-16"/>
            </div>
          </div>
          <div>
            
          </div>
      </form>
    </div>
    </div>
    </>
  )
}

export default Contact;