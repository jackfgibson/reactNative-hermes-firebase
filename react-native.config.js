module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          project: 'ios/AIGraphQLApp.xcodeproj',
        },
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/Fonts',
          fontsPath: '../node_modules/react-native-vector-icons/Fonts',
        },
      },
    },
  },
};