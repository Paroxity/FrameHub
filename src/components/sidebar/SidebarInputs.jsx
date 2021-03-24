import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import {
	totalIntrinsics,
	totalJunctions,
	totalMissions
} from "../../utils/mastery-rank";
import NumberInput from "../NumberInput";

function SidebarInputs() {
	const {
		type,
		missions,
		setMissions,
		junctions,
		setJunctions,
		intrinsics,
		setIntrinsics
	} = useStore(
		state => ({
			type: state.type,
			missions: state.missions,
			setMissions: state.setMissions,
			junctions: state.junctions,
			setJunctions: state.setJunctions,
			intrinsics: state.intrinsics,
			setIntrinsics: state.setIntrinsics
		}),
		shallow
	);
	return (
		<>
			<NumberInput
				name="Missions"
				disabled={type === SHARED}
				min={0}
				max={totalMissions}
				value={missions.toString()}
				onChange={setMissions}
			/>
			<NumberInput
				name="Junctions"
				disabled={type === SHARED}
				min={0}
				max={totalJunctions}
				value={junctions.toString()}
				onChange={setJunctions}
			/>
			<NumberInput
				name="Intrinsics"
				disabled={type === SHARED}
				min={0}
				max={totalIntrinsics}
				value={intrinsics.toString()}
				onChange={setIntrinsics}
			/>
		</>
	);
}

export default SidebarInputs;
