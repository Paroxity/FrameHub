import { useHistory } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";

function ExitButton() {
	const history = useHistory();
	const type = useStore(state => state.type);
	return type === SHARED ? (
		<Button centered onClick={() => history.push("/")}>
			Exit
		</Button>
	) : null;
}

export default ExitButton;
