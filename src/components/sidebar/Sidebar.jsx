import classNames from "classnames";
import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import placeholderIcon from "../../icons/placeholder-icon.svg";
import { ANONYMOUS, AUTHENTICATED, SHARED } from "../../utils/checklist-types";
import {
	totalIntrinsics,
	totalJunctions,
	totalMissions
} from "../../utils/mastery-rank";
import Button from "../Button";
import NumberInput from "../NumberInput";
import DangerZone from "./DangerZone";
import ExitButton from "./ExitButton";
import LogoutButton from "./LogoutButton";
import MasteryRankInfo from "./MasteryRankInfo";
import SharePrompt from "./SharePrompt";

function Sidebar() {
	const {
		type,
		unsavedChanges,
		unsavedItemChanges,
		missions,
		setMissions,
		junctions,
		setJunctions,
		intrinsics,
		setIntrinsics
	} = useStore(state => ({
		type: state.type,
		unsavedChanges: state.unsavedChanges,
		unsavedItemChanges: state.unsavedItemChanges,
		missions: state.missions,
		setMissions: state.setMissions,
		junctions: state.junctions,
		setJunctions: state.setJunctions,
		intrinsics: state.intrinsics,
		setIntrinsics: state.setIntrinsics
	}));
	const [toggled, setToggled] = useState(false);
	const [showLink, setShowLink] = useState(false);

	return (
		<>
			<div className={classNames("sidebar", { toggled })}>
				<MasteryRankInfo />
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
				{type !== SHARED && (
					<div className="autosave-text">
						{Object.keys(unsavedChanges).length > 0 ||
						Object.keys(unsavedItemChanges).length > 0
							? "Your changes are unsaved."
							: "Changes auto-saved."}
					</div>
				)}
				{type === ANONYMOUS && <div>Remember to bookmark this URL.</div>}
				<DangerZone />
				<br />
				{type === AUTHENTICATED && (
					<Button centered onClick={() => setShowLink(true)}>
						Share
					</Button>
				)}
				<LogoutButton />
				<ExitButton />
			</div>
			<img
				className="hamburger"
				src={placeholderIcon}
				onClick={() => {
					setToggled(!toggled);
				}}
				alt="menu"
			/>
			<SharePrompt showLink={showLink} setShowLink={setShowLink} />
		</>
	);
}

export default Sidebar;
