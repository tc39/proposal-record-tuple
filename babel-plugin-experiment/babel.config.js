module.exports = function (api) {
    api.cache(true);

    const presets = [];
    const plugins = [
        ["@babel/plugin-proposal-record-and-tuple", { hash: true, bar: true }],
    ];

    return {
        presets,
        plugins,
    };
}
