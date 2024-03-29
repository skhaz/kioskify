import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const settings = {
  apiKey: 'AIzaSyBFANXhfqs4nGX70Ml93jeZBEG2MU5ZNLw',
  authDomain: 'kioskify.firebaseapp.com',
  databaseURL: 'https://kioskify.firebaseio.com',
  projectId: 'kioskify',
  storageBucket: 'kioskify.appspot.com',
  messagingSenderId: '240347289134',
  appId: '1:240347289134:web:63791f236524e6c6'
};

const initialized = !!firebase.apps.length;

const instance = initialized ? firebase.app() : firebase.initializeApp(settings);

const auth = instance.auth();

const firestore = instance.firestore();

export {
  auth,
  firestore
}
