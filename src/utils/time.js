export function secondsToDuration(seconds) {
    let days = Math.floor(seconds / 86400);
    let hours = Math.floor(seconds % 86400 / 3600);
    let minutes = Math.floor(seconds % 3600 / 60);
    seconds = seconds % 60;
    return {days: days, hours: hours, minutes: minutes, seconds: seconds};
}

export function detailedTime(seconds) {
    let duration = secondsToDuration(seconds);
    let formattedString = "";
    ["Days", "Hours", "Minutes", "Seconds"].forEach(interval => {
        let amount = duration[interval.toLowerCase()];
        if (amount > 0) {
           formattedString += amount + " " + interval.slice(0, amount > 1 ? interval.length : -1);
        }
    });
    return formattedString;
}