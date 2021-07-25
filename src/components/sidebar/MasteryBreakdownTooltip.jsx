import PropTypes from "prop-types";
import { useStore } from "../../hooks/useStore";
import Tooltip from "../Tooltip";

function MasteryBreakdownTooltip({ children }) {
	return (
		<Tooltip
			className="mastery-info"
			title="Mastery Breakdown"
			content={
				<>
					<BreakdownEntry categories={["WF"]} name={"Warframes"} />
					<BreakdownEntry
						categories={["PRIMARY"]}
						name={"Primary Weapons"}
					/>
					<BreakdownEntry
						categories={["SECONDARY"]}
						name={"Secondary Weapons"}
					/>
					<BreakdownEntry
						categories={["MELEE", "ZAW"]}
						name={"Melee Weapons"}
					/>
					<BreakdownEntry categories={["KITGUN"]} name={"Kitguns"} />
					<br />
					<BreakdownEntry
						categories={["STAR_CHART"]}
						name={"Missions"}
					/>
					<BreakdownEntry
						categories={["STEEL_PATH"]}
						name={"The Steel Path Missions"}
					/>
					<BreakdownEntry
						categories={["INTRINSICS"]}
						name={"Railjack Intrinsics"}
					/>
					<br />
					<BreakdownEntry
						categories={["SENTINEL"]}
						name={"Sentinels"}
					/>
					<BreakdownEntry
						categories={["SENTINEL_WEAPON"]}
						name={"Sentinel Weapons"}
					/>
					<BreakdownEntry
						categories={["DOG", "CAT", "MOA", "HOUND", "MISC"]} //TODO: MISC = Plexus, in-game bug displays it under Companions
						name={"Companions"}
					/>
					<span
						style={{
							display: "block",
							fontSize: "0.45em",
							fontWeight: "normal",
							color: "orange"
						}}>
						Companions currently includes Plexus XP to reflect
						in-game.
					</span>
					<br />
					<BreakdownEntry categories={["AW"]} name={"Archwing"} />
					<BreakdownEntry categories={["AW_GUN"]} name={"Archgun"} />
					<BreakdownEntry
						categories={["AW_MELEE"]}
						name={"Archmelee"}
					/>
					<BreakdownEntry categories={["AMP"]} name={"Amps"} />
					<BreakdownEntry categories={["KDRIVE"]} name={"K-Drives"} />
					<BreakdownEntry categories={["MECH"]} name={"Necramech"} />
				</>
			}>
			{children}
		</Tooltip>
	);
}

MasteryBreakdownTooltip.propTypes = {
	children: PropTypes.node
};

export default MasteryBreakdownTooltip;

function BreakdownEntry({ name, categories }) {
	const xp = useStore(state =>
		Object.entries(state.masteryBreakdown)
			.filter(([category]) => categories.includes(category))
			.reduce((xp, [, categoryXP]) => xp + categoryXP, 0)
	);
	return (
		<span className="mastery-breakdown-entry">
			<span className="mastery-breakdown-xp">{xp.toLocaleString()}</span>{" "}
			<span className="mastery-breakdown-name">{name}</span>
		</span>
	);
}

BreakdownEntry.propTypes = {
	name: PropTypes.string.isRequired,
	categories: PropTypes.arrayOf(PropTypes.string).isRequired
};
