function hashCode(str) {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h * 31 + str.charCodeAt(i)) | 0;
	}
	return h >>> 0;
}

function assignGroup(uid, groups) {
	return hashCode(uid) % groups;
}

export { hashCode, assignGroup };
