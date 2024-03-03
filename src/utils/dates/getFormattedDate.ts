const getFormattedDateFromUnixTimestamp = (date: string): string => {
    const dateObj: Date = new Date(date);

    return `${dateObj?.getDate()}-${dateObj?.getMonth() + 1}-${dateObj?.getFullYear()}`;
};

export { getFormattedDateFromUnixTimestamp };