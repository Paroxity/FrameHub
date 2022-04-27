import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";

function SaveStatus() {
	const { type, changed } = useStore(
		state => ({
			type: state.type,
			changed: state.unsavedChanges.length > 0
		}),
		shallow
	);
	return type !== SHARED ? (
		<div className="autosave-text">
			{changed ? "Your changes are unsaved." : "Changes auto-saved." + (window.navigator.onLine ? "" : " (OFFLINE)")}
		</div>
	) : null;
}

export default SaveStatus;
