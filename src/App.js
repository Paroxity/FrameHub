import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import './App.scss';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';
import 'firebase/performance';
import {useAuthState} from 'react-firebase-hooks/auth';
import MasteryChecklist from './MasteryChecklist';
import Login from './components/Login';
import {framehubConfig, paroxityConfig} from './utils/firebase.js';

if (firebase.apps.length === 0) {
    firebase.initializeApp(framehubConfig);
    firebase.initializeApp(paroxityConfig, 'secondary');
    firebase.analytics();
    firebase.performance();
}

function App() {
    const auth = firebase.app("secondary").auth();
    const user = useAuthState(auth);

    return <BrowserRouter>
        <Switch>
            <Route path="/:action/:uid" component={MasteryChecklist}/>
            <Route path="/" exact>
                {user[0] ? <MasteryChecklist/> :
                    <Login auth={auth} user={user}/>}
            </Route>
        </Switch>
    </BrowserRouter>
}

export default App;