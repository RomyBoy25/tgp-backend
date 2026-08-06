const sharp = require("sharp");

const resizeBase64Image = async (
  base64,
  width = 1000,
  quality = 75
) => {
  if (!base64) return null;

  const buffer = Buffer.from(base64, "base64");

  const resized = await sharp(buffer)
    .resize({
      width,
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
    })
    .toBuffer();

  return resized.toString("base64");
};

module.exports = {
  resizeBase64Image,
};