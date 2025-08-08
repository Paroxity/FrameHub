import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";
import ConfirmationPrompt from "./ConfirmationPrompt";
import LinkPrompt from "./LinkPrompt";

function DangerZone() {
	const {
		readOnly,
		displayingNodes,
		displayingSteelPath,
		masterAllItems,
		masterAllNodes,
		masterAllJunctions
	} = useStore(state => ({
		readOnly: state.type === SHARED || state.gameSyncId !== undefined,
		displayingNodes: state.displayingNodes,
		displayingSteelPath: state.displayingSteelPath,
		masterAllItems: state.masterAllItems,
		masterAllNodes: state.masterAllNodes,
		masterAllJunctions: state.masterAllJunctions
	}));

	const [confirmationCallback, setConfirmationCallback] = useState();
	const [confirmationMessage, setConfirmationMessage] = useState("");

	return readOnly ? null : (
		<>
			<span className="danger-text">Danger zone</span>
			<div className="danger">
				<LinkPrompt />
				<Button
					centered
					onClick={() => {
						if (displayingNodes) {
							setConfirmationCallback(() => () => {
								masterAllNodes(displayingSteelPath, true);
								masterAllJunctions(displayingSteelPath, true);
							});
							setConfirmationMessage(
								`Are you sure you would like to master all ${
									displayingSteelPath
										? "Steel Path"
										: "Star Chart"
								} nodes?`
							);
						} else {
							setConfirmationCallback(
								() => () => masterAllItems(true)
							);
							setConfirmationMessage(
								"Are you sure you would like to master all items?"
							);
						}
					}}>
					Master All {displayingNodes ? "Nodes" : "Items"}
				</Button>
				<Button
					centered
					onClick={() => {
						if (displayingNodes) {
							setConfirmationCallback(() => () => {
								masterAllNodes(displayingSteelPath);
								masterAllJunctions(displayingSteelPath);
							});
							setConfirmationMessage(
								`Are you sure you would like to reset all ${
									displayingSteelPath
										? "Steel Path"
										: "Star Chart"
								} nodes?`
							);
						} else {
							setConfirmationCallback(() => masterAllItems);
							setConfirmationMessage(
								"Are you sure you would like to reset all items?"
							);
						}
					}}>
					Reset {displayingNodes ? "Nodes" : "Items"}
				</Button>
			</div>
			<ConfirmationPrompt
				message={confirmationMessage}
				callback={confirmationCallback}
				close={setConfirmationCallback}
			/>
		</>
	);
}

export default DangerZone;
