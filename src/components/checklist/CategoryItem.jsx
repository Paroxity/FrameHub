import classNames from "classnames";
import PropTypes from "prop-types";
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
		unmasterItem,
		mastered,
		masteryRankLocked,
		hidden
	} = useStore(
		state => ({
			type: state.type,
			masterItem: state.masterItem,
			unmasterItem: state.unmasterItem,
			mastered: state.itemsMastered.includes(name),
			masteryRankLocked: (item.mr || 0) > state.masteryRank,
			hidden:
				(state.hideMastered && state.itemsMastered.includes(name)) ||
				(state.hideFounders && foundersItems.includes(name))
		}),
		shallow
	);

	return hidden ? null : (
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
						if (e.ctrlKey) {
							window.open(
								item.wiki ||
									`https://warframe.fandom.com/wiki/${name}`
							);
						} else {
							if (type !== SHARED)
								mastered
									? unmasterItem(name)
									: masterItem(name);
						}
					}}>
					{name +
						((item.maxLvl || 30) !== 30 ? ` [${item.maxLvl}]` : "")}
					{mastered && (
						<img src={checkmark} className="checkmark" alt="" />
					)}
				</Button>
			</div>
		</PaginatedTooltip>
	);
}

CategoryItem.propTypes = {
	name: PropTypes.string.isRequired,
	item: PropTypes.shape(itemShape).isRequired
};

export default CategoryItem;
