import PropTypes from "prop-types";
import React from "react";
import { itemShape, relicRarity, relicTiers } from "../../utils/items";
import { PaginatedTooltipTitle } from "../PaginatedTooltip";

function ItemRelicTooltip({ item, name }) {
	return (
		<div className="item-tooltip">
			<PaginatedTooltipTitle title="Relics" />
			{item.vaulted ? (
				`${name} is currently in the Prime Vault.`
			) : (
				<div>
					{Object.entries(item.relics).map(([i, relics]) => {
						return (
							<div key={i}>
								<span>{i}</span>
								<div className="relics">
									{Object.entries(relics)
										.filter(
											([, relicData]) =>
												!relicData.vaulted
										)
										.map(([relicName, relicData]) => {
											const rarity =
												relicRarity[relicData.rarity];
											return (
												<span
													key={relicName}
													style={{
														display: "flex",
														alignItems: "center",
														gap: "4px"
													}}>
													<img
														src={`https://cdn.warframestat.us/img/${relicTiers
															.find(tier =>
																relicName.startsWith(
																	tier
																)
															)
															.toLowerCase()}-radiant.png`}
														alt=""
														width="24px"
													/>
													{relicName} (
													<span
														className={`relic relic-rarity-${rarity.toLowerCase()}`}>
														{rarity}
													</span>
													)
												</span>
											);
										})}
								</div>
							</div>
						);
					})}
					<span className="vaulted-relic-disclaimer">
						Vaulted relics are not displayed.
					</span>
				</div>
			)}
		</div>
	);
}

ItemRelicTooltip.propTypes = {
	item: PropTypes.shape(itemShape)
};

export default ItemRelicTooltip;
