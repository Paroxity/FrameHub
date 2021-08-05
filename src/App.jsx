import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getPerformance } from "firebase/performance";
import { getStorage } from "firebase/storage";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.scss";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/Login";
import MasteryChecklist from "./pages/MasteryChecklist";
import { ANONYMOUS, AUTHENTICATED, SHARED } from "./utils/checklist-types";

const framehubFirebase = initializeApp({
	apiKey: "AIzaSyBMGwuSb8vwSboz8DiPimsCu4KRfXkx-C4",
	authDomain: "framehub-f9cfb.firebaseapp.com",
	projectId: "framehub-f9cfb",
	storageBucket: "framehub-f9cfb.appspot.com",
	messagingSenderId: "333211073610",
	appId: "1:333211073610:web:9f5f3eed9a5e1c11dbbab3",
	measurementId: "G-32XJ3FSZB9"
});
const paroxityFirebase = initializeApp(
	{
		apiKey: "AIzaSyC30ZiFA2z0WXcIQzRxB0Q3FW9hYjSMD1k",
		authDomain: "paroxity-adfa8.firebaseapp.com",
		databaseURL: "https://paroxity-adfa8.firebaseio.com",
		projectId: "paroxity-adfa8",
		storageBucket: "paroxity-adfa8.appspot.com",
		messagingSenderId: "349640827147",
		appId: "1:349640827147:web:7cbb496709585bcd83820e",
		measurementId: "G-6WKVYVC3EB"
	},
	"paroxity"
); //TODO: Combine into one Firebase project
export const auth = getAuth(paroxityFirebase);
export const firestore = getFirestore(paroxityFirebase);
export const storage = getStorage(framehubFirebase);
getAnalytics(framehubFirebase);
getPerformance(framehubFirebase);

function App() {
	const [user, setUser] = useState(auth.currentUser);
	const [authLoading, setAuthLoading] = useState(auth.currentUser === null);
	useEffect(() => {
		return onAuthStateChanged(auth, user => {
			setAuthLoading(false);
			setUser(user);
		});
	}, []);

	return (
		<BrowserRouter>
			<Switch>
				<Route
					path="/share/:id"
					render={params => {
						return (
							<MasteryChecklist
								id={params.match.params.id}
								type={SHARED}
							/>
						);
					}}
				/>
				<Route
					path="/user/:id"
					render={params => {
						return (
							<MasteryChecklist
								id={params.match.params.id}
								type={ANONYMOUS}
							/>
						);
					}}
				/>
				<Route path="/">
					{authLoading ? (
						<LoadingScreen />
					) : user ? (
						<MasteryChecklist id={user.uid} type={AUTHENTICATED} />
					) : (
						<Login />
					)}
				</Route>
			</Switch>
		</BrowserRouter>
	);
}

export default App;
