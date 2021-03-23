import { useStore } from "../../hooks/useStore";
import { masteryRankName, mrToXP } from "../../utils/mastery-rank";

function MasteryRankInfo() {
	const { itemsMastered, totalItems, xp, totalXP, masteryRank } = useStore(
		state => ({
			itemsMastered: state.itemsMastered,
			totalItems: state.totalItems,
			xp: state.xp,
			totalXP: state.totalXP,
			masteryRank: state.masteryRank
		})
	);

	return (
		<>
			<span className="mastery-rank">{`Mastery Rank ${masteryRank}`}</span>{" "}
			<span className="items-mastered">
				{itemsMastered.length.toLocaleString()}/{totalItems.toLocaleString()}{" "}
				Mastered
			</span>
			<span className="xp">
				{xp.toLocaleString()}/{totalXP.toLocaleString()} XP
			</span>
			<progress
				className="mastery-progress-bar"
				value={xp - mrToXP(masteryRank)}
				max={mrToXP(masteryRank + 1) - mrToXP(masteryRank)}
			/>
			<span className="mastery-progress">
				Next Rank:{" "}
				<span className="bold">
					{masteryRankName(masteryRank + 1).toUpperCase()}
				</span>{" "}
				in{" "}
				<span className="bold">
					{Math.ceil(mrToXP(masteryRank + 1) - xp).toLocaleString()}
				</span>
			</span>
		</>
	);
}

export default MasteryRankInfo;
