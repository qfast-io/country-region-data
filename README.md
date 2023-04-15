# country-region-data 

[![Build Status](https://travis-ci.com/country-regions/country-region-data.svg?branch=master)](https://travis-ci.org/country-regions/country-region-data)

This repository provides country and region data in three different formats: es6, UMD (Unified Module Definition), and plain JSON. The data includes country names, country short codes, country regions, and country region short codes.

This repository is a fork of [country-region-data](https://github.com/country-regions/country-region-data). I created this fork to add **Arabic** translations through `nameAr` and `countryNameAr` and extra data types in Typing with Typescript

### Install

This package is available as an npm package. You can install via npm or yarn:

```
npm i @qfast/country-region-data
yarn add @qfast/country-region-data
```

### Structure

See the `data.json` file in the root folder for the raw data. The JSON is of the form:

```javascript
[
  {
    "countryName": "Egypt",
    "countryNameAr": "مصر",
    "countryShortCode": "EG",
    "regions": [
      {
        "name": "Alexandria",
        "nameAr": "الإسكندرية",
        "shortCode": "ALX"
      },
      {
        "name": "Cairo",
        "nameAr": "القاهرة",
        "shortCode": "C"
      },
      ...
    ]
  },
  ... 
]
```

The `data.json` file is the source of truth for the data set, but the generated build artifacts (not seen the repo -
only in the npm package) are:

```
dist/data.js
dist/data-umd.js
```

The first one is an es6 file containing all the data in tree-shakeable format; the second is an UMD file containing the 
entire content. Up until v2 of this repo, UMD was the default. Now the es6 export is the default and the typings reflects
the content of that file, not UMD.

### How to use

The es6 file can be imported like so:

```jsx harmony
import { countries } from 'country-region-data';
```

If you're using typescript you'll get all the typings and see the structure of the exported data in your IDE. If not, 
check your node_modules/country-region-data/dist folder and look at the `data.d.ts` file to get the full list of exported 
information.


Also, you can get countries as map with country key and country meta data plus regions as value in object - they can be imported like so:

```jsx harmony
import { countriesMap } from 'country-region-data';
```


```javascript
[
  "EG", {
      displayEn: "Egypt",
      displayAr: "مصر",
      value:"EG",
      regions:[
        {displayEn:"Alexandria", displayAr:"الإسكندرية", value:"ALX"},
        {displayEn:"Aswan", displayAr:"اسوان", value:"ASN"},
        {displayEn:"Asyout", displayAr:"أسيوط", value:"AST"},
        {displayEn:"Bani Sueif", displayAr:"بني سويف", value:"BNS"},
        {displayEn:"Beheira", displayAr:"البحيرة", value:"BH"},
        {displayEn:"Cairo", displayAr:"القاهرة", value:"C"},
        ....
      ]
    }
]
```


The UMD file can be used like this:

```jsx harmony
import countryRegionData from 'country-region-data/dist/data-umd';
```

The raw JSON is like this:

```jsx harmony
import json from 'country-region-data/data.json';
```

### Typings 


The main types are:

1. Region
2. CountryData

And `countries` constant is an array of `CountryData` and each `CountryData` contains an array of `Region`


### Contribute

Make your changes to the `data.json` file.

Updates and fixes to the data are much appreciated! The state/prov abbreviations in particular are not yet complete, so
the more contributors the better. Regions that need ISO3166-2 codes can be identified by having a missing `shortCode` 
property for each region. You can find them by cloning the repo, then running:

```
yarn install
npx grunt findIncomplete
```

That'll list all countries with regions that are missing region shortcodes. Wikipedia has a lot of the data listed here:
https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 

### Data Validation

Before contributing a PR, please validate the JSON content (if you don't, Travis will catch it for you!). To do that, 
run the following on your command line:

```
yarn install
npx grunt validate
```

That'll throw an error if the JSON is invalid or if some duplicate names were accidentally introduced. The error messages 
are pretty clear, I think.

### License

MIT.
