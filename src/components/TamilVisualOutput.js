import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GIPHY_API_KEY = 'HIFQaOHHjdFqmUXpQUm5tnvet9IVYDQh';

const TamilVisualOutput = ({ text }) => {
  const [gifs, setGifs] = useState([]);

  const fetchGIFs = async (text) => {
    try {
      const words = text.split(' ').slice(0, 5);
      const gifPromises = words.map((word) =>
        axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${word}&limit=1`)
      );
      const gifResults = await Promise.all(gifPromises);
      setGifs(gifResults.map((res) => res.data.data[0]?.images.fixed_height.url || ''));
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  useEffect(() => {
    if (text) fetchGIFs(text);
  }, [text]);

  return (
    <div>
      <h2>GIFs</h2>
      <div>
        {gifs.map((gif, index) => (
          gif ? <img key={index} src={gif} alt="GIF" /> : <p>No GIF found</p>
        ))}
      </div>
    </div>
  );
};

export default TamilVisualOutput;
