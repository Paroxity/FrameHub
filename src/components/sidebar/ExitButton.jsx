import { useNavigate } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";

function ExitButton() {
	const navigate = useNavigate();
	const type = useStore(state => state.type);
	return type === SHARED ? (
		<Button centered onClick={() => navigate("/")}>
			Exit
		</Button>
	) : null;
}

export default ExitButton;
