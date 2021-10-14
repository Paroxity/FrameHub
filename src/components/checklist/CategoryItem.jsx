import classNames from "classnames";
import PropTypes from "prop-types";
import { useState } from "react";
import shallow from "zustand/shallow";
import { useStore } from "../../hooks/useStore";
import checkmark from "../../icons/checkmark.svg";
import { SHARED } from "../../utils/checklist-types";
import { foundersItems, itemShape } from "../../utils/items";
import Button from "../Button";
import PaginatedTooltip from "../PaginatedTooltip";
import ItemGeneralInfoTooltip from "./ItemGeneralInfoTooltip";
import ItemRelicTooltip from "./ItemRelicTooltip";

function CategoryItem({ name, item }) {
	const {
		type,
		masterItem,
		mastered,
		masteryRankLocked,
		partialRank,
		setPartiallyMasteredItem,
		hidden
	} = useStore(
		state => ({
			type: state.type,
			masterItem: state.masterItem,
			mastered: state.itemsMastered.includes(name),
			masteryRankLocked: (item.mr || 0) > state.masteryRank,
			partialRank: state.partiallyMasteredItems[name],
			setPartiallyMasteredItem: state.setPartiallyMasteredItem,
			hidden:
				(state.hideMastered && state.itemsMastered.includes(name)) ||
				(state.hideFounders &&
					foundersItems.includes(name) &&
					!state.itemsMastered.includes(name))
		}),
		shallow
	);
	const [rankSelectToggled, setRankSelectToggled] = useState(false);

	return hidden ? null : (
		<>
			{rankSelectToggled && item.maxLvl && (
				<div className="rank-options">
					{Array.from(Array((item.maxLvl - 30) / 2 + 2)).map(
						(i, j) => {
							const rank = j === 0 ? 0 : j * 2 + 28;
							return (
								<div
									key={rank}
									className="rank-option"
									onClick={() =>
										setPartiallyMasteredItem(
											name,
											rank,
											item.maxLvl
										)
									}>
									{rank}
								</div>
							);
						}
					)}
				</div>
			)}
			<PaginatedTooltip
				content={
					<>
						<ItemGeneralInfoTooltip item={item} />
						{item.relics && (
							<ItemRelicTooltip item={item} name={name} />
						)}
					</>
				}>
				<div
					className={classNames("item", {
						"item-mastered": mastered,
						"item-locked": masteryRankLocked
					})}>
					<Button
						className="item-name"
						onClick={e => {
							// The meta key (MacOS command/⌘ key) is used as an alternative to the Ctrl key as
							// default macOS settings convert Ctrl + Left Click to a Right Click.
							if (e.ctrlKey || e.metaKey) {
								window.open(
									item.wiki ||
										`https://warframe.fandom.com/wiki/${name}`
								);
							} else {
								if (type !== SHARED) {
									if (item.maxLvl)
										setRankSelectToggled(
											!rankSelectToggled
										);
									else masterItem(name, !mastered);
								}
							}
						}}>
						{name +
							((item.maxLvl || 30) !== 30
								? ` [${
										(partialRank ? partialRank + "/" : "") +
										item.maxLvl
								  }]`
								: "")}
						{mastered && (
							<img src={checkmark} className="checkmark" alt="" />
						)}
					</Button>
				</div>
			</PaginatedTooltip>
		</>
	);
}

CategoryItem.propTypes = {
	name: PropTypes.string.isRequired,
	item: PropTypes.shape(itemShape).isRequired
};

export default CategoryItem;
