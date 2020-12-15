import PropTypes from "prop-types";
import React, {useRef, useState} from "react";
import {useHistory} from "react-router-dom";
import {auth} from "../App";
import placeholderIcon from "../media/placeholderIcon.svg";
import {complexToSimpleList, foundersItems} from "../utils/item";
import {
	baseXPByType,
	intrinsicsToXP,
	junctionsToXP,
	missionsToXP,
	totalIntrinsics,
	totalJunctions,
	totalMissions,
	totalMissionXP,
	xpToMR
} from "../utils/xp";
import Button from "./Button";
import NumberInput from "./NumberInput";
import {LabeledToggle} from "./Toggle";


function Sidebar(props) {
	const history = useHistory();
	const [showSidebar, setShowSidebar] = useState(false);
	const [showShare, setShowShare] = useState(false);
	const shareLinkRef = useRef(null);

	let xp = missionsToXP(props.missions) + junctionsToXP(props.junctions) + intrinsicsToXP(props.intrinsics);
	let items = 0;
	let totalXP = totalMissionXP + junctionsToXP(totalJunctions) + intrinsicsToXP(totalIntrinsics);
	let totalItems = 0;

	complexToSimpleList(props.items).forEach(item => {
		if (item.mastered) {
			xp += baseXPByType(item.type) * (item.maxLvl || 30);
			items++;
		}
		if (props.hideFounders && foundersItems.includes(item.name) && !item.mastered) return;
		totalXP += baseXPByType(item.type) * (item.maxLvl || 30);
		totalItems++;
	});

	return <>
		<div className={"sidebar" + (showSidebar ? " toggled" : "") + (props.shared ? " read-only" : "")}>
			<span className="mastery-rank">{"Mastery Rank " + xpToMR(xp)}</span>
			<br/>
			<span className="items-mastered">{items.toLocaleString()}/{totalItems.toLocaleString()} Mastered</span>
			<br/>
			<span className="xp">{xp.toLocaleString()}/{totalXP.toLocaleString()} XP</span>
			<NumberInput name="Missions" disabled={props.shared} min={0} max={totalMissions}
				value={props.missions.toString()}
				onChange={missions => {
					props.setMissions(missions);
					props.setChanged(true);
				}} tooltip={<><p>Normal missions: {totalMissions / 2}</p><p>Steel Path
				missions: {totalMissions / 2}</p></>}/>
			<NumberInput name="Junctions" disabled={props.shared} min={0} max={totalJunctions}
				value={props.junctions.toString()}
				onChange={junctions => {
					props.setJunctions(junctions);
					props.setChanged(true);
				}} tooltip={<><p>Normal junctions: {totalJunctions / 2}</p><p>Steel Path
				junctions: {totalJunctions / 2}</p></>}/>
			<NumberInput name="Intrinsics" disabled={props.shared} min={0} max={totalIntrinsics}
				value={props.intrinsics.toString()}
				onChange={intrinsics => {
					props.setIntrinsics(intrinsics);
					props.setChanged(true);
				}} tooltip={<p>Max of 10 per intrinsics class</p>}/>
			<LabeledToggle name="hideMastered" disabled={props.shared} label="Hide Mastered"
				selected={props.hideMastered}
				onToggle={() => {
					props.setHideMastered(!props.hideMastered);
					props.setChanged(true);
				}}/>
			<LabeledToggle name="hideFounders" disabled={props.shared} label="Hide Founders"
				selected={props.hideFounders}
				onToggle={() => {
					props.setHideFounders(!props.hideFounders);
					props.setChanged(true);
				}}/>
			{!props.shared &&
			<div className="autosave-text">{props.changed ? "Your changes are unsaved." : "Changes autosaved."}</div>}
			{props.anonymous &&
			<div>Remember to bookmark this URL.</div>
			}
			{!props.shared &&
			<>
				<span className="danger-text">Danger zone</span>
				<div className="danger">
					<Button centered onClick={props.markAllAsMastered}>Mark All as Mastered</Button>
					<Button centered onClick={props.reset}>Reset</Button>
				</div>
			</>
			}
			<br/>
			{
				!props.anonymous && !props.shared &&
				<Button centered onClick={() => {
					setShowShare(true);
				}}>Share</Button>
			}
			{!props.anonymous && !props.shared && <Button centered onClick={() => {
				props.save();
				auth.signOut();
			}}>Logout</Button>}
			{props.shared && <Button centered onClick={() => {
				history.push("/");
			}
			}>Exit</Button>}
		</div>
		<img className="hamburger" src={placeholderIcon} onClick={() => {
			setShowSidebar(!showSidebar);
		}} alt="menu"/>
		{showShare && <div className="popup show">
			<div className="popup-box">
				Here's your sharable link:
				<div className="input"><input type="text"
					readOnly value={"https://framehub.paroxity.net/share/" + props.uid}
					ref={shareLinkRef}/></div>
				{
					document.queryCommandSupported("copy") &&
					<Button centered onClick={() => {
						shareLinkRef.current.select();
						document.execCommand("copy");
						setShowShare(false);
					}}>Copy</Button>
				}
				<Button centered onClick={() => setShowShare(false)}>Close</Button>
			</div>
		</div>}
	</>;
}

Sidebar.propTypes = {
	uid: PropTypes.string.isRequired,
	shared: PropTypes.bool,
	anonymous: PropTypes.bool,
	items: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
		"maxLvl": PropTypes.number,
		"mr": PropTypes.number,
		"wiki": PropTypes.string,
		"vaulted": PropTypes.bool,
		"components": PropTypes.objectOf(PropTypes.oneOfType(PropTypes.number, PropTypes.shape({
			"img": PropTypes.string,
			"count": PropTypes.number
		}))),
		"buildTime": PropTypes.number,
		"buildPrice": PropTypes.number,
	}))).isRequired,
	mastered: PropTypes.number.isRequired,
	setMastered: PropTypes.func.isRequired,
	missions: PropTypes.number.isRequired,
	setMissions: PropTypes.func.isRequired,
	junctions: PropTypes.number.isRequired,
	setJunctions: PropTypes.func.isRequired,
	intrinsics: PropTypes.number.isRequired,
	setIntrinsics: PropTypes.func.isRequired,
	hideMastered: PropTypes.bool.isRequired,
	setHideMastered: PropTypes.func.isRequired,
	hideFounders: PropTypes.bool.isRequired,
	setHideFounders: PropTypes.func.isRequired,
	changed: PropTypes.bool.isRequired,
	setChanged: PropTypes.func.isRequired,
	markAllAsMastered: PropTypes.func.isRequired,
	reset: PropTypes.func.isRequired,
	save: PropTypes.func.isRequired
};

export default Sidebar;