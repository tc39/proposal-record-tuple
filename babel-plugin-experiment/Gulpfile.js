const gulp = require("gulp");
const babel = require("gulp-babel");
const watch = require("gulp-watch");

const sources = "./src/*.js";

gulp.task("build", () => {

    return gulp.src("src/*.js")
        .pipe(babel())
        .pipe(gulp.dest("lib/"));
});

gulp.task("watch", gulp.series("build", function () {
    watch(sources, { debounceDelay: 200 }, gulp.task("build"));
}));
