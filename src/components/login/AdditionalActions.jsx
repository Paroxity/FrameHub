import { sendPasswordResetEmail } from "firebase/auth";
import shallow from "zustand/shallow";
import { auth } from "../../App";
import { useLoginFormStore } from "../../hooks/useLoginFormStore";
import Button from "../Button";

function AdditionalActions() {
	const { email, setError, displayError, signUp, setSignUp } =
		useLoginFormStore(
			state => ({
				email: state.email,
				setError: state.setError,
				displayError: state.displayError,
				signUp: state.signUp,
				setSignUp: state.setSignUp
			}),
			shallow
		);

	return (
		<div className="actions">
			<Button
				onClick={() =>
					sendPasswordResetEmail(auth, email)
						.then(() => setError("Email sent. Check your inbox."))
						.catch(e => setError(e.code))
						.finally(() => displayError(true))
				}
			>
				Forgot Password
			</Button>
			<Button onClick={() => setSignUp(!signUp)}>
				{signUp ? "Login" : "Sign up"}
			</Button>
		</div>
	);
}

export default AdditionalActions;
