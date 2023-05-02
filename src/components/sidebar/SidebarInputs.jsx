import { shallow } from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import { SHARED } from "../../utils/checklist-types";
import { totalRailjackIntrinsics } from "../../utils/mastery-rank";
import Button from "../Button";
import NumberInput from "../NumberInput";
import { LabeledToggle } from "../Toggle";

function SidebarInputs() {
	const {
		type,
		railjackIntrinsics,
		setRailjackIntrinsics,
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
			railjackIntrinsics: state.railjackIntrinsics,
			setRailjackIntrinsics: state.setRailjackIntrinsics,
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
				name="Railjack Intrinsics"
				disabled={type === SHARED}
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
