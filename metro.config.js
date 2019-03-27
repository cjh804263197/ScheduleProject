// @name Make ReactNative Great Again
// @description Allows you to enable support for JSX files, and `.mjs` files which is the new node standard
// @source http://www.fallingcanbedeadly.com/posts/enabling-react-native-jsx-extension
// @source https://github.com/airbnb/javascript/issues/982
// @note One caveat, The `index.js` file in the root of your project has to be `.js`.
const path = require('path')

module.exports = {
  projectRoot: path.resolve(__dirname),
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
  },
}
