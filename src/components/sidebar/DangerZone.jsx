import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import Button from "../Button";

function DangerZone() {
	const {
		type,
		masterAllItems,
		unmasterAllItems,
		setMissions,
		setJunctions,
		setIntrinsics
	} = useStore(state => ({
		type: state.type,
		masterAllItems: state.masterAllItems,
		unmasterAllItems: state.unmasterAllItems,
		setMissions: state.setMissions,
		setJunctions: state.setJunctions,
		setIntrinsics: state.setIntrinsics
	}));

	return type === SHARED ? null : (
		<>
			<span className="danger-text">Danger zone</span>
			<div className="danger">
				<Button centered onClick={masterAllItems}>
					Mark All as Mastered
				</Button>
				<Button
					centered
					onClick={() => {
						setMissions(0);
						setJunctions(0);
						setIntrinsics(0);
						unmasterAllItems();
					}}>
					Reset
				</Button>
			</div>
		</>
	);
}

export default DangerZone;
