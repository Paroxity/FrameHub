import { collection, doc, onSnapshot } from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { firestore, auth } from "../App";
import Checklist from "../components/checklist/Checklist";
import PlanetChecklist from "../components/checklist/planets/PlanetChecklist";
import MissingIngredients from "../components/foundry/MissingIngredients";
import FrameHubLogo from "../components/FrameHubLogo";
import LoadingScreen from "../components/LoadingScreen";
import Sidebar from "../components/sidebar/Sidebar";
import UnloadWarning from "../components/sidebar/UnloadWarning";
import Button from "../components/Button";
import { useStore } from "../hooks/useStore";
import { ANONYMOUS, AUTHENTICATED, SHARED } from "../utils/checklist-types";
import { useParams } from "react-router-dom";
import { assignGroup } from "../utils/hash";

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
		setHidePrime,
		setHideFounders,
		displayingNodes,
		setGameSyncInfo,
		popupsDismissed,
		setPopupsDismissed,
		updateFirestore,
		accountLinkErrors,
		setAccountLinkErrors
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
		setHidePrime: state.setHidePrime,
		setHideFounders: state.setHideFounders,
		displayingNodes: state.displayingNodes,
		setGameSyncInfo: state.setGameSyncInfo,
		popupsDismissed: state.popupsDismissed,
		setPopupsDismissed: state.setPopupsDismissed,
		updateFirestore: state.updateFirestore,
		accountLinkErrors: state.accountLinkErrors,
		setAccountLinkErrors: state.setAccountLinkErrors
	}));

	const [dataLoading, setDataLoading] = useState(true);
	const [syncError, setSyncError] = useState(false);
	const [showExperimentalPopup, setShowExperimentalPopup] = useState(false);
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
				setHidePrime(data?.hidePrime ?? false, true);
				setHideFounders(data?.hideFounders ?? true, true);
				setNodesMastered(data?.starChart ?? [], false);
				setNodesMastered(data?.steelPath ?? [], true);
				setJunctionsMastered(data?.starChartJunctions ?? [], false);
				setJunctionsMastered(data?.steelPathJunctions ?? [], true);
				setGameSyncInfo(data?.gameSyncId, data?.gameSyncPlatform);
				setPopupsDismissed(data?.popupsDismissed ?? []);
				setAccountLinkErrors(data?.accountLinkErrors ?? 0);

				setDataLoading(false);
			}
		);
	}, [id, props.type]); //eslint-disable-line

	const { items, fetchData, gameSync } = useStore(state => ({
		items: state.items,
		fetchData: state.fetchData,
		gameSync: state.gameSync
	}));
	const itemsLoading = Object.keys(items).length === 0;
	useEffect(() => {
		fetchData();
	}, [fetchData]);
	useEffect(() => {
		if (props.type !== SHARED && !dataLoading && !itemsLoading) {
			const handleGameSync = async () => {
				try {
					await gameSync();
				} catch (error) {
					setSyncError(true);

					// Increment account link errors for experimental users
					if (id && assignGroup(id, 100) < 10) {
						const newErrorCount = (accountLinkErrors || 0) + 1;
						setAccountLinkErrors(newErrorCount);
						updateFirestore({ accountLinkErrors: newErrorCount });
					}
				}
			};

			handleGameSync();

			const interval = setInterval(handleGameSync, 5 * 60 * 1000);
			return () => clearInterval(interval);
		}
	}, [props.type, dataLoading, itemsLoading, gameSync]);

	useEffect(() => {
		if (props.type !== SHARED && !dataLoading && id) {
			const userGroup = assignGroup(id, 100);
			console.log("Assigned group:", userGroup);

			if (userGroup < 10) {
				if (!popupsDismissed.includes("experimental-account-link")) {
					setShowExperimentalPopup(true);
				}
			}
		}
	}, [props.type, dataLoading, id, popupsDismissed]);

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
			{syncError && (
				<div className="popup show">
					<div className="popup-box">
						Recent stats failed to sync. Your last saved progress is
						still available.
						<Button centered onClick={() => setSyncError(false)}>
							Ok
						</Button>
					</div>
				</div>
			)}
			{showExperimentalPopup && (
				<div className="popup show">
					<div
						className="popup-box link-popup"
						style={{ maxWidth: "400px" }}
					>
						<div className="mastery-rank">
							Warframe Account Linking Now Available
						</div>
						<div
							style={{ lineHeight: "1.5", paddingBottom: "16px" }}
						>
							There's a new "Link Account" button in the sidebar
							that allows you to link your Warframe account. This
							is an experimental feature available to a subset of
							our users. Accounts can be unlinked at any time.
						</div>
						<div
							className="button-row"
							style={{
								display: "flex",
								justifyContent: "flex-end"
							}}
						>
							<div style={{ width: "fit-content" }}>
								<Button
									onClick={() => {
										const updatedPopups = [
											...popupsDismissed,
											"experimental-account-link"
										];
										setPopupsDismissed(updatedPopups);
										updateFirestore({
											popupsDismissed: updatedPopups
										});
										setShowExperimentalPopup(false);
									}}
								>
									Got it
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

MasteryChecklist.propTypes = {
	type: PropTypes.oneOf([AUTHENTICATED, ANONYMOUS, SHARED]).isRequired,
	id: PropTypes.string
};

export default MasteryChecklist;
