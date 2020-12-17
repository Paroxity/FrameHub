import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {auth} from "./App";
import Button from "./components/Button";
import logo from "./media/framehub.svg";

function Login() {
	const [signup, setSignup] = useState(false);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const [error, setError] = useState("");
	const [errorAvailable, setErrorAvailable] = useState(false);

	const history = useHistory();

	const handleSubmit = event => {
		if (signup) {
			if (password === confirm) {
				auth.createUserWithEmailAndPassword(email, password).then(() => {
					setSignup(false);
				}).catch(e => {
					setError(e.code);
					setErrorAvailable(true);
				});
			} else {
				setError("Passwords do not match.");
				setErrorAvailable(true);
			}
		} else {
			auth.signInWithEmailAndPassword(email, password).catch(e => {
				setError(e.code);
				setErrorAvailable(true);
			});
		}
		event.preventDefault();
	};

	const errorMessages = {
		"auth/invalid-email": "Login failed. Invalid email address format.",
		"auth/wrong-password": "Login failed. Check your info.",
		"auth/user-not-found": "No user matching that email address.",
		"auth/too-many-requests": "You\"ve been sending too many requests! Try again in a few seconds.",
		"auth/email-already-in-use": "There is already a registered user with this email.",
		"auth/weak-password": "This password is too weak. Make sure it is at least 6 characters in length."
	};

	return <>
		<div className="login">
			<img className="framehub-logo" src={logo} alt="" onDragStart={e => e.preventDefault()}/>
			<br/>
			<form onSubmit={handleSubmit}>
				<div className="form-bg center">
					<div className="input"><input type="text" placeholder="EMAIL"
						onChange={e => setEmail(e.target.value)}/></div>
				</div>
				<div className="form-bg center">
					<div className="input"><input type="password" autoComplete="on" placeholder="PASSWORD"
						onChange={e => setPassword(e.target.value)}/></div>
				</div>
				{
					signup &&
					<div className="form-bg center">
						<div className="input"><input type="password" autoComplete="on" placeholder="CONFIRM PASSWORD"
							onChange={e => setConfirm(e.target.value)}/></div>
					</div>
				}
				<Button centered submit>{signup ? "Sign up" : "Login"}</Button>
			</form>
			<div className="actions">
				<Button onClick={() => {
					auth.sendPasswordResetEmail(email).then(() => {
						setError("Email sent. Check your inbox.");
						setErrorAvailable(true);
					}).catch(e => {
						setError(e.code);
						setErrorAvailable(true);
					});
				}}>Forgot Password</Button>
				<Button onClick={() => {
					setSignup(!signup);
				}}>{signup ? "Login" : "Sign up"}</Button>
			</div>
			<div className="alternative-login">
				<Button onClick={() => {
					auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
				}}>Sign in with Google</Button>
				<Button onClick={async () => {
					let doc = await firebase.app("paroxity").firestore().collection("anonymousMasteryData").add({
						hideFounders: true,
						hideMastered: false,
						intrinsics: 0,
						junctions: 0,
						mastered: [],
						missions: 0
					});
					history.push(`/user/${doc.id}`);
				}}>Sign in anonymously</Button>
			</div>
		</div>

		<div className={errorAvailable ? "popup show" : "popup"}>
			<div className="popup-box">
				{errorMessages[error] || error}
				<Button centered onClick={() => {
					setErrorAvailable(false);
				}}>Ok</Button>
			</div>
		</div>
		<div className="disclaimer">FrameHub is not affiliated with Digital Extremes or Warframe.</div>
	</>;
}

export default Login;