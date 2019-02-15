const generateBarcode = (data: string) => {
  const JsBarcode = require('jsbarcode');
  const Canvas = require('canvas');

  const canvas = new Canvas();
  JsBarcode(canvas, data, {
    margin: 0,
    displayValue: false,
    width: 3,
    height: 135,
  });

  return canvas.toDataURL('image/png');
};

const generateQRCodeAsync = async (data: string): Promise<string> => {
  const qrcode = require('qrcode');
  try {
    const url = await qrcode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      width: 200,
      height: 200,
      margin: 2,
    });
    return url;
  } catch (err) {
    throw err;
  }
};

export { generateBarcode, generateQRCodeAsync };
