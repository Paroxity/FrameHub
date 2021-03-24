import PropTypes from "prop-types";
import { useEffect } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import shallow from "zustand/shallow";
import { firestore } from "../App";
import Checklist from "../components/checklist/Checklist";
import MissingIngredients from "../components/foundry/MissingIngredients";
import FrameHubLogo from "../components/FrameHubLogo";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/sidebar/Sidebar";
import UnloadWarning from "../components/sidebar/UnloadWarning";
import { useStore } from "../hooks/useStore";
import paroxity from "../icons/paroxity.png";
import { ANONYMOUS, AUTHENTICATED, SHARED } from "../utils/checklist-types";

function MasteryChecklist(props) {
	const {
		setId,
		setType,
		reset,
		setItemsMastered,
		setMissions,
		setJunctions,
		setIntrinsics,
		setHideMastered,
		setHideFounders
	} = useStore(
		state => ({
			setId: state.setId,
			setType: state.setType,
			reset: state.reset,
			setItemsMastered: state.setItemsMastered,
			setMissions: state.setMissions,
			setJunctions: state.setJunctions,
			setIntrinsics: state.setIntrinsics,
			setHideMastered: state.setHideMastered,
			setHideFounders: state.setHideFounders
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
				props.type === ANONYMOUS ? "anonymousMasteryData" : "masteryData"
			)
			.doc(props.id)
	);
	useEffect(() => {
		setItemsMastered(data?.mastered ?? []);
		setMissions(data?.missions ?? 0, true);
		setJunctions(data?.junctions ?? 0, true);
		setIntrinsics(data?.intrinsics ?? 0, true);
		setHideMastered(data?.hideMastered ?? false, true);
		setHideFounders(data?.hideFounders ?? true, true);
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
				<Checklist />
				<MissingIngredients />
			</div>
			<img
				className="paroxity-logo"
				src={paroxity}
				alt="paroxity"
				width="50px"
				onDragStart={e => e.preventDefault()}
				onClick={() => window.open("https://paroxity.net")}
			/>
		</div>
	);
}

MasteryChecklist.propTypes = {
	type: PropTypes.oneOf([AUTHENTICATED, ANONYMOUS, SHARED]).isRequired,
	id: PropTypes.string
};

export default MasteryChecklist;
