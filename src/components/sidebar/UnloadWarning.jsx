import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";

function UnloadWarning() {
	const { type, changed } = useStore(state => ({
		type: state.type,
		changed: state.unsavedChanges.length > 0
	}));

	window.onbeforeunload =
		type !== SHARED && changed
			? e => {
					e.preventDefault();
					e.returnValue = "";
				}
			: undefined;

	return null;
}

export default UnloadWarning;
