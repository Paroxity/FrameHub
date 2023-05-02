import { useState } from "react";
import { shallow } from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";
import ConfirmationPrompt from "./ConfirmationPrompt";

function DangerZone() {
	const {
		type,
		displayingNodes,
		displayingSteelPath,
		masterAllItems,
		masterAllNodes,
		masterAllJunctions
	} = useStore(
		state => ({
			type: state.type,
			displayingNodes: state.displayingNodes,
			displayingSteelPath: state.displayingSteelPath,
			masterAllItems: state.masterAllItems,
			masterAllNodes: state.masterAllNodes,
			masterAllJunctions: state.masterAllJunctions
		}),
		shallow
	);

	const [confirmationCallback, setConfirmationCallback] = useState();
	const [confirmationMessage, setConfirmationMessage] = useState("");

	return type === SHARED ? null : (
		<>
			<span className="danger-text">Danger zone</span>
			<div className="danger">
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
					}}
				>
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
					}}
				>
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
