import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import {
	totalIntrinsics,
	totalJunctions,
	totalMissions
} from "../../utils/mastery-rank";
import NumberInput from "../NumberInput";
import { LabeledToggle } from "../Toggle";

function SidebarInputs() {
	const {
		type,
		missions,
		setMissions,
		junctions,
		setJunctions,
		intrinsics,
		setIntrinsics,
		hideMastered,
		setHideMastered,
		hideFounders,
		setHideFounders
	} = useStore(
		state => ({
			type: state.type,
			missions: state.missions,
			setMissions: state.setMissions,
			junctions: state.junctions,
			setJunctions: state.setJunctions,
			intrinsics: state.intrinsics,
			setIntrinsics: state.setIntrinsics,
			hideMastered: state.hideMastered,
			setHideMastered: state.setHideMastered,
			hideFounders: state.hideFounders,
			setHideFounders: state.setHideFounders
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
				tooltipTitle="Missions"
				tooltipContent={
					<>
						<p>Normal Missions: {totalMissions / 2}</p>
						<p>Steel Path Missions: {totalMissions / 2}</p>
						<p>Maximum Value: {totalMissions}</p>
					</>
				}
			/>
			<NumberInput
				name="Junctions"
				disabled={type === SHARED}
				min={0}
				max={totalJunctions}
				value={junctions.toString()}
				onChange={setJunctions}
				tooltipTitle="Junctions"
				tooltipContent={
					<>
						<p>Normal Junctions: {totalJunctions / 2}</p>
						<p>Steel Path Junctions: {totalJunctions / 2}</p>
						<p>Maximum Value: {totalJunctions}</p>
					</>
				}
			/>
			<NumberInput
				name="Intrinsics"
				disabled={type === SHARED}
				min={0}
				max={totalIntrinsics}
				value={intrinsics.toString()}
				onChange={setIntrinsics}
				tooltipTitle="Intrinsics"
				tooltipContent={
					<>
						<p>Max of 10 per intrinsics class, 9 for Command</p>
						<p>Maximum Value: {totalIntrinsics}</p>
					</>
				}
			/>
			<LabeledToggle
				label="Hide Mastered"
				toggled={hideMastered}
				onToggle={setHideMastered}
			/>
			<LabeledToggle
				label="Hide Founders"
				toggled={hideFounders}
				onToggle={setHideFounders}
			/>
		</>
	);
}

export default SidebarInputs;
