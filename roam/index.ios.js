import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  NavigatorIOS,
  View
} from 'react-native';

var Login = require('./App/Components/Login');
var GeolocationView = require('./App/Components/Geolocation.js');
var Time = require('./App/Components/Time.js');
var Splash = require('./App/Components/Splash.js');
var VerifyText = require('./App/Components/VerifyText.js');

class roam extends Component{
  render() {
    return (
      <NavigatorIOS
      style={styles.container}
        initialRoute={{
          title: 'Sign In',
          component: Login
        }}
        navigationBarHidden={true} />
    );
  }
};

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: 'red'
  },
});

AppRegistry.registerComponent('roam', () => roam);
