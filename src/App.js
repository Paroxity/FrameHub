import "firebase/analytics";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/performance";
import React from "react";
import {useAuthState} from "react-firebase-hooks/auth";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import "./App.scss";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./components/Login";
import MasteryChecklist from "./MasteryChecklist";
import {framehubConfig, paroxityConfig} from "./utils/firebase";

firebase.initializeApp(framehubConfig);
firebase.initializeApp(paroxityConfig, "paroxity");
firebase.analytics();
firebase.performance();

function App() {
	let [user, loading] = useAuthState(auth);
	return <BrowserRouter>
		<Switch>
			<Route path="/share/:uid" render={props => {
				return <MasteryChecklist shared uid={props.match.params.uid}/>;
			}}/>
			<Route path="/user/:uid" render={props => {
				return <MasteryChecklist anonymous uid={props.match.params.uid}/>;
			}}/>
			<Route path="/">
				{user ? <MasteryChecklist uid={user.uid}/> : (loading ? <LoadingScreen/> : <Login/>)}
			</Route>
		</Switch>
	</BrowserRouter>;
}

export default App;
export const auth = firebase.app("paroxity").auth();
export const firestore = firebase.app("paroxity").firestore();