import { shallow } from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import { totalIntrinsics } from "../../utils/mastery-rank";
import Button from "../Button";
import NumberInput from "../NumberInput";
import { LabeledToggle } from "../Toggle";

function SidebarInputs() {
	const {
		type,
		intrinsics,
		setIntrinsics,
		hideMastered,
		setHideMastered,
		hideFounders,
		setHideFounders,
		displayingNodes,
		setDisplayingNodes,
		displayingSteelPath,
		setDisplayingSteelPath
	} = useStore(
		state => ({
			type: state.type,
			intrinsics: state.intrinsics,
			setIntrinsics: state.setIntrinsics,
			hideMastered: state.hideMastered,
			setHideMastered: state.setHideMastered,
			hideFounders: state.hideFounders,
			setHideFounders: state.setHideFounders,
			displayingNodes: state.displayingNodes,
			setDisplayingNodes: state.setDisplayingNodes,
			displayingSteelPath: state.displayingSteelPath,
			setDisplayingSteelPath: state.setDisplayingSteelPath
		}),
		shallow
	);
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
				name="Intrinsics"
				disabled={type === SHARED}
				min={0}
				max={totalIntrinsics}
				value={intrinsics.toString()}
				onChange={setIntrinsics}
				tooltipTitle="Intrinsics"
				tooltipContent={
					<>
						<p>Max of 10 per intrinsics class</p>
						<p>Maximum Value: {totalIntrinsics}</p>
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
					label="Hide Founders"
					toggled={hideFounders}
					onToggle={setHideFounders}
				/>
			)}
		</>
	);
}

export default SidebarInputs;
