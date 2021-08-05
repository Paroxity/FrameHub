import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useHistory } from "react-router-dom";
import { auth, firestore } from "../../App";
import Button from "../Button";

function AlternativeLogin() {
	const history = useHistory();

	return (
		<div className="alternative-login">
			<Button
				onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
				Sign in with Google
			</Button>
			<Button
				onClick={async () => {
					history.push(
						`/user/${
							(
								await addDoc(
									collection(
										firestore,
										"anonymousMasteryData"
									),
									{
										hideFounders: true,
										hideMastered: false,
										mastered: [],
										partiallyMastered: {},
										intrinsics: 0,
										starChart: [],
										steelPath: [],
										starChartJunctions: [],
										steelPathJunctions: []
									}
								)
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
