import React, { Component } from 'react';

//Require authentication component
var SignUp = require('./Signup');
var Time = require('./Time');
var styles = require('./Helpers/styles');
var TabBar = require('./TabBar.js');
import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  ActivityIndicatorIOS
} from 'react-native';


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoading: false,
      error: false,
      errorMessage: ''
    };
  }
 // test
  // handleEmail(event) {
  //   this.setState({
  //     email: event.nativeEvent.text
  //   });
  // }

  handlePassword(event) {
    this.setState({
      password: event.nativeEvent.text
    });
  }  

  handleUsername(event) {
    this.setState({
      username: event.nativeEvent.text
    });
  }

  handleSignIn() {
    this.setState({
      isLoading: true
    });
    if (this.state.password === '') {
      this.setState({
        isLoading: false,
        error: true,
        errorMessage: 'Invalid Password!'
      });
    }
    //If username and password exists on the database, log the user into the select time page
    if(this.state.username !== '' && this.state.password !== ''){
      fetch('http://localhost:3000/signin', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: this.state.password,
          username: this.state.username,
        })
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if(res.message === 'Incorrect username/password combination!'){
          this.setState({errorMessage: res.message, error: true, isLoading: false});
        } else{
          this.props.navigator.push({
            title: 'Roam',
            username: res._bodyInit,
            component: TabBar
          });
          this.setState({
            isLoading: false
          });
        }
      })
      .catch((error) => {
        console.log('Error handling submit:', error);
      });
    }
  }

  handleSignUp() {
    this.setState({
      isLoading: true
    });
    this.props.navigator.push({
      title: 'Create Account',
      component: SignUp
    });
    this.setState({
      isLoading: false
    });
  }

  render() {
    var showErr = (
      this.state.error ? <Text style={styles.errorMessage}> {this.state.errorMessage} </Text> : <View></View>
    );
    return(
      <Image style={styles.backgroundImage}
      source={require('../../imgs/uni.jpg')}>
        <Text style={styles.title}> roam </Text>
        <TextInput
          style={styles.submit}
          placeholder="Username"
          placeholderTextColor="white"
          value={this.state.username}
          onChange={this.handleUsername.bind(this)}/>
        <TextInput
          style={styles.submit}
          placeholder="Password"
          placeholderTextColor="white"
          value={this.state.password}
          onChange={this.handlePassword.bind(this)}
          secureTextEntry={true}/>

        <TouchableHighlight
          style={styles.button}
          onPress={this.handleSignIn.bind(this)}
          underlayColor="white" >
            <Text style={styles.buttonText}> Sign In </Text>
        </TouchableHighlight>
        <TouchableHighlight
          // style={styles.button}
          onPress={this.handleSignUp.bind(this)}
          underlayColor="transparent" >
            <Text style={styles.signUpButton}> Not a user? Sign Up </Text>
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

module.exports = Login;
