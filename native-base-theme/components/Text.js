// @flow

import variable from "./../variables/platform";

export default (variables /*: * */ = variable) => {
  const textTheme = {
    fontSize: variables.DefaultFontSize,
    fontFamily: variables.fontFamily,
    color: variables.textColor,
    ".note": {
      fontSize: variables.noteFontSize,
      textAlign: 'left'
    }
  };

  return textTheme;
};
