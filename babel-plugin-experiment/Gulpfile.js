const gulp = require("gulp");
const babel = require("gulp-babel");
const watch = require("gulp-watch");
const through = require("through2");
const path = require("path");
const webpack = require("webpack-stream");
const merge = require("merge-stream");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const base = __dirname;

const pkgToSource = pkg => `packages/${pkg}/src/**/*.js`;
const sources = [
    "babel-plugin-proposal-record-and-tuple",
    "record-and-tuple-polyfill",
];
const webpackSources = [
    "record-and-tuple-repl",
];
const babelConfig = {
    presets: ["@babel/preset-env", "@babel/preset-react"],
};

const webpackConfig = {
    mode: process.env.NODE_ENV || "development",
    context: path.resolve("./packages/record-and-tuple-repl"),
    entry: {
        "index": "./src/index.jsx",
    },
    output: {
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.m?jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: babelConfig,
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [new MonacoWebpackPlugin({
        languages: ["javascript"],
    }), new CopyPlugin([
        { from: "src/index.html", to: "index.html" }
    ])],
};

gulp.task("build-infra", () => {
    const builds = sources.map(source => {
        return gulp.src(pkgToSource(source))
            .pipe(babel(babelConfig))
            .pipe(gulp.dest(path.resolve(base, "packages", source, "lib")));
    });
    return merge(...builds);
});

gulp.task("build-repl", () => {
    const builds = webpackSources.map(source => {
        return gulp.src(pkgToSource(source))
            .pipe(webpack(webpackConfig))
            .pipe(gulp.dest(path.resolve(base, "packages", source, "lib")));
    });
    return merge(...builds);
});

gulp.task("watch-repl", () => {
    const builds = webpackSources.map(source => {
        return gulp.src(pkgToSource(source))
            .pipe(webpack(Object.assign({}, webpackConfig, { watch: true })))
            .pipe(gulp.dest(path.resolve(base, "packages", source, "lib")));
    });
    return merge(...builds);
});

gulp.task("build", gulp.series("build-infra", "build-repl"));

gulp.task("watch-infra", gulp.series("build-infra", function () {
    watch(source.map(pkgToSource), { debounceDelay: 200 }, gulp.task("build-infra"));
}));
