import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import {
	totalDrifterIntrinsics,
	totalRailjackIntrinsics
} from "../../utils/mastery-rank";
import Button from "../Button";
import NumberInput from "../NumberInput";
import { LabeledToggle } from "../Toggle";

function SidebarInputs() {
	const {
		readOnly,
		railjackIntrinsics,
		setRailjackIntrinsics,
		drifterIntrinsics,
		setDrifterIntrinsics,
		hideMastered,
		setHideMastered,
		hidePrime,
		setHidePrime,
		hideFounders,
		setHideFounders,
		displayingNodes,
		setDisplayingNodes,
		displayingSteelPath,
		setDisplayingSteelPath
	} = useStore(state => ({
		readOnly: (state.type === SHARED || state.gameSyncId !== undefined),
		railjackIntrinsics: state.railjackIntrinsics,
		setRailjackIntrinsics: state.setRailjackIntrinsics,
		drifterIntrinsics: state.drifterIntrinsics,
		setDrifterIntrinsics: state.setDrifterIntrinsics,
		hideMastered: state.hideMastered,
		setHideMastered: state.setHideMastered,
		hidePrime: state.hidePrime,
		setHidePrime: state.setHidePrime,
		hideFounders: state.hideFounders,
		setHideFounders: state.setHideFounders,
		displayingNodes: state.displayingNodes,
		setDisplayingNodes: state.setDisplayingNodes,
		displayingSteelPath: state.displayingSteelPath,
		setDisplayingSteelPath: state.setDisplayingSteelPath
	}));
	return (
		<>
			<Button onClick={() => setDisplayingNodes(!displayingNodes)}>
				{displayingNodes ? "Exit Star Chart" : "Star Chart"}
			</Button>
			{displayingNodes && (
				<LabeledToggle
					className="steel-path-toggle"
					label="Steel Path"
					toggled={displayingSteelPath}
					onToggle={setDisplayingSteelPath}
				/>
			)}
			<NumberInput
				name="Railjack Intrinsics"
				disabled={readOnly}
				min={0}
				max={totalRailjackIntrinsics}
				value={railjackIntrinsics.toString()}
				onChange={setRailjackIntrinsics}
				tooltipTitle="Railjack Intrinsics"
				tooltipContent={
					<>
						<p>Max of 10 per intrinsics class</p>
						<p>Maximum Value: {totalRailjackIntrinsics}</p>
					</>
				}
			/>
			<NumberInput
				name="Drifter Intrinsics"
				disabled={readOnly}
				min={0}
				max={totalDrifterIntrinsics}
				value={drifterIntrinsics.toString()}
				onChange={setDrifterIntrinsics}
				tooltipTitle="Drifter Intrinsics"
				tooltipContent={
					<>
						<p>Max of 10 per intrinsics class</p>
						<p>Maximum Value: {totalDrifterIntrinsics}</p>
					</>
				}
			/>
			<LabeledToggle
				label="Hide Mastered"
				toggled={hideMastered}
				onToggle={setHideMastered}
			/>
			{!displayingNodes && (
				<LabeledToggle
					label="Hide Prime"
					toggled={hidePrime}
					onToggle={setHidePrime}
				/>
			)}
			{!displayingNodes && (
				<LabeledToggle
					label="Hide Founders"
					toggled={hideFounders}
					onToggle={setHideFounders}
				/>
			)}
		</>
	);
}

export default SidebarInputs;
