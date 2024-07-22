import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { handleImageAndMessage } from "../../pages/steganography";

function Steganography() {
  const [imageFile, setImageFile] = useState(null);
  const [messageFile, setMessageFile] = useState(null);
  const [key, setKey] = useState("");
  const [lsbSize, setLsbSize] = useState(1);
  const [encrypt, setEncrypt] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [stegoImage, setStegoImage] = useState(null);

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleMessageUpload = (e) => {
    setMessageFile(e.target.files[0]);
  };

  const processImage = () => {
    if (!imageFile || !messageFile) {
      alert("Please upload both image and message files.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;

      // Process the image and message
      handleImageAndMessage(imageData, messageFile, key, lsbSize, encrypt)
        .then((stegoDataUrl) => {
          setStegoImage(stegoDataUrl);
        })
        .catch((error) => {
          alert(error.message);
        });
    };
    reader.readAsArrayBuffer(imageFile);
  };

  return (
    <div className="flex flex-col items-center">
      <h1>Steganografi Bitmap</h1>
      <div className="m-3">
        <input type="file" accept=".bmp" onChange={handleImageUpload} />
        <input type="file" onChange={handleMessageUpload} />
        <input
          type="text"
          placeholder="Enter encryption key (if needed)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <select
          value={lsbSize}
          onChange={(e) => setLsbSize(parseInt(e.target.value))}
        >
          <option value="1">1 Bit LSB</option>
          <option value="2">2 Bits LSB</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={encrypt}
            onChange={(e) => setEncrypt(e.target.checked)}
          />{" "}
          Encrypt Message
        </label>
        <button onClick={processImage}>Process</button>
      </div>
      <div className="m-3">
        {originalImage && <img src={originalImage} alt="Original" />}
        {stegoImage && <img src={stegoImage} alt="Stego" />}
      </div>
    </div>
  );
}

export default Steganography;
