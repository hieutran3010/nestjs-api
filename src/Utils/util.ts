const countSkipItem = (pageNumber, pageSize): number => {
    const skipItem = (+pageNumber - 1) * +pageSize;
    return skipItem;
};

export { countSkipItem };