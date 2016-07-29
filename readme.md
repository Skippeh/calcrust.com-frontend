# Frontend for [calcrust.com](https://www.calcrust.com)

[Backend can be found by clicking here](https://github.com/Skippeh/calcrust.com-backend)

## How to build

The project uses gulp for development and generating dist files. **The gulp file among other files uses es6 features, so make sure your node is up to date.**

Start by navigating to the project folder in a terminal and write ***npm install*** to download all dependencies.

Type ***gulp*** to launch a live reload server on port 8080 (can be changed in gulpfile.js).

Type ***gulp build*** to only generate dist files.

Both commands output files to *./dist*.
