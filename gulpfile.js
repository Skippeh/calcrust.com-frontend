var gulp = require("gulp"),
	usemin = require("gulp-usemin"),
	connect = require("gulp-connect"),
	minifyCss = require("gulp-minify-css"),
	minifyJs = require("gulp-uglify"),
	concat = require("gulp-concat"),
	sass = require("gulp-sass"),
	rename = require("gulp-rename"),
	minifyHtml = require("gulp-htmlmin"),
	ngHtml2Js = require("gulp-ng-html2js"),
	babel = require("gulp-babel"),
	print = require("gulp-print")
	livereload = require("gulp-livereload")
	hashSrc = require("gulp-hash-src");

var paths = {
	scripts: "src/js/**/*.js",
	styles: "src/scss/**/*.scss",
	images: "src/img/**/*.*",
	templates: "src/templates/**/*.html",
	index: "src/index.html",
	fonts: "src/fonts/**/*.*"
}

gulp.task("usemin", () => {
	return gulp.src(paths.index)
		.pipe(minifyHtml({ collapseWhitespace: true }))
		.pipe(usemin({
			js: [minifyJs(), "concat"],
			css: [minifyCss({ keepSpecialComments: false }), "concat"]
		}))
		.pipe(gulp.dest("dist/"));
});

gulp.task("build-assets", ["copy-fonts"]);

gulp.task("copy-fonts", () => {
	return gulp.src(paths.fonts)
	.pipe(gulp.dest("dist/fonts"));
});

gulp.task("build-custom", ["custom-images", "custom-js", "custom-sass", "custom-templates"]);

gulp.task("custom-images", () => {
	return gulp.src(paths.images)
		.pipe(gulp.dest("dist/img"));
});

gulp.task("custom-js", () => {
	return gulp.src(paths.scripts)
		.pipe(babel({
			presets: ["es2015", "stage-0"]
		}))
		.pipe(minifyJs())
		.pipe(concat("scripts.min.js"))
		.pipe(gulp.dest("dist/js"));
});

gulp.task("custom-sass", () => {
	return gulp.src(paths.styles)
		.pipe(sass())
		.pipe(minifyCss())
		.pipe(concat("style.min.css"))
		.pipe(gulp.dest("dist/css"));
});

gulp.task("custom-templates", () => {
	return gulp.src(paths.templates)
		.pipe(minifyHtml({ collapseWhitespace: true }))
		.pipe(ngHtml2Js({
			moduleName: "templates",
			prefix: "templates/"
		}))
		.pipe(minifyJs())
		.pipe(concat("templates.min.js"))
		.pipe(gulp.dest("dist/js"))
});

gulp.task("watch", () => {
	livereload.listen();
	gulp.watch(paths.index, ["usemin", "hash"]);
	gulp.watch(paths.styles, ["custom-sass", "hash"]);
	gulp.watch(paths.scripts, ["custom-js"]);
	gulp.watch(paths.templates, ["custom-templates", "hash"]);
});

gulp.task("webserver", () => {
	connect.server({
		root: "dist",
		port: 8080,
		fallback: "dist/index.html" // 404 results will return the index file.
	});
});

gulp.task("hash", () => {
	return gulp.src(["dist/**/*.html", "dist/**/*.css"])
		.pipe(hashSrc({
			build_dir: "dist",
			src_path: "dist"
		}))
		.pipe(gulp.dest("dist"));
});

gulp.task("build", ["usemin", "build-assets", "build-custom", "hash"]);
gulp.task("default", ["build", "webserver", "watch"]);