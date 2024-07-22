import CryptoJS from 'crypto-js';

function calculatePayload(imageData, lsbSize) {
  const bmpHeaderSize = 54;
  const payloadCapacity = (imageData.byteLength - bmpHeaderSize) * lsbSize / 8;
  return payloadCapacity;
}

function encryptMessage(message, key) {
  return CryptoJS.AES.encrypt(message, key).toString();
}

function decryptMessage(ciphertext, key) {
  return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}

function readMessageFile(messageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsArrayBuffer(messageFile);
  });
}

function embedMessageInImage(imageData, message, lsbSize) {
  const bmpHeaderSize = 54;
  const view = new Uint8Array(imageData);
  let messageIndex = 0;

  for (let i = bmpHeaderSize; i < view.length && messageIndex < message.length; i++) {
    for (let bit = 0; bit < lsbSize; bit++) {
      const mask = 1 << bit;
      const messageBit = (message[messageIndex] >> bit) & 1;
      view[i] = (view[i] & ~mask) | (messageBit << bit);
    }
    messageIndex++;
  }

  return new Blob([view], { type: 'image/bmp' });
}

export async function handleImageAndMessage(imageData, messageFile, key, lsbSize, encrypt) {
  const payloadCapacity = calculatePayload(imageData, lsbSize);

  const messageArrayBuffer = await readMessageFile(messageFile);
  let message = new Uint8Array(messageArrayBuffer);

  if (encrypt && key) {
    const messageString = String.fromCharCode.apply(null, message);
    const encryptedMessage = encryptMessage(messageString, key);
    message = new Uint8Array(new TextEncoder().encode(encryptedMessage));
  }

  if (message.length > payloadCapacity) {
    throw new Error('Message file is too large to be embedded in the image.');
  }

  const stegoBlob = embedMessageInImage(imageData, message, lsbSize);
  return URL.createObjectURL(stegoBlob);
}
