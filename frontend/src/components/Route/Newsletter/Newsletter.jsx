import React from "react";

const Newsletter = () => {
    return(
<div className="bg-green-600 rounded-lg p-8 text-center text-white">
<h2 className="text-3xl font-bold mb-2">Subscribe to Our Newsletter</h2>
<p className="mb-6 max-w-2xl mx-auto">Get the latest updates on new products, special offers, and seasonal tips for your garden</p>
<div className="flex max-w-md mx-auto">
  <input 
    type="email" 
    placeholder="Your email address" 
    className="flex-grow p-3 rounded-l-md text-gray-800 focus:outline-none"
  />
  <button className="bg-gray-800 px-6 py-3 rounded-r-md font-semibold hover:bg-gray-900 transition">
    Subscribe
  </button>
</div>
</div>
)
}

export default Newsletter;