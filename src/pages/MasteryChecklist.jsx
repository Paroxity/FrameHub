import PropTypes from "prop-types";
import { useEffect, useLayoutEffect } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import shallow from "zustand/shallow";
import { firestore } from "../App";
import Checklist from "../components/checklist/Checklist";
import PlanetChecklist from "../components/checklist/planets/PlanetChecklist";
import MissingIngredients from "../components/foundry/MissingIngredients";
import FrameHubLogo from "../components/FrameHubLogo";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/sidebar/Sidebar";
import UnloadWarning from "../components/sidebar/UnloadWarning";
import { useStore } from "../hooks/useStore";
import { ANONYMOUS, AUTHENTICATED, SHARED } from "../utils/checklist-types";

function MasteryChecklist(props) {
	const {
		setId,
		setType,
		reset,
		setItemsMastered,
		setPartiallyMasteredItems,
		setNodesMastered,
		setJunctionsMastered,
		setIntrinsics,
		setHideMastered,
		setHideFounders,
		displayingNodes
	} = useStore(
		state => ({
			setId: state.setId,
			setType: state.setType,
			reset: state.reset,
			setItemsMastered: state.setItemsMastered,
			setPartiallyMasteredItems: state.setPartiallyMasteredItems,
			setNodesMastered: state.setNodesMastered,
			setJunctionsMastered: state.setJunctionsMastered,
			setIntrinsics: state.setIntrinsics,
			setHideMastered: state.setHideMastered,
			setHideFounders: state.setHideFounders,
			displayingNodes: state.displayingNodes
		}),
		shallow
	);

	useEffect(() => {
		setId(props.id);
		setType(props.type);
		reset();
	}, [props.id, props.type]); //eslint-disable-line

	const [data, dataLoading] = useDocumentData(
		firestore
			.collection(
				props.type === ANONYMOUS
					? "anonymousMasteryData"
					: "masteryData"
			)
			.doc(props.id)
	);
	useLayoutEffect(() => {
		setItemsMastered(data?.mastered ?? []);
		setPartiallyMasteredItems(data?.partiallyMastered ?? {});
		setIntrinsics(data?.intrinsics ?? 0, true);
		setHideMastered(data?.hideMastered ?? false, true);
		setHideFounders(data?.hideFounders ?? true, true);
		setNodesMastered(data?.starChart ?? [], false);
		setNodesMastered(data?.steelPath ?? [], true);
		setJunctionsMastered(data?.starChartJunctions ?? [], false);
		setJunctionsMastered(data?.steelPathJunctions ?? [], true);
	}, [data]); //eslint-disable-line
	const { items, fetchItems } = useStore(
		state => ({
			items: state.items,
			fetchItems: state.fetchItems
		}),
		shallow
	);
	const itemsLoading = Object.keys(items).length === 0;
	useEffect(fetchItems, []); //eslint-disable-line

	return dataLoading || itemsLoading ? (
		<LoadingScreen />
	) : (
		<div className="app">
			<UnloadWarning />
			<Sidebar />
			<div className="content">
				<FrameHubLogo />
				{displayingNodes ? (
					<PlanetChecklist />
				) : (
					<>
						<Checklist />
						<MissingIngredients />
					</>
				)}
			</div>
		</div>
	);
}

MasteryChecklist.propTypes = {
	type: PropTypes.oneOf([AUTHENTICATED, ANONYMOUS, SHARED]).isRequired,
	id: PropTypes.string
};

export default MasteryChecklist;
