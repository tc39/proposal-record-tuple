module.exports = function (api) {
    api.cache(true);

    const presets = [
        "@babel/preset-env",
    ];
    const plugins = [
        ["@babel/plugin-proposal-record-and-tuple", { hash: true, bar: true }],
    ];

    return {
        presets,
        plugins,
    };
}
