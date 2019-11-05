const gulp = require("gulp");
const babel = require("gulp-babel");
const watch = require("gulp-watch");
const through = require("through2");
const path = require("path");

const base = __dirname;
function swapSrcWithLib(file) {
    const parts = file.relative.split(path.sep);
    parts[1] = "lib";
    const newRelative = parts.join(path.sep);
    return path.resolve(base, "packages", newRelative);
}

function rename(fn) {
    return through.obj(function (file, enc, callback) {
        file.path = fn(file);
        console.log(file.path);
        callback(null, file);
    })
}

const sources = "./packages/*/src/**/*.js";

gulp.task("build", () => {

    return gulp.src(sources)
        .pipe(babel())
        .pipe(rename(file => swapSrcWithLib(file)))
        .pipe(gulp.dest(path.resolve(base, "packages")));
});

gulp.task("watch", gulp.series("build", function () {
    watch(sources, { debounceDelay: 200 }, gulp.task("build"));
}));
