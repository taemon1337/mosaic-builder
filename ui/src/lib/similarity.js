// https://github.com/Parthipan-Natkunam/datastructure-practical-applications
import { bmvbhash } from 'blockhash-core';

export const ComputeSimilarity = function (img) {
  console.log('SIM', img);
  let c = img.getCanvas();
  let ctx = c.getContext('2d');
  let imgData = ctx.getImageData(0, 0, img.width, img.height);
  return hash(imgData);
}

export const hash = async function (imgData) {
  try {
    const h = await bmvbhash(imgData, 8);
    return hexToBin(h);
  } catch (e) {
    console.log(e);
  }
}

export const hexToBin = function(hexString) {
  const hexBinLookup = {
    0: "0000",
    1: "0001",
    2: "0010",
    3: "0011",
    4: "0100",
    5: "0101",
    6: "0110",
    7: "0111",
    8: "1000",
    9: "1001",
    a: "1010",
    b: "1011",
    c: "1100",
    d: "1101",
    e: "1110",
    f: "1111",
    A: "1010",
    B: "1011",
    C: "1100",
    D: "1101",
    E: "1110",
    F: "1111",
  };
  let result = "";
  for (let i = 0; i < hexString.length; i++) {
    result += hexBinLookup[hexString[i]];
  }
  return result;
}

export const calculateSimilarity = function(hash1, hash2) {
  // Hamming Distance
  let similarity = 0;
  let hash1Array = hash1.split("");
  hash1Array.forEach((bit, index) => {
    hash2[index] === bit ? similarity++ : null;
  });
  return parseInt((similarity / hash1.length) * 100);
}

export const compareImages = async function(img1, img2) {
  const hash1 = await hash(img1);
  const hash2 = await hash(img2);
  return calculateSimilarity(hash1, hash2);
}
