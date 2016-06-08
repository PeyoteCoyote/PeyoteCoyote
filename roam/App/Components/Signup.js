import React, { Component } from 'react';

// var Interests = require('./Interests');
var Time = require('./Time');
var TabBar = require('./TabBar.js');

var styles = require('./Helpers/styles');

import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS
} from 'react-native';

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      userName: '',
      password: '',
      passwordAgain: '',
      phone: '',
      isLoading: false,
      error: false,
      errorMessage: ''
    };
  }

  handleSubmit() {
    console.log(this.state);
    this.setState({
      isLoading: true
    });
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const rePhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
    const rePhone2 = /[1-9][0-9]{2}[1-9][0-9]{6}/; 

    //check if the passwords entered matches
    if (this.state.password !== this.state.passwordAgain) {
      this.setState({isLoading: false, error: true, errorMessage: 'Passwords do not match!'});
    }

    //check if the phone supplied is valid
    if (!rePhone.test(this.state.phone) && !rePhone2.test(this.state.phone) ) {
      this.setState({isLoading: false, error: true, errorMessage: 'Invalid phone number!', phone: ''});
    } else {
      this.setState({
        error: false,
        errorMessage: ''
      });
    }


    //ensure all fields in our state is not empty
    if (this.state.firstName !== '' && this.state.userName !== '' && this.state.password !== '' && this.state.passwordAgain !== '' && (this.state.password === this.state.passwordAgain) && (rePhone.test(this.state.phone) || rePhone2.test(this.state.phone))) {
      fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.state.firstName,
          username: this.state.userName,
          password: this.state.password,
          phone: this.state.phone,
          currentlocation: {latitude: 0, longitude: 0}
        })
      })
      .then((res) => {
        // res = res.json();
        if (res.status === 200) {
          var body = JSON.parse(res._bodyInit);
          console.warn('RESPONSE FROM SERVER ON SIGNUP PAGE', body);
          this.props.navigator.push({
            title: 'Roam',
            component: TabBar,
            user: body
          });
          //Set isloading to false after conditions
          this.setState({
            isLoading: false
          });
        } else {
          this.setState({
            error: true,
            errorMessage: 'Phone already exists!',
            isLoading: false
          });
          console.log('CURRENT ERROR:',this.state.error);
          console.log('SIGNUP ERROR MESSAGE:', this.state.errorMessage);
        }

      })
      .catch((error) => {
        console.log('Error handling submit:', error);
      });
      //Need logic to check if username is taken in the database
      //Check if the passwords are matching
      //Check if the phone is valid
      //Route to the hobbies screen
    }

  }

  render() {
    var showErr = (
      this.state.error ? <Text style={styles.errorMessage}> {this.state.errorMessage} </Text> : <View></View>
    );
    return(
      <Image style={styles.backgroundImage}
        source={require('../../imgs/uni.jpg')} >
        <Text style={styles.title}> sign up </Text>
        {/* Fields that we want to bind the username and password input */}
        <TextInput
          style={styles.submit}
          placeholder="First name"
          placeholderTextColor="white"
          onChangeText={(text) => this.setState({firstName: text})}
          value={this.state.firstName}
          />
        <TextInput
          style={styles.submit}
          placeholder="Username"
          placeholderTextColor="white"
          onChangeText={(text) => this.setState({userName: text})}
          value={this.state.userName}
          />
        <TextInput
          style={styles.submit}
          placeholder="Enter a password"
          placeholderTextColor="white"
          onChangeText={(text) => this.setState({password: text})}
          value={this.state.password}
          secureTextEntry={true}
          />
        <TextInput
          style={styles.submit}
          placeholder="Enter password again"
          placeholderTextColor="white"
          onChangeText={(text) => this.setState({passwordAgain: text})}
          value={this.state.passwordAgain}
          secureTextEntry={true}
          />
        <TextInput
          style={styles.submit}
          autoCapitalize="none"
          placeholder="Phone number"
          placeholderTextColor="white"
          onChangeText={(text) => this.setState({phone: text})}
          value={this.state.phone}
          keyboardType="number-pad"
          />
        <TouchableHighlight
          style={styles.button}
          onPress={this.handleSubmit.bind(this)}
          underlayColor="white" >
            <Text style={styles.buttonText}> Create Account </Text>
        </TouchableHighlight>
        {/* This is the loading animation when isLoading is set to true */}
        <ActivityIndicatorIOS
          animating={this.state.isLoading}
          color="#111"
          size="large"></ActivityIndicatorIOS>
        {showErr}
      </Image>
    )
  }
}

module.exports = SignUp;
