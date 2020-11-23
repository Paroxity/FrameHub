import React from 'react';
import './App.scss';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import MasteryChecklist from './MasteryChecklist';
import Login from './components/Login';
import { framehubConfig, paroxityConfig } from './utils/firebase.js';

if (firebase.apps.length === 0) {
  firebase.initializeApp(framehubConfig, 'primary');
  firebase.initializeApp(paroxityConfig, 'secondary');
}

function App() {
  const auth = firebase.app('secondary').auth();
  const firestore = firebase.app('secondary').firestore();
  const user = useAuthState(auth);
  return user[0] ? <MasteryChecklist user={user} auth={auth} firestore={firestore}/> : <Login auth={auth} user={user} />;
}

export default App;