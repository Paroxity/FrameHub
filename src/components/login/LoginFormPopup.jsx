import classNames from "classnames";
import { useLoginFormStore } from "../../hooks/useLoginFormStore";
import Button from "../Button";

const errorMessages = {
	"auth/invalid-email": "Login failed. Invalid email address format.",
	"auth/wrong-password": "Login failed. Check your info.",
	"auth/user-not-found": "No user matching that email address.",
	"auth/too-many-requests":
		"You've been sending too many requests! Try again in a few seconds.",
	"auth/email-already-in-use":
		"There is already a registered user with this email.",
	"auth/weak-password":
		"This password is too weak. Make sure it is at least 6 characters in length."
};

function LoginFormPopup() {
	const { displayError, error, errorDisplayed } = useLoginFormStore(state => ({
		displayError: state.displayError,
		error: state.error,
		errorDisplayed: state.errorDisplayed
	}));
	return (
		<div className={classNames("popup", { show: errorDisplayed })}>
			<div className="popup-box">
				{errorMessages[error] || error}
				<Button centered onClick={() => displayError(false)}>
					Ok
				</Button>
			</div>
		</div>
	);
}

export default LoginFormPopup;
