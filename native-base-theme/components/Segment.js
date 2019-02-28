// @flow

import variable from "./../variables/platform";

export default (variables /*: * */ = variable) => {
  const platform = variables.platform;

  const segmentTheme = {
    height: 45,
    width: 300,
    alignSelf: "center",
    borderColor: variables.segmentBorderColorMain,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: variables.segmentBackgroundColor,
    "NativeBase.Button": {
      alignSelf: "center",
      borderRadius: 0,
      paddingTop: 3,
      paddingBottom: 3,
      paddingLeft: 5,
      paddingRight: 5,
      height: 40,
      // width: '50%',
      backgroundColor: "transparent",
      borderWidth: 0,
      borderLeftWidth: 0,
      borderColor: variables.segmentBorderColor,
      elevation: 0,
      ".active": {
        backgroundColor: variables.segmentActiveBackgroundColor,
        "NativeBase.Text": {
          color: variables.segmentActiveTextColor
        },
        "NativeBase.Icon": {
          color: variables.segmentActiveTextColor
        }
      },
      ".first": {
        borderTopLeftRadius: platform === "ios" ? 5 : undefined,
        borderBottomLeftRadius: platform === "ios" ? 5 : undefined,
        borderLeftWidth: 1
      },
      ".last": {
        borderTopRightRadius: platform === "ios" ? 5 : undefined,
        borderBottomRightRadius: platform === "ios" ? 5 : undefined
      },
      "NativeBase.Text": {
        color: variables.segmentTextColor,
        fontSize: 16
      },
      "NativeBase.Icon": {
        fontSize: 26,
        paddingTop: 0,
        color: variables.segmentTextColor
      }
    }
  };

  return segmentTheme;
};
