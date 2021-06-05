import classNames from "classnames";
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import Tooltip from "./Tooltip";

const PaginatedTooltipContext = createContext({
	title: "",
	setTitle: () => {}
});

function PaginatedTooltip(props) {
	const [title, setTitle] = useState("");
	return (
		<PaginatedTooltipContext.Provider value={{ title, setTitle }}>
			<PaginatedTooltipWrapper content={props.content}>
				{props.children}
			</PaginatedTooltipWrapper>
		</PaginatedTooltipContext.Provider>
	);
}

function PaginatedTooltipTitle(props) {
	const { setTitle } = useContext(PaginatedTooltipContext);
	useEffect(() => setTitle(props.title), [setTitle, props.title]);
	return null;
}

function PaginatedTooltipWrapper(props) {
	let content = props.content.props.children;
	if (!Array.isArray(content)) content = [content];
	content = content.filter(c => c !== undefined);

	const [visible, setVisible] = useState(false);
	const [page, setPage] = useState(0);
	const maxPage = content.length - 1;
	const { title } = useContext(PaginatedTooltipContext);

	useEffect(() => {
		if (visible) {
			const listener = event => {
				if (event.key === "Shift") {
					event.preventDefault();
					setPage(page => {
						return page === maxPage ? 0 : ++page;
					});
				}
			};
			window.addEventListener("keydown", listener);
			return () => window.removeEventListener("keydown", listener);
		}
	}, [visible, maxPage]);
	useEffect(() => setPage(0), [visible]);

	return (
		<Tooltip
			title={
				maxPage === 0 ? (
					title
				) : (
					<>
						{title}
						<div className="pagination-ui">
							{Array.from(new Array(maxPage + 1)).map(
								(value, p) => {
									return (
										<div
											className={classNames(
												"pagination-page",
												{
													"pagination-page-current":
														p === page
												}
											)}
										/>
									);
								}
							)}
							<span className="pagination-key">Shift</span>
						</div>
					</>
				)
			}
			content={content[page]}
			onVisibilityChange={setVisible}>
			{props.children}
		</Tooltip>
	);
}

PaginatedTooltip.propTypes = PaginatedTooltipWrapper.propTypes = {
	content: PropTypes.node,
	children: PropTypes.node
};

PaginatedTooltipTitle.propTypes = {
	title: PropTypes.string.isRequired
};

export default PaginatedTooltip;
export { PaginatedTooltipTitle };
