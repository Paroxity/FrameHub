import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";

function DangerZone() {
	const {
		type,
		displayingNodes,
		displayingSteelPath,
		masterAllItems,
		masterAllNodes,
		masterAllJunctions,
		setIntrinsics
	} = useStore(
		state => ({
			type: state.type,
			displayingNodes: state.displayingNodes,
			displayingSteelPath: state.displayingSteelPath,
			masterAllItems: state.masterAllItems,
			masterAllNodes: state.masterAllNodes,
			masterAllJunctions: state.masterAllJunctions,
			setIntrinsics: state.setIntrinsics
		}),
		shallow
	);

	return type === SHARED ? null : (
		<>
			<span className="danger-text">Danger zone</span>
			<div className="danger">
				<Button
					centered
					onClick={() => {
						if (displayingNodes) {
							masterAllNodes(displayingSteelPath, true);
							masterAllJunctions(displayingSteelPath, true);
						} else {
							masterAllItems(true);
						}
					}}>
					Mark All as Mastered
				</Button>
				<Button
					centered
					onClick={() => {
						setIntrinsics(0);

						if (displayingNodes) {
							masterAllNodes(displayingSteelPath);
							masterAllJunctions(displayingSteelPath);
						} else {
							masterAllItems();
						}
					}}>
					Reset
				</Button>
			</div>
		</>
	);
}

export default DangerZone;
