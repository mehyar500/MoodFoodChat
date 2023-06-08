import React, { useState, useEffect } from "react";
import axios from "axios";

const AdSpace = () => {
  const [offers, setOffers] = useState([]);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
      // Fetch the offers from the backend
      axios.get(`${process.env.REACT_APP_API_URL}/offers`).then(response => {
        setOffers(response.data.offers);
        setCurrentOffer(response.data.offers[0]);
      }).catch(error => {
        console.error(error);
      });

      // Start the offer transition
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = prevIndex + 1 >= offers.length ? 0 : prevIndex + 1;
          setCurrentOffer(offers[newIndex]);
          return newIndex;
        });
      }, 10000); // Change offer every 10 seconds

      return () => {
        clearInterval(interval);
      };
  }, [offers]);

  // Render nothing if there are no offers
  if (!currentOffer) return null;

  // Render the offer
  return (
    <div style={{ transition: "all 0.3s ease-in-out", width: "100%", minHeight: "100px", backgroundColor: "lightgrey", marginTop: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h3>{currentOffer.title}</h3>
      <p>{currentOffer.description}</p>
      <a href={currentOffer.link} target="_blank" rel="noopener noreferrer">Get Offer</a>
    </div>
  );
};

export default AdSpace;