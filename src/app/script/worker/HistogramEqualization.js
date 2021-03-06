// disable new-cap linting for color space name usage in function name
/* eslint-disable new-cap */

import {RGBToHSL, HSLToRGB,
        RGBToHSV, HSVToRGB,
        RGBToHSY709, HSY709ToRGB,
        RGBToHSY601, HSY601ToRGB}       from './ColorConversion';
import {getAllPositions} from './util';

// space is one of: hsl, hsv, hsy709, hsy610
// channel is index (0 based) of selected color space: 0, 1, 2
// algorithm from wiki.
// https://en.wikipedia.org/wiki/Histogram_equalization
function HistogramEqualization({width, height, data}, {space, channelIndex}) {
  const allPos = getAllPositions(width, height);
  const pixelCount = width * height;

  // data in specified color space
  // use 3 channels + 1 alpha channel for each pixel
  const sData = new Uint8ClampedArray(4 * width * height);

  // function convert RGB <-> Specified 3-channel Color Space
  let RGBToSpec;
  let SpecToRGB;

  // target channel's levels count
  const xCount = new Array(256).fill(0);

  // discrete Cumulative Distribution Function values
  // https://en.wikipedia.org/wiki/Cumulative_distribution_function
  const xCDF = new Array(256).fill(0);
  let xCDFMin; // min value of xCDF

  // map original level(index) to equalized level(value)
  let xEqualized;

  switch (space) {
  case 'hsl':
    RGBToSpec = RGBToHSL;
    SpecToRGB = HSLToRGB;
    break;
  case 'hsv':
    RGBToSpec = RGBToHSV;
    SpecToRGB = HSVToRGB;
    break;
  case 'hsy709':
    RGBToSpec = RGBToHSY709;
    SpecToRGB = HSY709ToRGB;
    break;
  case 'hsy601':
    RGBToSpec = RGBToHSY601;
    SpecToRGB = HSY601ToRGB;
    break;
  default:
    break;
  }

  // convert RGB data to Specified color space
  for (const [,, index] of allPos()) {
    const sPixel = RGBToSpec(data[index] / 255,
                           data[index + 1] / 255,
                           data[index + 2] / 255);
    sData[index]     = Math.round(sPixel[0] * 255);
    sData[index + 1] = Math.round(sPixel[1] * 255);
    sData[index + 2] = Math.round(sPixel[2] * 255);

    // copy alpha channel as it is.
    sData[index + 3] = data[index + 3];
  }

  // analyze frequency of selected channel leves.
  for (const [,, index] of allPos()) {
    ++xCount[sData[index + channelIndex]];
  }

  // convert conuts to CDF
  xCount.reduce((pre, cur, idx) => {
    const result = pre + cur;
    xCDF[idx] = result;
    return result;
  }, 0);

  // compute equalized levels
  xCDFMin = xCDF.find(val => val > 0);
  xEqualized = xCDF.map((val) => {
    return Math.round((val - xCDFMin) / (pixelCount - xCDFMin) * 255);
  });

  for (const [,, index] of allPos()) {
    // map original channel values to the equalized
    const orginalValue = sData[index + channelIndex];
    sData[index + channelIndex] = xEqualized[orginalValue];

    // convert equalized data back to RGB
    const xPixel = SpecToRGB(sData[index] * ( 1 / 255),
                             sData[index + 1] * ( 1 / 255),
                             sData[index + 2] * ( 1 / 255));
    data[index] = Math.round(xPixel[0] * 255);
    data[index + 1] = Math.round(xPixel[1] * 255);
    data[index + 2] = Math.round(xPixel[2] * 255);
  }

  return {width, height, data};
}

export default HistogramEqualization;
