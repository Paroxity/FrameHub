import firebase from "firebase";
import { useHistory } from "react-router-dom";
import { auth } from "../../App";
import Button from "../Button";

function AlternativeLogin() {
	const history = useHistory();

	return (
		<div className="alternative-login">
			<Button
				onClick={() =>
					auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
				}>
				Sign in with Google
			</Button>
			<Button
				onClick={async () => {
					history.push(
						`/user/${
							(
								await firebase
									.app("paroxity")
									.firestore()
									.collection("anonymousMasteryData")
									.add({
										hideFounders: true,
										hideMastered: false,
										missions: 0,
										junctions: 0,
										intrinsics: 0,
										mastered: []
									})
							).id
						}`
					);
				}}>
				Sign in anonymously
			</Button>
		</div>
	);
}

export default AlternativeLogin;
