import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";
import ConfirmationPrompt from "./ConfirmationPrompt";
import LinkPrompt from "./LinkPrompt";
import { assignGroup } from "../../utils/hash";

function DangerZone() {
	const {
		id,
		type,
		readOnly,
		displayingNodes,
		displayingSteelPath,
		masterAllItems,
		masterAllNodes,
		masterAllJunctions
	} = useStore(state => ({
		id: state.id,
		type: state.type,
		readOnly: state.type === SHARED || state.gameSyncId !== undefined,
		displayingNodes: state.displayingNodes,
		displayingSteelPath: state.displayingSteelPath,
		masterAllItems: state.masterAllItems,
		masterAllNodes: state.masterAllNodes,
		masterAllJunctions: state.masterAllJunctions
	}));

	const [confirmationCallback, setConfirmationCallback] = useState();
	const [confirmationMessage, setConfirmationMessage] = useState("");

	const showLinkPrompt = type !== SHARED && id && assignGroup(id, 100) < 10;

	return readOnly ? null : (
		<>
			<span className="danger-text">Danger zone</span>
			<div className="danger">
				{showLinkPrompt && <LinkPrompt />}
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
