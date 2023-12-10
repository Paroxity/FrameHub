import { collection, doc, onSnapshot } from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";

function MasteryChecklist(props) {
	let { id } = useParams();
	id = props.id ?? id;

	const {
		setId,
		setType,
		reset,
		setItemsMastered,
		setPartiallyMasteredItems,
		setNodesMastered,
		setJunctionsMastered,
		setRailjackIntrinsics,
		setDrifterIntrinsics,
		setHideMastered,
		setHideFounders,
		displayingNodes
	} = useStore(state => ({
		setId: state.setId,
		setType: state.setType,
		reset: state.reset,
		setItemsMastered: state.setItemsMastered,
		setPartiallyMasteredItems: state.setPartiallyMasteredItems,
		setNodesMastered: state.setNodesMastered,
		setJunctionsMastered: state.setJunctionsMastered,
		setRailjackIntrinsics: state.setRailjackIntrinsics,
		setDrifterIntrinsics: state.setDrifterIntrinsics,
		setHideMastered: state.setHideMastered,
		setHideFounders: state.setHideFounders,
		displayingNodes: state.displayingNodes
	}));

	const [dataLoading, setDataLoading] = useState(true);
	useEffect(() => {
		setId(id);
		setType(props.type);
		setDataLoading(true);
		reset();

		return onSnapshot(
			doc(
				collection(
					firestore,
					props.type === ANONYMOUS
						? "anonymousMasteryData"
						: "masteryData"
				),
				id
			),
			snapshot => {
				const data = snapshot.data();

				setItemsMastered(data?.mastered ?? []);
				setPartiallyMasteredItems(data?.partiallyMastered ?? {});
				setRailjackIntrinsics(data?.intrinsics ?? 0, true);
				setDrifterIntrinsics(data?.drifterIntrinsics ?? 0, true);
				setHideMastered(data?.hideMastered ?? false, true);
				setHideFounders(data?.hideFounders ?? true, true);
				setNodesMastered(data?.starChart ?? [], false);
				setNodesMastered(data?.steelPath ?? [], true);
				setJunctionsMastered(data?.starChartJunctions ?? [], false);
				setJunctionsMastered(data?.steelPathJunctions ?? [], true);

				setDataLoading(false);
			}
		);
	}, [id, props.type]); //eslint-disable-line

	const { items, fetchItems } = useStore(state => ({
		items: state.items,
		fetchItems: state.fetchItems
	}));
	const itemsLoading = Object.keys(items).length === 0;
	useEffect(() => {
		fetchItems();
	}, []); //eslint-disable-line

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
