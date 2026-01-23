export const medianTimestamp = (timestamps: string[]): number => {
    if (!timestamps || timestamps.length === 0) return 0;
    const sorted = timestamps.slice().sort();
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        const mid1 = new Date(sorted[mid - 1]).getTime();
        const mid2 = new Date(sorted[mid]).getTime();
        return (mid1 + mid2) / 2;
    }
    return new Date(sorted[mid]).getTime();
};