import { auth } from "../../App";
import { useStore } from "../../hooks/useStore";
import { AUTHENTICATED } from "../../utils/checklist-types";
import Button from "../Button";

function LogoutButton() {
	const { type, saveImmediately } = useStore(state => ({
		type: state.type,
		saveImmediately: state.saveImmediate
	}));
	return type === AUTHENTICATED ? (
		<Button
			centered
			onClick={() => {
				saveImmediately();
				auth.signOut();
			}}>
			Logout
		</Button>
	) : null;
}

export default LogoutButton;
