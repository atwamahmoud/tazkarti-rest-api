# tazkarti-rest-api

Rest API for Tazkarti App.

### Made using
1. MongoDB & Mongoose ORM
2. Express
3. Typescript

### To Run development
``` npm i && npm run dev ```

or

``` yarn && yarn dev ```
### To build for production
``` npm i && npm run build ```

or

``` yarn && yarn build ```


This will produce a folder `dist` containing the buit .JS files.

### Notes
1. Tests are not implements
2. To generate admins:
    1. Configure `.env` file with the correct parameters.
    2. Edit `/admins.json` as you see fit
    3. run `node generateAdmins.js`
2. Needs MongoDB to run correctly
3. See `.env` file