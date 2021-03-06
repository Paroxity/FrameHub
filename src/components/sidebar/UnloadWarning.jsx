import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";

function UnloadWarning() {
	const { type, changed } = useStore(
		state => ({
			type: state.type,
			changed:
				Object.keys(state.unsavedChanges).length > 0 ||
				Object.keys(state.unsavedItemChanges).length > 0
		}),
		shallow
	);

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
